import { crud } from '../../../../utils/backend/crud';
import { deviceCreateSchema } from '~~/server/utils/backend/validation';
import { DeviceWithRelations } from '~~/types/req';

export default crud(prisma.device, {
    resourceName: 'Device',
    get: {
        include: DeviceWithRelations,
        run: async ({ record }) => record,
    },
    update: {
        schema: deviceCreateSchema.partial(),
        notFoundMessage: 'Device not found',
        run: async ({ id, body }) => {
            const updatedData: Record<string, unknown> = {};

            if (body.name) {
                updatedData.name = body.name;
            }

            if (body.description) {
                updatedData.description = body.description;
            }

            if (body.categories) {
                updatedData.deviceCategories = {
                    deleteMany: {
                        deviceId: id,
                    },
                    create: body.categories.map((categoryId: string) => ({
                        category: {
                            connect: { id: categoryId },
                        },
                    })),
                };
            }

            const updatedDevice = await prisma.device.update({
                where: { id },
                data: updatedData as any,
            });

            return { message: 'Device updated', data: updatedDevice };
        },
    },
    delete: {
        notFoundMessage: 'Device not found',
        run: async ({ id }: { id: string }) => {
            await prisma.device.delete({
                where: { id },
            });

            return { message: 'Device deleted' };
        },
    },
});
