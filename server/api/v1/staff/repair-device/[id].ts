import { crud } from '../../../../utils/backend/crud';
import { repairDeviceCreateSchema } from '~~/server/utils/backend/validation';
import { RepairDeviceWithRelations } from '~~/types/req';

export default crud(prisma.repairDevice, {
    resourceName: 'Repair Device',
    get: {
        include: RepairDeviceWithRelations,
        run: async ({ record }) => record,
    },
    update: {
        schema: repairDeviceCreateSchema.partial(),
        notFoundMessage: 'Repair Device not found',
        run: async ({ id, body }) => {
            const updatedData: Record<string, unknown> = {};

            if (body.displayName) {
                updatedData.displayName = body.displayName;
            }

            if (body.serialNumber) {
                updatedData.serialNumber = body.serialNumber;
            }

            if (body.notes) {
                updatedData.notes = body.notes;
            }

            const updatedDevice = await prisma.repairDevice.update({
                where: { id },
                data: updatedData as any,
            });

            return { message: 'Repair Device updated', data: updatedDevice };
        },
    },
    delete: {
        notFoundMessage: 'Device not found',
        run: async ({ id }: { id: string }) => {
            await prisma.repairDevice.delete({
                where: { id },
            });

            return { message: 'Repair Device deleted' };
        },
    },
});
