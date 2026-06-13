import { createApiError } from '~~/server/utils/apiResponses';

type CreateDefaultWorkItemsInput = {
    requestId: string;
    deviceId?: string | null;
    createdById?: string | null;
};

export async function createDefaultWorkItemsForRequest(input: CreateDefaultWorkItemsInput) {
    const request = await prisma.repairRequest.findUnique({
        where: { id: input.requestId },
        select: {
            id: true,
            status: true,
            device: {
                select: {
                    id: true,
                },
            },
            workItems: {
                select: { workItemTypeId: true },
            },
        },
    });

    if (!request) {
        throw createApiError('Request not found', 404);
    }

    const existingTypeIds = new Set(request.workItems.map(workItem => workItem.workItemTypeId));

    const defaultTypes = await prisma.workItemType.findMany({
        where: { isDefault: true },
        orderBy: { sortOrder: 'asc' },
    });

    const workItemsToCreate = defaultTypes
        .filter(workItemType => !existingTypeIds.has(workItemType.id))
        .map(workItemType => ({
            requestId: request.id,
            deviceId: input.deviceId ?? request.device?.id ?? null,
            createdById: input.createdById ?? null,
            workItemTypeId: workItemType.id,
            title: workItemType.name,
            description: workItemType.description,
            orderIndex: workItemType.sortOrder,
            laborMinutes: workItemType.laborMinutes,
            status: 'PENDING' as const,
        }));

    if (workItemsToCreate.length === 0) {
        return prisma.repairWorkItem.findMany({
            where: { requestId: request.id },
            include: {
                assignedStaff: true,
                createdBy: true,
                device: true,
                workItemType: true,
            },
            orderBy: [
                { orderIndex: 'asc' },
                { createdAt: 'asc' },
            ],
        });
    }

    const createdWorkItems = await prisma.repairWorkItem.createMany({
        data: workItemsToCreate,
    });

    if (createdWorkItems.count === 0) {
        return [];
    }

    return prisma.repairWorkItem.findMany({
        where: { requestId: request.id },
        include: {
            assignedStaff: true,
            createdBy: true,
            device: true,
            workItemType: true,
        },
        orderBy: [
            { orderIndex: 'asc' },
            { createdAt: 'asc' },
        ],
    });
}