import { crud } from '../../../../utils/backend/crud';
import { workItemTypeCreateSchema } from '~~/server/utils/backend/validation';
import { pickDefinedFields } from '~~/server/utils/backend/routeHelpers';

export default crud(prisma.device, {
    resourceName: 'Work Item Type',
    get: {
        run: async ({ record }) => record,
    },
    update: {
        schema: workItemTypeCreateSchema.partial(),
        notFoundMessage: 'Work Item Type not found',
        run: async ({ id, body }) => {
            const updatedData = pickDefinedFields({
                name: body.name,
                slug: body.slug,
                color: body.color,
                description: body.description,
                icon: body.icon,
                sortOrder: body.sortOrder,
            });

            const updatedWorkItemType = await prisma.workItemType.update({
                where: { id },
                data: updatedData as any,
            });

            return { message: 'Device updated', data: updatedWorkItemType };
        },
    },
    delete: {
        notFoundMessage: 'Work Item Type not found',
        run: async ({ id }: { id: string }) => {
            await prisma.workItemType.delete({
                where: { id },
            });

            return { message: 'Work Item Type deleted' };
        },
    },
});
