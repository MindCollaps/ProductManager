import { RepairWorkItemWithRelations } from '~~/types/req';
import { repairWorkItemCreateSchema } from '~~/server/utils/backend/validation';
import { createApiError } from '~~/server/utils/apiResponses';
import { getRouterParam, readBody } from 'h3';

export default defineEventHandler(async event => {
    const requestId = getRouterParam(event, 'id');
    const stepId = getRouterParam(event, 'stepId');

    if (!requestId || !stepId) {
        throw createApiError('Step id missing', 400);
    }

    const workItem = await prisma.repairWorkItem.findUnique({
        where: { id: stepId },
    });

    if (!workItem || workItem.requestId !== requestId) {
        throw createApiError('Work item not found', 404);
    }

    if (event.method === 'PUT') {
        const body = repairWorkItemCreateSchema.partial().parse(await readBody(event));
        const completedAt = body.completedAt === undefined ? undefined : (body.completedAt ? new Date(body.completedAt) : null);
        const nextStatus = body.status ?? workItem.status;

        const updatedWorkItem = await prisma.repairWorkItem.update({
            where: { id: stepId },
            data: {
                title: body.title,
                description: body.description,
                orderIndex: body.orderIndex,
                workItemTypeId: body.workItemTypeId,
                assignedStaffId: body.assignedStaffId === undefined ? undefined : body.assignedStaffId,
                laborMinutes: body.laborMinutes,
                status: nextStatus,
                completedAt: completedAt === undefined ? undefined : completedAt,
            },
            include: RepairWorkItemWithRelations,
        });

        return { message: 'Work item updated', data: updatedWorkItem };
    }

    if (event.method === 'DELETE') {
        await prisma.repairWorkItem.delete({
            where: { id: stepId },
        });

        return { message: 'Work item deleted' };
    }

    throw createApiError('Method not allowed', 405);
});
