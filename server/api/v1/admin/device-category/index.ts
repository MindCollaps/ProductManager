import { crud } from '../../../../utils/backend/crud';
import { deviceCategoryCreateSchema } from '~~/server/utils/backend/validation';

export default crud(prisma.deviceCategory, {
    resourceName: 'Device category',
    list: {
        run: async () => prisma.deviceCategory.findMany({
            orderBy: { name: 'asc' },
        }),
    },
    create: {
        schema: deviceCategoryCreateSchema,
        run: async ({ body }) => {
            const existingCategory = await prisma.deviceCategory.findUnique({
                where: { slug: body.slug },
            });

            if (existingCategory) {
                throw createApiError('Device category with this slug already exists', 400);
            }

            const newCategory = await prisma.deviceCategory.create({
                data: {
                    name: body.name,
                    slug: body.slug,
                    description: body.description,
                    color: body.color,
                },
            });

            return { message: 'Device category created', data: newCategory };
        },
    },
});
