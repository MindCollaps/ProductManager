import { createHash } from 'crypto';
import type { AuthTokenPurpose } from '@prisma/client';

import { createToken } from '~~/server/utils/crypto';
import { prisma } from '~~/server/utils/prisma';

const TOKEN_LENGTH = 64;

function hashToken(rawToken: string) {
    return createHash('sha256').update(rawToken).digest('hex');
}

export interface CreatedAuthToken {
    token: string;
    purpose: AuthTokenPurpose;
    expiresAt: Date;
}

export async function createAuthToken(userId: string, purpose: AuthTokenPurpose, ttlMinutes: number): Promise<CreatedAuthToken> {
    const token = createToken(TOKEN_LENGTH);
    const expiresAt = new Date(Date.now() + (ttlMinutes * 60 * 1000));

    await prisma.authToken.deleteMany({
        where: {
            userId,
            purpose,
            consumedAt: null,
        },
    });

    await prisma.authToken.create({
        data: {
            userId,
            purpose,
            tokenHash: hashToken(token),
            expiresAt,
        },
    });

    return {
        token,
        purpose,
        expiresAt,
    };
}

export async function consumeAuthToken(token: string, purpose: AuthTokenPurpose) {
    const tokenHash = hashToken(token);

    const now = new Date();

    const record = await prisma.authToken.findFirst({
        where: {
            tokenHash,
            purpose,
            consumedAt: null,
            expiresAt: {
                gt: now,
            },
        },
        include: {
            user: true,
        },
    });

    if (!record) {
        return null;
    }

    await prisma.authToken.update({
        where: {
            id: record.id,
        },
        data: {
            consumedAt: now,
        },
    });

    return record;
}

export async function consumeLatestAuthTokenForUser(userId: string, purpose: AuthTokenPurpose) {
    const now = new Date();

    const record = await prisma.authToken.findFirst({
        where: {
            userId,
            purpose,
            consumedAt: null,
            expiresAt: {
                gt: now,
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (!record) {
        return null;
    }

    await prisma.authToken.update({
        where: {
            id: record.id,
        },
        data: {
            consumedAt: now,
        },
    });

    return record;
}
