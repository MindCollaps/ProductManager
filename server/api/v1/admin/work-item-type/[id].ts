import { crud } from '../../../../utils/backend/crud';
import { workItemTypeCreateSchema } from '~~/server/utils/backend/validation';
import { pickDefinedFields } from '~~/server/utils/backend/routeHelpers';
import type { Prisma } from '@prisma/client';

export default crud(prisma.workItemType, {
    resourceName: 'Work Item Type',
    notFoundMessage: 'Work Item Type not found',
    update: {
        schema: workItemTypeCreateSchema.partial(),
        run: async ({ id, body }) => {
            const updatedWorkItemType = await prisma.workItemType.update({
                where: { id },
                data: pickDefinedFields({
                    name: body.name,
                    slug: body.slug,
                    color: body.color,
                    description: body.description,
                    icon: body.icon,
                    sortOrder: body.sortOrder,
                    laborMinutes: body.laborMinutes,
                    isDefault: body.isDefault,
                }) as Prisma.WorkItemTypeUpdateInput,
            });

            return { message: 'Work Item Type updated', data: updatedWorkItemType };
        },
    },
    delete: {},
});
