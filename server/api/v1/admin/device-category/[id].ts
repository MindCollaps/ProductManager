import { crud } from '../../../../utils/backend/crud';
import { deviceCategoryCreateSchema } from '~~/server/utils/backend/validation';
import { pickDefinedFields } from '~~/server/utils/backend/routeHelpers';
import type { Prisma } from '@prisma/client';

export default crud(prisma.deviceCategory, {
    resourceName: 'Device category',
    notFoundMessage: 'Device category not found',
    update: {
        schema: deviceCategoryCreateSchema.partial(),
        run: async ({ id, body }) => {
            const updatedCategory = await prisma.deviceCategory.update({
                where: { id },
                data: pickDefinedFields({
                    name: body.name,
                    slug: body.slug,
                    description: body.description,
                    color: body.color,
                }) as Prisma.DeviceCategoryUpdateInput,
            });

            return { message: 'Device category updated', data: updatedCategory };
        },
    },
    delete: {},
});
