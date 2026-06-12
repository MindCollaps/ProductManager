import { RepairRequestWithRelations } from '~~/types/req';
import { crud } from '../../../../utils/backend/crud';
import { createApiError } from '~~/server/utils/apiResponses';

export default crud(prisma.repairRequest, {
    resourceName: 'Request',
    list: {
        run: async ({ event }) => {
            const customerId = event.context.user?.userId;

            if (!customerId) {
                throw createApiError('Unauthorized', 401);
            }

            return prisma.repairRequest.findMany({
                where: { customerId },
                orderBy: { queuePosition: 'asc' },
                include: RepairRequestWithRelations,
            });
        },
    },
});
