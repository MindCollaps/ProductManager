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
});
