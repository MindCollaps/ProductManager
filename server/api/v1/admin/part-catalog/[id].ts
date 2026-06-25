import { crud } from '../../../../utils/backend/crud';
import { partCatalogCreateSchema } from '~~/server/utils/backend/validation';
import { pickDefinedFields } from '~~/server/utils/backend/routeHelpers';
import type { Prisma } from '@prisma/client';

export default crud(prisma.partCatalog, {
    resourceName: 'Part catalog entry',
    notFoundMessage: 'Part catalog entry not found',
    update: {
        schema: partCatalogCreateSchema.partial(),
        run: async ({ id, body }) => {
            const updated = await prisma.partCatalog.update({
                where: { id },
                data: pickDefinedFields({
                    name: body.name,
                    manufacturer: body.manufacturer,
                    sku: body.sku,
                    description: body.description,
                    unitCost: body.unitCost,
                    retailPrice: body.retailPrice,
                }) as Prisma.PartCatalogUpdateInput,
            });

            return { message: 'Part catalog entry updated', data: updated };
        },
    },
    delete: {},
});
