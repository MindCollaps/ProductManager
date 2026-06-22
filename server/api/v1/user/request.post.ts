import { requestCreateSchema } from '~~/server/utils/backend/validation';
import { UserRole } from '@prisma/client';
import { sendNewRequestAlertEmail } from '~~/server/utils/mail';

export default defineEventHandler(async event => {
    if (!event.context.user?.userId) {
        return;
    }
    const body = await readBody(event);

    const validationResult = requestCreateSchema.safeParse(body);
    if (!validationResult.success) {
        throw createApiError('Invalid input', 400, validationResult.error.issues);
    }

    const newRequest = await prisma.repairRequest.create({
        data: {
            customerId: event.context.user.userId,
            subject: `Reparaturanfrage ${ validationResult.data.deviceName }`,
            deviceName: validationResult.data.deviceName,
            deviceBrand: validationResult.data.deviceBrand,
            deviceModel: validationResult.data.deviceModel,
            problemDescription: validationResult.data.problemDescription,
            alreadyTried: validationResult.data.alreadyTried,
            suspectedIssue: validationResult.data.suspectedIssue,
            customerNotes: validationResult.data.customerNotes,
        },
    });

    const staffAndAdmins = await prisma.user.findMany({
        where: {
            isActive: true,
            role: {
                in: [UserRole.STAFF, UserRole.ADMIN],
            },
        },
        select: {
            id: true,
            email: true,
        },
    });

    if (staffAndAdmins.length > 0) {
        const customerUser = await prisma.user.findUnique({
            where: {
                id: event.context.user.userId,
            },
            select: {
                username: true,
                email: true,
            },
        });

        const customerName = customerUser?.username ?? customerUser?.email ?? 'Customer';

        const sendResults = await Promise.allSettled(
            staffAndAdmins.map(async recipient => {
                await sendNewRequestAlertEmail(
                    recipient.email,
                    newRequest.id,
                    customerName,
                    newRequest.subject,
                    newRequest.problemDescription,
                );
            }),
        );

        const failedCount = sendResults.filter(item => item.status === 'rejected').length;

        if (failedCount > 0) {
            console.error(`[Mail] Failed to send ${ failedCount } new-request alert emails.`);
        }
    }

    return { message: 'Repair request created', data: newRequest, redirect: `/request/${ newRequest.id }` };
});
