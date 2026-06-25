import { crud } from '../../../../utils/backend/crud';
import { partCatalogCreateSchema } from '~~/server/utils/backend/validation';

export default crud(prisma.partCatalog, {
    resourceName: 'Part catalog entry',
    list: {
        run: async () => prisma.partCatalog.findMany({
            orderBy: [{ name: 'asc' }, { createdAt: 'desc' }],
        }),
    },
    create: {
        schema: partCatalogCreateSchema,
        run: async ({ body }) => {
            const createdPart = await prisma.partCatalog.create({
                data: {
                    name: body.name,
                    manufacturer: body.manufacturer,
                    sku: body.sku,
                    description: body.description,
                    unitCost: body.unitCost,
                    retailPrice: body.retailPrice,
                },
            });

            return { message: 'Part catalog entry created', data: createdPart };
        },
    },
});
