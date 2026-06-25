import { crud } from '../../../../utils/backend/crud';
import { DeviceWithRelations } from '~~/types/req';

export default crud(prisma.device, {
    resourceName: 'Device',
    list: {
        run: async () => {
            return prisma.device.findMany({
                orderBy: { name: 'asc' },
                include: DeviceWithRelations,
            });
        },
    },
});
