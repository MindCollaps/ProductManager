import { crud } from '../../../../utils/backend/crud';
import { repairDeviceCreateSchema } from '~~/server/utils/backend/validation';
import { RepairDeviceWithRelations } from '~~/types/req';

export default crud(prisma.repairDevice, {
    resourceName: 'Repair Device',
    list: {
        run: async () => {
            const devices = await prisma.repairDevice.findMany({
                orderBy: { displayName: 'asc' },
                include: RepairDeviceWithRelations,
            });

            return devices;
        },
    },
    create: {
        schema: repairDeviceCreateSchema,
        run: async ({ body }) => {
            console.log(JSON.stringify(body));
            const newDevice = await prisma.repairDevice.create({
                data: {
                    displayName: body.displayName,
                    serialNumber: body.serialNumber,
                    notes: body.notes,
                    deviceId: body.deviceId,
                    requestId: body.requestId,
                },
            });

            return { message: 'Repair Device created', data: newDevice };
        },
    },
});
