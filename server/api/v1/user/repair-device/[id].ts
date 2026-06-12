import { crud } from '../../../../utils/backend/crud';
import { repairDeviceCreateSchema } from '~~/server/utils/backend/validation';
import { RepairDeviceWithRelations } from '~~/types/req';

export default crud(prisma.repairDevice, {
    resourceName: 'Repair Device',
    get: {
        include: RepairDeviceWithRelations,
        run: async ({ event, record }) => {
            const customerId = event.context.user?.userId;

            if (!customerId) {
                throw createApiError('Unauthorized', 401);
            }

            if (!record) {
                throw createApiError('Request not found', 404);
            }

            if (record.request?.customerId !== customerId) {
                throw createApiError('Request not found', 404);
            }

            return record;
        },
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
});
