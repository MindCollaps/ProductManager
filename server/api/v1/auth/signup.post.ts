import { createApiError, sendApiResponse } from '~~/server/utils/apiResponses';
import { createAuthToken } from '~~/server/utils/auth/tokens';
import { createUser } from '~~/server/utils/backend/user';
import { checkRateLimit } from '~~/server/utils/backend/rateLimit';
import { AuthTokenPurpose } from '@prisma/client';
import { sendAccountVerificationEmail, getMailConfig } from '~~/server/utils/mail';

export default defineEventHandler(async event => {
    const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown';
    console.log(`[Auth:Signup] Signup attempt from IP: ${ clientIp }`);

    const isAllowed = await checkRateLimit(`signup:${ clientIp }`, {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 15,
    });

    if (!isAllowed) {
        console.warn(`[Auth:Signup] Rate limit exceeded for IP: ${ clientIp }`);
        throw createApiError('Too many signup attempts. Please try again later.', 429);
    }

    const body = await readBody(event);

    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
        console.warn(`[Auth:Signup] Invalid input from IP: ${ clientIp }`, validationResult.error.issues);
        throw createApiError('Invalid input', 400, validationResult.error.issues);
    }

    const { username, password, passwordRepeated, email } = validationResult.data;

    if (password != passwordRepeated) {
        console.warn(`[Auth:Signup] Password mismatch for username: ${ username } from IP: ${ clientIp }`);
        throw createApiError('Passwords do not match', 400);
    }

    console.log(`[Auth:Signup] Creating account for username: ${ username }, email: ${ email } from IP: ${ clientIp }`);

    const result = await createUser(username, email, password, false, false, false);
    if (!result.success || !result.user) {
        switch (result.error) {
            case 'ALREADY_EXISTS':
                console.warn(`[Auth:Signup] User already exists - username: ${ username }, email: ${ email } from IP: ${ clientIp }`);
                return sendApiResponse(event, 'User already exists', 400);
            case 'DATABASE_ERROR':
                console.error(`[Auth:Signup] Database error during signup for username: ${ username } from IP: ${ clientIp }`);
                return sendApiResponse(event, 'Internal server error', 500);
            default:
                console.error(`[Auth:Signup] Unknown error during signup for username: ${ username } from IP: ${ clientIp }`);
                return sendApiResponse(event, 'Unknown error', 500);
        }
    }

    console.log(`[Auth:Signup] Successfully created account for user: ${ username } (ID: ${ result.user.id }) from IP: ${ clientIp }`);

    const authToken = await createAuthToken(result.user.id, AuthTokenPurpose.EMAIL_VERIFICATION, 24 * 60);
    const mailConfig = getMailConfig();
    const verifyUrl = `${ mailConfig.appBaseUrl }/verify-email?token=${ authToken.token }`;

    try {
        await sendAccountVerificationEmail(email, username, verifyUrl);
    }
    catch (error) {
        console.error(`[Auth:Signup] Failed to send verification email for user ${ username }`, error);
    }

    return {
        message: 'Account created. Please check your email and confirm your account before logging in.',
        requiresEmailVerification: true,
    };
});
