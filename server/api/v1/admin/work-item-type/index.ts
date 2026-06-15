import { crud } from '../../../../utils/backend/crud';
import { workItemTypeCreateSchema } from '~~/server/utils/backend/validation';

export default crud(prisma.workItemType, {
    resourceName: 'Work Item Type',
    list: {
        run: async () => {
            const workItemTypes = await prisma.workItemType.findMany({
                orderBy: { name: 'asc' },
            });

            return workItemTypes;
        },
    },
    create: {
        schema: workItemTypeCreateSchema,
        run: async ({ body, event }) => {
            const userId = event.context.user?.userId;
            const newWorkItemType = await prisma.workItemType.create({
                data: {
                    name: body.name,
                    slug: body.slug,
                    description: body.description,
                    color: body.color,
                    icon: body.icon,
                    sortOrder: body.sortOrder,
                    laborMinutes: body.laborMinutes,
                    isDefault: body.isDefault,
                    createdById: userId,
                },
            });

            return { message: 'Work Item Type created', data: newWorkItemType };
        },
    },
});
