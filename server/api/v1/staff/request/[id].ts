import { crud } from '../../../../utils/backend/crud';
import { RepairRequestWithRelations } from '~~/types/req';

export default crud(prisma.repairRequest, {
    resourceName: 'Request',
    get: {
        include: RepairRequestWithRelations,
        run: async ({ record }) => record,
    },
});
