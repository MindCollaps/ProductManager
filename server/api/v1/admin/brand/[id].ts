import { crud } from '../../../../utils/backend/crud';
import { deviceBrandCreateSchema } from '~~/server/utils/backend/validation';
import type { Prisma } from '@prisma/client';

export default crud(prisma.deviceBrand, {
    resourceName: 'Brand',
    notFoundMessage: 'Brand not found',
    update: {
        schema: deviceBrandCreateSchema.partial(),
        run: async ({ id, body }) => {
            const updatedBrand = await prisma.deviceBrand.update({
                where: { id },
                data: body.name ? { name: body.name } : {} as Prisma.DeviceBrandUpdateInput,
            });

            return { message: 'Brand updated', data: updatedBrand };
        },
    },
    delete: {},
});
