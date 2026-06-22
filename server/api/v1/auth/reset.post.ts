import { AuthTokenPurpose } from '@prisma/client';

import { createApiError } from '~~/server/utils/apiResponses';
import { consumeAuthToken } from '~~/server/utils/auth/tokens';
import { passwordResetConfirmSchema } from '~~/server/utils/backend/validation';
import { hashPassword } from '~~/server/utils/crypto/password';

export default defineEventHandler(async event => {
    const body = await readBody(event);
    const validation = passwordResetConfirmSchema.safeParse(body);

    if (!validation.success) {
        throw createApiError('Invalid input', 400, validation.error.issues);
    }

    if (validation.data.password !== validation.data.passwordRepeated) {
        throw createApiError('Passwords do not match', 400);
    }

    const tokenRecord = await consumeAuthToken(validation.data.token, AuthTokenPurpose.PASSWORD_RESET);

    if (!tokenRecord) {
        throw createApiError('Password reset token is invalid or expired', 400);
    }

    const passwordHash = await hashPassword(validation.data.password);

    await prisma.user.update({
        where: {
            id: tokenRecord.userId,
        },
        data: {
            passwordHash,
        },
    });

    return {
        message: 'Password has been reset successfully. You can now login.',
    };
});
