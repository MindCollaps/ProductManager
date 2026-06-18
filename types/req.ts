import type { Prisma } from '@prisma/client';

type WorkItemTypeWithDefault = Prisma.WorkItemTypeGetPayload<object> & {
    laborMinutes: number | null;
    isDefault: boolean;
};

export const RepairWorkItemWithRelations = {
    assignedStaff: true,
    createdBy: true,
    device: true,
    workItemType: true,
} satisfies Prisma.RepairWorkItemInclude;

type PrismaRepairWorkItemWithRelationsType = Prisma.RepairWorkItemGetPayload<{
    include: typeof RepairWorkItemWithRelations;
}>;

export type RepairWorkItemWithRelationsType = Omit<PrismaRepairWorkItemWithRelationsType, 'workItemType'> & {
    workItemType: WorkItemTypeWithDefault;
};

export const RepairRequestWithRelations = {
    assignedStaff: true,
    attachments: true,
    customer: true,
    device: {
        include: {
            device: {
                include: {
                    deviceBrand: true,
                },
            },
        },
    },
    messageChannel: true,
    statusHistory: {
        orderBy: {
            startedAt: 'desc',
        },
    },
    notes: { include: { author: true } },
    workItems: {
        include: RepairWorkItemWithRelations,
        orderBy: [
            { orderIndex: 'asc' },
            { createdAt: 'asc' },
        ],
    },
    partOrders: { include: { catalogPart: true } },
} satisfies Prisma.RepairRequestInclude;

type PrismaRepairRequestWithRelationsType = Prisma.RepairRequestGetPayload<{
    include: typeof RepairRequestWithRelations;
}>;

export type RepairRequestWithRelationsType = Omit<PrismaRepairRequestWithRelationsType, 'workItems'> & {
    workItems: RepairWorkItemWithRelationsType[];
};

export const DeviceWithRelations = {
    deviceCategories: {
        include: {
            category: true,
        },
    },
    deviceBrand: true,
} satisfies Prisma.DeviceInclude;

export type DeviceWithRelationsType = Prisma.DeviceGetPayload<{
    include: typeof DeviceWithRelations;
}>;

export const RepairDeviceWithRelations = {
    device: {
        include: {
            deviceBrand: true,
        },
    },
    request: true,
} satisfies Prisma.RepairDeviceInclude;

export type RepairDeviceWithRelationsType = Prisma.RepairDeviceGetPayload<{
    include: typeof RepairDeviceWithRelations;
}>;
