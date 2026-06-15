import { requireStaffAuth } from '~~/server/utils/auth';

export default defineEventHandler(async event => {
    await requireStaffAuth(event);

    const users = await prisma.user.findMany({
        where: {
            role: {
                in: ['STAFF', 'ADMIN'],
            },
            isActive: true,
        },
        orderBy: [
            { displayName: 'asc' },
            { username: 'asc' },
            { email: 'asc' },
        ],
        select: {
            id: true,
            displayName: true,
            username: true,
            email: true,
        },
    });

    return users.map(user => ({
        id: user.id,
        name: user.displayName ?? user.username ?? user.email,
    }));
});
