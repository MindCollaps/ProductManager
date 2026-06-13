import { crud } from '../../../../utils/backend/crud';
import { repairDeviceCreateSchema } from '~~/server/utils/backend/validation';
import { RepairDeviceWithRelations } from '~~/types/req';

export default crud(prisma.repairDevice, {
    resourceName: 'Repair Device',
    list: {
        run: async () => {
            const devices = await prisma.repairDevice.findMany({
                orderBy: { displayName: 'asc' },
                include: RepairDeviceWithRelations,
            });

            return devices;
        },
    },
    create: {
        schema: repairDeviceCreateSchema,
        run: async ({ body, event }) => {
            const userId = event.context.user?.userId ?? null;

            const newDevice = await prisma.$transaction(async transaction => {
                const createdRepairDevice = await transaction.repairDevice.create({
                    data: {
                        displayName: body.displayName,
                        serialNumber: body.serialNumber,
                        notes: body.notes,
                        deviceId: body.deviceId,
                        requestId: body.requestId,
                    },
                    include: RepairDeviceWithRelations,
                });

                await transaction.repairRequest.update({
                    where: { id: body.requestId },
                    data: {
                        status: 'ACCEPTED',
                        acceptedAt: new Date(),
                    },
                });

                const existingTypes = await transaction.repairWorkItem.findMany({
                    where: { requestId: body.requestId },
                    select: { workItemTypeId: true },
                });

                const existingTypeIds = new Set(existingTypes.map(item => item.workItemTypeId));
                const defaultTypes = await transaction.workItemType.findMany({
                    where: { isDefault: true },
                    orderBy: { sortOrder: 'asc' },
                });

                const defaultWorkItems = defaultTypes
                    .filter(workItemType => !existingTypeIds.has(workItemType.id))
                    .map(workItemType => ({
                        requestId: body.requestId,
                        deviceId: createdRepairDevice.id,
                        createdById: userId,
                        assignedStaffId: null,
                        workItemTypeId: workItemType.id,
                        title: workItemType.name,
                        description: workItemType.description,
                        orderIndex: workItemType.sortOrder,
                        laborMinutes: workItemType.laborMinutes,
                        status: 'PENDING' as const,
                    }));

                if (defaultWorkItems.length > 0) {
                    await transaction.repairWorkItem.createMany({
                        data: defaultWorkItems,
                    });
                }

                return createdRepairDevice;
            });

            return { message: 'Repair Device created', data: newDevice };
        },
    },
});
