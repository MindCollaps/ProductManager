import { crud } from '../../../../utils/backend/crud';
import { RepairDeviceWithRelations } from '~~/types/req';

export default crud(prisma.repairDevice, {
    resourceName: 'Repair Device',
    list: {
        run: async ({ event }) => {
            const customerId = event.context.user?.userId;

            if (!customerId) {
                throw createApiError('Unauthorized', 401);
            }

            const devices = await prisma.repairDevice.findMany({
                where: {
                    request: {
                        customerId,
                    },
                },
                orderBy: { displayName: 'asc' },
                include: RepairDeviceWithRelations,
            });

            return devices;
        },
    },
});
