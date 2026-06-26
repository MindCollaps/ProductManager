import { RepairRequestStatus, RepairStatus } from '@prisma/client';
import { z } from 'zod';

import { createApiError } from '~~/server/utils/apiResponses';
import { applyRepairStatusAndNotify } from '~~/server/utils/backend/repairStatus';

const repairStatusSchema = z.object({
    status: z.nativeEnum(RepairStatus),
    note: z.string().max(250).optional(),
}).strict();

export default defineEventHandler(async event => {
    const requestId = event.context.params?.id;
    const userId = event.context.user?.userId ?? null;

    if (!requestId) {
        throw createApiError('Request id missing', 400);
    }

    const body = repairStatusSchema.parse(await readBody(event));

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

    if (request.status === RepairRequestStatus.CANCELLED || request.status === RepairRequestStatus.REJECTED) {
        throw createApiError('Cannot update repair status for closed request', 400);
    }

    const statusHistory = await applyRepairStatusAndNotify(requestId, body.status, request.customerId, userId, body.note);

    return {
        message: 'Repair status updated',
        data: statusHistory,
    };
});
