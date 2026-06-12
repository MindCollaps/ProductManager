import { crud } from '../../../../utils/backend/crud';
import { deviceCategoryCreateSchema } from '~~/server/utils/backend/validation';
import { pickTruthyFields } from '~~/server/utils/backend/routeHelpers';

export default crud(prisma.deviceCategory, {
    resourceName: 'Device category',
    get: {
        run: async ({ record }) => record,
    },
    update: {
        schema: deviceCategoryCreateSchema.partial(),
        notFoundMessage: 'Device category not found',
        run: async ({ id, body }) => {
            const updatedCategory = await prisma.deviceCategory.update({
                where: { id },
                data: pickTruthyFields({
                    name: body.name,
                    slug: body.slug,
                    description: body.description,
                    color: body.color,
                }),
            });

            return { message: 'Device category updated', data: updatedCategory };
        },
    },
    delete: {
        notFoundMessage: 'Device category not found',
        run: async ({ id }: { id: string }) => {
            await prisma.deviceCategory.delete({
                where: { id },
            });

            return { message: 'Device category deleted' };
        },
    },
});
