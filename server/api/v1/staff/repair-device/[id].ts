import { crud } from '../../../../utils/backend/crud';
import { repairDeviceCreateSchema } from '~~/server/utils/backend/validation';
import { RepairDeviceWithRelations } from '~~/types/req';
import { pickDefinedFields } from '~~/server/utils/backend/routeHelpers';
import type { Prisma } from '@prisma/client';

export default crud(prisma.repairDevice, {
    resourceName: 'Repair Device',
    notFoundMessage: 'Repair Device not found',
    get: {
        include: RepairDeviceWithRelations,
    },
    update: {
        schema: repairDeviceCreateSchema.partial(),
        run: async ({ id, body }) => {
            const updatedDevice = await prisma.repairDevice.update({
                where: { id },
                data: pickDefinedFields({
                    displayName: body.displayName,
                    serialNumber: body.serialNumber,
                    notes: body.notes,
                }) as Prisma.RepairDeviceUpdateInput,
            });

            return { message: 'Repair Device updated', data: updatedDevice };
        },
    },
    delete: {},
});
