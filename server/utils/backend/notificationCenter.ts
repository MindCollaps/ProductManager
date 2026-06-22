import { NotificationStatus } from '@prisma/client';

import { sendNotificationDigestEmail } from '~~/server/utils/mail';
import { socketServer } from '~~/server/plugins/socket.io.server';
import { getUnreadNotificationCount, getUserRoomName } from '~~/server/utils/backend/chat';
import { prisma } from '~~/server/utils/prisma';

export interface NotificationCreateInput {
    userId: string;
    requestId?: string | null;
    messageChannelId?: string | null;
    subject: string;
    body: string;
}

interface NotificationDigestRow {
    id: string;
    userId: string;
    subject: string;
    body: string;
    createdAt: Date;
    user: {
        email: string;
        username: string | null;
    };
}

export async function createNotification(input: NotificationCreateInput) {
    const created = await prisma.notification.create({
        data: {
            userId: input.userId,
            requestId: input.requestId ?? null,
            messageChannelId: input.messageChannelId ?? null,
            status: NotificationStatus.PENDING,
            subject: input.subject,
            body: input.body,
        },
    });

    await emitNotificationBadgeForUser(input.userId);

    return created;
}

export async function createNotificationsForUsers(inputs: ReadonlyArray<NotificationCreateInput>) {
    if (inputs.length === 0) {
        return;
    }

    await prisma.notification.createMany({
        data: inputs.map(item => ({
            userId: item.userId,
            requestId: item.requestId ?? null,
            messageChannelId: item.messageChannelId ?? null,
            status: NotificationStatus.PENDING,
            subject: item.subject,
            body: item.body,
        })),
    });

    const uniqueUserIds = Array.from(new Set(inputs.map(item => item.userId)));

    await Promise.all(uniqueUserIds.map(async userId => {
        await emitNotificationBadgeForUser(userId);
    }));
}

function groupDigestRowsByUser(rows: ReadonlyArray<NotificationDigestRow>) {
    const grouped = new Map<string, NotificationDigestRow[]>();

    for (const row of rows) {
        const current = grouped.get(row.userId) ?? [];
        current.push(row);
        grouped.set(row.userId, current);
    }

    return grouped;
}

export async function sendNotificationDigestEmails() {
    const rows = await prisma.notification.findMany({
        where: {
            status: NotificationStatus.PENDING,
            emailDigestSentAt: null,
        },
        orderBy: {
            createdAt: 'asc',
        },
        take: 500,
        select: {
            id: true,
            userId: true,
            subject: true,
            body: true,
            createdAt: true,
            user: {
                select: {
                    email: true,
                    username: true,
                },
            },
        },
    });

    if (rows.length === 0) {
        return { processedUsers: 0, processedNotifications: 0 };
    }

    const grouped = groupDigestRowsByUser(rows);
    let processedUsers = 0;
    let processedNotifications = 0;

    for (const [userId, userRows] of grouped.entries()) {
        const username = userRows[0]?.user.username ?? 'there';
        const email = userRows[0]?.user.email;

        if (!email) {
            console.warn(`[NotificationDigest] User ${ userId } has no email, skipping`);
            continue;
        }

        try {
            await sendNotificationDigestEmail(
                email,
                username,
                userRows.map(item => ({
                    id: item.id,
                    subject: item.subject,
                    body: item.body,
                    createdAt: item.createdAt,
                })),
            );

            await prisma.notification.updateMany({
                where: {
                    id: {
                        in: userRows.map(item => item.id),
                    },
                },
                data: {
                    emailDigestSentAt: new Date(),
                },
            });

            processedUsers += 1;
            processedNotifications += userRows.length;
        }
        catch (error) {
            console.error(`[NotificationDigest] Failed for user ${ userId }`, error);
        }
    }

    return {
        processedUsers,
        processedNotifications,
    };
}

export async function emitNotificationBadgeForUser(userId: string) {
    if (!socketServer) {
        return;
    }

    const unreadCount = await getUnreadNotificationCount(userId);
    socketServer.to(getUserRoomName(userId)).emit('notification:badge', {
        unreadCount,
    });
}
