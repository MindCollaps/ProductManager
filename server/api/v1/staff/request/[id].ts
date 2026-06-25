import { z } from 'zod';
import { crud } from '../../../../utils/backend/crud';
import { RepairRequestWithRelations } from '~~/types/req';

const requestUpdateSchema = z.object({
    assignedStaffId: z.string().nullable(),
});

export default crud(prisma.repairRequest, {
    resourceName: 'Request',
    get: {
        include: RepairRequestWithRelations,
    },
    update: {
        schema: requestUpdateSchema,
        run: async ({ id, body }) => {
            const updated = await prisma.repairRequest.update({
                where: { id },
                data: { assignedStaffId: body.assignedStaffId },
                include: RepairRequestWithRelations,
            });
            return { message: 'Request updated', data: updated };
        },
    },
});
