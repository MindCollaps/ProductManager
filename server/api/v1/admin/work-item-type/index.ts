import { crud } from '../../../../utils/backend/crud';
import { workItemTypeCreateSchema } from '~~/server/utils/backend/validation';

export default crud(prisma.workItemType, {
    resourceName: 'Work Item Type',
    list: {
        run: async ({ event }) => {
            const { minSortOrder, maxSortOrder } = getQuery(event);
            const minOrder = minSortOrder !== undefined ? parseInt(String(minSortOrder)) : undefined;
            const maxOrder = maxSortOrder !== undefined ? parseInt(String(maxSortOrder)) : undefined;
            const filtering = minOrder !== undefined || maxOrder !== undefined;

            const workItemTypes = await prisma.workItemType.findMany({
                where: filtering
                    ? {
                        sortOrder: {
                            ...(minOrder !== undefined ? { gte: minOrder } : {}),
                            ...(maxOrder !== undefined ? { lte: maxOrder } : {}),
                        },
                    }
                    : undefined,
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
