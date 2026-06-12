import { crud } from '../../../../utils/backend/crud';
import { deviceBrandCreateSchema } from '~~/server/utils/backend/validation';

export default crud(prisma.deviceBrand, {
    resourceName: 'Brand',
    list: {
        run: async () => prisma.deviceBrand.findMany({
            orderBy: { name: 'asc' },
        }),
    },
    create: {
        schema: deviceBrandCreateSchema,
        run: async ({ body }) => {
            const newBrand = await prisma.deviceBrand.create({
                data: {
                    name: body.name,
                },
            });

            return { message: 'Brand created', data: newBrand };
        },
    },
});
