import { crud } from '../../../../utils/backend/crud';

export default crud(prisma.partCatalog, {
    resourceName: 'Part catalog entry',
    list: {
        run: async () => prisma.partCatalog.findMany({
            orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
        }),
    },
});
