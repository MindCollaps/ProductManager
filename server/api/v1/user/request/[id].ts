import { crud } from '../../../../utils/backend/crud';
import { RepairRequestWithRelations } from '~~/types/req';
import { createApiError } from '~~/server/utils/apiResponses';

export default crud(prisma.repairRequest, {
    resourceName: 'Request',
    get: {
        include: RepairRequestWithRelations,
        run: async ({ event, record }) => {
            const customerId = event.context.user?.userId;

            if (!customerId) {
                throw createApiError('Unauthorized', 401);
            }

            if (!record) {
                throw createApiError('Request not found', 404);
            }

            if (record.customerId !== customerId) {
                throw createApiError('Request not found', 404);
            }

            return record;
        },
    },
});
