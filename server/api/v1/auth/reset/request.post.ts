import { AuthTokenPurpose } from '@prisma/client';

import { createAuthToken } from '~~/server/utils/auth/tokens';
import { checkRateLimit } from '~~/server/utils/backend/rateLimit';
import { passwordResetRequestSchema } from '~~/server/utils/backend/validation';
import { sendPasswordResetEmail, getMailConfig } from '~~/server/utils/mail';
import { prisma } from '~~/server/utils/prisma';

const RESET_TOKEN_TTL_MINUTES = 60;

export default defineEventHandler(async event => {
    const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown';

    const isAllowed = await checkRateLimit(`password-reset-request:${ clientIp }`, {
        windowMs: 15 * 60 * 1000,
        maxRequests: 10,
    });

    if (!isAllowed) {
        throw createApiError('Too many password reset attempts. Please try again later.', 429);
    }

    const body = await readBody(event);
    const validation = passwordResetRequestSchema.safeParse(body);

    if (!validation.success) {
        throw createApiError('Invalid input', 400, validation.error.issues);
    }

    const user = await prisma.user.findUnique({
        where: {
            email: validation.data.email,
        },
        select: {
            id: true,
            email: true,
            username: true,
        },
    });

    if (user) {
        const tokenData = await createAuthToken(user.id, AuthTokenPurpose.PASSWORD_RESET, RESET_TOKEN_TTL_MINUTES);
        const config = getMailConfig();
        const resetUrl = `${ config.appBaseUrl }/reset-password?token=${ tokenData.token }`;

        try {
            await sendPasswordResetEmail(
                user.email,
                user.username ?? 'there',
                resetUrl,
                RESET_TOKEN_TTL_MINUTES,
            );
        }
        catch (error) {
            console.error(`[Auth] Failed to send password reset email for user ${ user.id }`, error);
        }
    }

    return {
        message: 'If the account exists, a password reset link was sent.',
    };
});
