import { RepairWorkItemWithRelations } from '~~/types/req';
import { repairWorkItemCreateSchema } from '~~/server/utils/backend/validation';
import { createApiError } from '~~/server/utils/apiResponses';
import { createDefaultWorkItemsForRequest } from '~~/server/utils/backend/workItems';
import { getRouterParam, readBody } from 'h3';

export default defineEventHandler(async event => {
    const requestId = getRouterParam(event, 'id');

    if (!requestId) {
        throw createApiError('Request id missing', 400);
    }

    if (event.method === 'GET') {
        const request = await prisma.repairRequest.findUnique({
            where: { id: requestId },
            select: {
                workItems: {
                    include: RepairWorkItemWithRelations,
                    orderBy: [
                        { orderIndex: 'asc' },
                        { createdAt: 'asc' },
                    ],
                },
            },
        });

        if (!request) {
            throw createApiError('Request not found', 404);
        }

        return request.workItems;
    }

    if (event.method === 'POST') {
        const body = repairWorkItemCreateSchema.parse(await readBody(event));
        const createdById = event.context.user?.userId ?? null;
        const completedAt = body.completedAt ? new Date(body.completedAt) : null;

        const workItem = await prisma.repairWorkItem.create({
            data: {
                requestId,
                createdById,
                deviceId: null,
                assignedStaffId: body.assignedStaffId ?? null,
                workItemTypeId: body.workItemTypeId,
                title: body.title,
                description: body.description ?? null,
                orderIndex: body.orderIndex,
                status: body.status,
                completedAt: body.status === 'DONE' ? (completedAt ?? new Date()) : completedAt,
                laborMinutes: body.laborMinutes ?? null,
            },
            include: RepairWorkItemWithRelations,
        });

        return { message: 'Work item created', data: workItem };
    }

    throw createApiError('Method not allowed', 405);
});
