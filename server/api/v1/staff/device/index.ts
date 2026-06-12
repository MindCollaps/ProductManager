import type { DeviceWithCategories } from '~~/types/device';

import { crud } from '../../../../utils/backend/crud';
import { DeviceWithRelations } from '~~/types/req';

export default crud(prisma.device, {
    resourceName: 'Device',
    list: {
        run: async () => {
            const devices = await prisma.device.findMany({
                orderBy: { name: 'asc' },
                include: DeviceWithRelations,
            });

            return devices as DeviceWithCategories[];
        },
    },
});
