import { AuthTokenPurpose } from '@prisma/client';

import { createApiError } from '~~/server/utils/apiResponses';
import { makeUserSession } from '~~/server/utils/auth';
import { consumeAuthToken } from '~~/server/utils/auth/tokens';
import { verifyEmailSchema } from '~~/server/utils/backend/validation';

export default defineEventHandler(async event => {
    const body = await readBody(event);
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
        throw createApiError('Invalid input', 400, validation.error.issues);
    }

    const tokenRecord = await consumeAuthToken(validation.data.token, AuthTokenPurpose.EMAIL_VERIFICATION);

    if (!tokenRecord) {
        throw createApiError('Verification token is invalid or expired', 400);
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: tokenRecord.userId,
        },
        data: {
            isActive: true,
        },
    });

    await makeUserSession(updatedUser, event);

    return {
        message: 'Email verified successfully',
        redirect: '/dashboard',
    };
});
