import { requireAuth } from '~~/server/utils/auth';
import type {WebUser} from '~~/types/user';

export default defineEventHandler(async event => {
    await requireAuth(event);

    const user = event.context.user;
    if (!user) {
        return createApiError('Unauthorized', 401);
    }

    // TODO Add AVATAR
    const meUser: WebUser = {
        id: user.userId,
        isAdmin: user.role === 'ADMIN',
        isStaff: user.role === 'STAFF',
        loggedIn: true,
        username: user.username,
    }

    return meUser;
});
