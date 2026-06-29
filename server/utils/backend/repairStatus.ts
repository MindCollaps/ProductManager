import { RepairRequestStatus, RepairStatus, RepairWorkItemStatus } from '@prisma/client';

import { createApiError } from '~~/server/utils/apiResponses';
import { createNotification } from '~~/server/realtime/notifications';
import { getRepairRoomName } from '~~/server/realtime/chat';
import { socketServer } from '~~/server/plugins/socket.io.server';
import { prisma } from '~~/server/utils/prisma';
import { getMailConfig, sendRepairReceivedEmail, sendPackageShippedEmail } from '~~/server/utils/mail';

const REPAIR_STATUS_PROGRESS_ORDER: Partial<Record<RepairStatus, number>> = {
    [RepairStatus.RECEIVED]: 10,
    [RepairStatus.IN_DIAGNOSIS]: 20,
    [RepairStatus.WAITING_FOR_PARTS]: 30,
    [RepairStatus.IN_REPAIR]: 40,
    [RepairStatus.IN_QA]: 50,
    [RepairStatus.IN_OUTGOING]: 60,
    [RepairStatus.ON_THE_WAY_TO_CUSTOMER]: 70,
    [RepairStatus.DELIVERED]: 80,
    [RepairStatus.ARCHIVED]: 90,
};

function isBackwardAutoTransition(currentStatus: RepairStatus, nextStatus: RepairStatus) {
    const currentOrder = REPAIR_STATUS_PROGRESS_ORDER[currentStatus];
    const nextOrder = REPAIR_STATUS_PROGRESS_ORDER[nextStatus];

    if (currentOrder === undefined || nextOrder === undefined) {
        return false;
    }

    return nextOrder < currentOrder;
}

export async function setRepairStatus(requestId: string, status: RepairStatus, createdById?: string | null, note?: string) {
    const request = await prisma.repairRequest.findUnique({
        where: { id: requestId },
        include: {
            device: {
                select: {
                    id: true,
                },
            },
        },
    });

    if (!request) {
        throw createApiError('Request not found', 404);
    }

    const latest = await prisma.repairStatusHistory.findFirst({
        where: { requestId },
        orderBy: {
            startedAt: 'desc',
        },
    });

    if (latest?.status === status) {
        return latest;
    }

    if (latest && !latest.endedAt) {
        const endTime = new Date();
        const durationMinutes = Math.max(0, Math.round((endTime.getTime() - latest.startedAt.getTime()) / 60000));

        await prisma.repairStatusHistory.update({
            where: { id: latest.id },
            data: {
                endedAt: endTime,
                durationMinutes,
            },
        });
    }

    const created = await prisma.repairStatusHistory.create({
        data: {
            requestId,
            deviceId: request.device?.id ?? null,
            status,
            note: note ?? null,
            createdById: createdById ?? null,
        },
    });

    socketServer?.to(getRepairRoomName(requestId)).emit('repair:update', { requestId });

    return created;
}

export async function getLatestRepairStatus(requestId: string) {
    return prisma.repairStatusHistory.findFirst({
        where: { requestId },
        orderBy: {
            startedAt: 'desc',
        },
    });
}

const STATUS_EMAIL_SUBJECTS: Partial<Record<RepairStatus, string>> = {
    [RepairStatus.RECEIVED]: 'We have received your device',
    [RepairStatus.ON_THE_WAY_TO_CUSTOMER]: 'Your device is on its way',
};

async function sendStatusEmailIfNeeded(status: RepairStatus, requestId: string): Promise<boolean> {
    if (!(status in STATUS_EMAIL_SUBJECTS)) {
        return false;
    }

    const data = await prisma.repairRequest.findUnique({
        where: { id: requestId },
        select: {
            subject: true,
            customer: {
                select: { email: true, username: true },
            },
        },
    });

    if (!data) {
        return false;
    }

    const config = getMailConfig();
    const requestUrl = `${ config.appBaseUrl }/request/${ requestId }`;
    const customerName = data.customer.username ?? data.customer.email;

    try {
        if (status === RepairStatus.RECEIVED) {
            await sendRepairReceivedEmail(data.customer.email, customerName, data.subject, requestUrl);
        }
        else {
            await sendPackageShippedEmail(data.customer.email, customerName, data.subject, requestUrl);
        }

        return true;
    }
    catch (error) {
        console.error(`[Mail] Failed to send status email for ${ status } on request ${ requestId }`, error);
        return false;
    }
}

