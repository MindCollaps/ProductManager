import { crud } from '../../../../utils/backend/crud';
import { deviceCreateSchema } from '~~/server/utils/backend/validation';
import { DeviceWithRelations } from '~~/types/req';
import type { Prisma } from '@prisma/client';

export default crud(prisma.device, {
    resourceName: 'Device',
    notFoundMessage: 'Device not found',
    get: {
        include: DeviceWithRelations,
    },
    update: {
        schema: deviceCreateSchema.partial(),
        run: async ({ id, body }) => {
            const data: Prisma.DeviceUpdateInput = {};

            if (body.name) data.name = body.name;
            if (body.description) data.description = body.description;
            if (body.categories) {
                data.deviceCategories = {
                    deleteMany: { deviceId: id },
                    create: body.categories.map((categoryId: string) => ({
                        category: { connect: { id: categoryId } },
                    })),
                };
            }

            const updatedDevice = await prisma.device.update({ where: { id }, data });
            return { message: 'Device updated', data: updatedDevice };
        },
    },
    delete: {},
});
