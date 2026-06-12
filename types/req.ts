import type { Prisma } from '@prisma/client';

export const RepairRequestWithRelations = {
    assignedStaff: true,
    attachments: true,
    customer: true,
    device: true,
    messageChannel: true,
    notes: { include: { author: true } },
    workItems: { include: { workItemType: true } },
    partOrders: { include: { catalogPart: true } },
} satisfies Prisma.RepairRequestInclude;

export type RepairRequestWithRelationsType = Prisma.RepairRequestGetPayload<{
    include: typeof RepairRequestWithRelations;
}>;


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
} satisfies Prisma.RepairDeviceInclude;

export type RepairDeviceWithRelationsType = Prisma.RepairDeviceGetPayload<{
    include: typeof RepairDeviceWithRelations;
}>;