async function notifyCustomerOfStatus(requestId: string, status: RepairStatus, customerId: string) {
    const emailSent = await sendStatusEmailIfNeeded(status, requestId);

    await createNotification({
        userId: customerId,
        requestId,
        subject: STATUS_EMAIL_SUBJECTS[status] ?? 'Repair status changed',
        body: `Repair status is now ${ status }`,
        skipDigest: emailSent,
    });
}

async function setRepairStatusAndNotifyCustomer(
    requestId: string,
    status: RepairStatus,
    customerId: string,
    createdById?: string | null,
) {
    const latest = await getLatestRepairStatus(requestId);

    if (latest?.status === status) {
        return latest;
    }

    if (latest?.status && isBackwardAutoTransition(latest.status, status)) {
        return latest;
    }

    const statusHistory = await setRepairStatus(requestId, status, createdById ?? null);
    await notifyCustomerOfStatus(requestId, status, customerId);

    return statusHistory;
}

export async function applyRepairStatusAndNotify(
    requestId: string,
    status: RepairStatus,
    customerId: string,
    createdById?: string | null,
    note?: string,
) {
    const statusHistory = await setRepairStatus(requestId, status, createdById ?? null, note);
    await notifyCustomerOfStatus(requestId, status, customerId);

    return statusHistory;
}

export async function isRequestArchived(requestId: string) {
    const archivedCount = await prisma.repairStatusHistory.count({
        where: {
            requestId,
            status: RepairStatus.ARCHIVED,
        },
    });

    return archivedCount > 0;
}

export async function syncRepairStatusFromDefaultSteps(requestId: string, createdById?: string | null) {
    const request = await prisma.repairRequest.findUnique({
        where: { id: requestId },
        select: {
            customerId: true,
            id: true,
            status: true,
        },
    });

    if (!request) {
        throw createApiError('Request not found', 404);
    }

    if (request.status !== RepairRequestStatus.ACCEPTED && request.status !== RepairRequestStatus.COMPLETED) {
        return null;
    }

    const workItems = await prisma.repairWorkItem.findMany({
        where: {
            requestId,
        },
        include: {
            workItemType: {
                select: {
                    isDefault: true,
                    sortOrder: true,
                },
            },
        },
    });

    const defaultItems = workItems.filter(item => item.workItemType.isDefault);

    if (defaultItems.length === 0) {
        return null;
    }

    const inProgressItems = workItems.filter(item => item.status === RepairWorkItemStatus.IN_PROGRESS);

    const hasRepairInProgress = inProgressItems.some(item => item.orderIndex >= 30 && item.orderIndex < 90);
    if (hasRepairInProgress) {
        return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.IN_REPAIR, request.customerId, createdById ?? null);
    }

    const hasDiagnosisInProgress = inProgressItems.some(item => item.orderIndex >= 10 && item.orderIndex < 30);
    if (hasDiagnosisInProgress) {
        return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.IN_DIAGNOSIS, request.customerId, createdById ?? null);
    }

    const firstDefaultStep = [...defaultItems].sort((left, right) => {
        if (left.workItemType.sortOrder !== right.workItemType.sortOrder) {
            return left.workItemType.sortOrder - right.workItemType.sortOrder;
        }

        return left.orderIndex - right.orderIndex;
    })[0];

    if (!firstDefaultStep || firstDefaultStep.status !== RepairWorkItemStatus.DONE) {
        return null;
    }

    const completedDefaults = defaultItems.filter(item => item.status === RepairWorkItemStatus.DONE);

    if (completedDefaults.length === 0) {
        return null;
    }

    const allDefaultsCompleted = completedDefaults.length === defaultItems.length;

    if (allDefaultsCompleted) {
        return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.IN_OUTGOING, request.customerId, createdById ?? null);
    }

    const highestCompletedOrder = completedDefaults.reduce((maxOrder, item) => {
        return Math.max(maxOrder, item.orderIndex);
    }, 0);

    if (highestCompletedOrder < 10) {
        return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.RECEIVED, request.customerId, createdById ?? null);
    }

    if (highestCompletedOrder < 30) {
        return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.IN_DIAGNOSIS, request.customerId, createdById ?? null);
    }

    if (highestCompletedOrder < 90) {
        return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.IN_REPAIR, request.customerId, createdById ?? null);
    }

    return setRepairStatusAndNotifyCustomer(requestId, RepairStatus.IN_QA, request.customerId, createdById ?? null);
}
