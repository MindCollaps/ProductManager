import { NotificationStatus, UserRole } from '@prisma/client';

import { createNotificationsForUsers } from '~~/server/utils/backend/notificationCenter';
import { prisma } from '~~/server/utils/prisma';
import type { UserSession } from '~~/types/data';
import type { ChatMessage } from '~~/types/socket';

export type ChatRequestAccessRecord = {
    id: string;
    customerId: string;
    assignedStaffId: string | null;
};

const CHAT_MESSAGE_LIMIT = 100;

export function getChatRoomName(requestId: string) {
    return `chat:request:${ requestId }`;
}

export function getUserRoomName(userId: string) {
    return `user:${ userId }`;
}

export function canAccessChatRequest(user: UserSession, request: ChatRequestAccessRecord) {
    if (request.customerId === user.userId) {
        return true;
    }

    return user.role === UserRole.STAFF || user.role === UserRole.ADMIN;
}

export async function getChatRequestAccessRecord(requestId: string) {
    return prisma.repairRequest.findUnique({
        where: { id: requestId },
        select: {
            id: true,
            customerId: true,
            assignedStaffId: true,
        },
    });
}

export async function ensureMessageChannel(requestId: string, createdById: string) {
    return prisma.messageChannel.upsert({
        where: { requestId },
        update: {
            title: `Request ${ requestId }`,
        },
        create: {
            requestId,
            createdById,
            title: `Request ${ requestId }`,
        },
    });
}

export async function ensureChannelParticipants(channelId: string, request: ChatRequestAccessRecord, actorUserId: string) {
    const participantIds = new Set<string>([
        request.customerId,
        actorUserId,
    ]);

    if (request.assignedStaffId) {
        participantIds.add(request.assignedStaffId);
    }

    await prisma.messageChannelParticipant.createMany({
        data: Array.from(participantIds).map(userId => ({
            channelId,
            userId,
        })),
        skipDuplicates: true,
    });

    return Array.from(participantIds);
}

export async function loadRecentChatMessages(channelId: string, requestId: string) {
    const [messageRows, statusRows] = await Promise.all([
        prisma.repairMessage.findMany({
            where: { channelId },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
            take: CHAT_MESSAGE_LIMIT,
        }),
        prisma.repairStatusHistory.findMany({
            where: { requestId },
            include: {
                createdBy: {
                    select: {
                        username: true,
                    },
                },
            },
            orderBy: {
                startedAt: 'asc',
            },
            take: CHAT_MESSAGE_LIMIT,
        }),
    ]);

    const chatMessages = messageRows.map<ChatMessage>(row => ({
        id: row.id,
        requestId,
        channelId: row.channelId,
        content: row.content,
        isInternal: row.isInternal,
        createdAt: row.createdAt.toISOString(),
        sender: row.sender
            ? {
                id: row.sender.id,
                username: row.sender.username ?? 'Unknown',
            }
            : null,
    }));

    const statusMessages = statusRows.map<ChatMessage>(row => {
        const createdByName = row.createdBy?.username?.trim() || 'System';
        const noteSuffix = row.note?.trim() ? ` (${ row.note.trim() })` : '';

        return {
            id: `status:${ row.id }`,
            requestId,
            channelId,
            content: `Status changed to ${ row.status } by ${ createdByName }${ noteSuffix }`,
            isInternal: true,
            createdAt: row.startedAt.toISOString(),
            sender: null,
        };
    });

    return [...chatMessages, ...statusMessages]
        .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())
        .slice(-CHAT_MESSAGE_LIMIT);
}

export async function createChatMessage(channelId: string, requestId: string, senderId: string, content: string) {
    const row = await prisma.repairMessage.create({
        data: {
            channelId,
            senderId,
            content,
            isInternal: false,
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                },
            },
        },
    });

    return {
        id: row.id,
        requestId,
        channelId,
        content: row.content,
        isInternal: row.isInternal,
        createdAt: row.createdAt.toISOString(),
        sender: row.sender
            ? {
                id: row.sender.id,
                username: row.sender.username ?? 'Unknown',
            }
            : null,
    } satisfies ChatMessage;
}

export async function markNotificationsAsReadForRoom(userId: string, requestId: string) {
    await prisma.notification.updateMany({
        where: {
            userId,
            requestId,
            status: NotificationStatus.PENDING,
        },
        data: {
            status: NotificationStatus.SENT,
            sentAt: new Date(),
        },
    });
}

export async function getUnreadNotificationCount(userId: string) {
    return prisma.notification.count({
        where: {
            userId,
            status: NotificationStatus.PENDING,
        },
    });
}

export async function createMessageNotifications(
    requestId: string,
    channelId: string,
    senderId: string,
    content: string,
    activeInRoomUserIds: ReadonlySet<string>,
) {
    const participants = await prisma.messageChannelParticipant.findMany({
        where: {
            channelId,
            userId: {
                not: senderId,
            },
        },
        select: {
            userId: true,
        },
    });

    const usersToNotify = participants
        .map(entry => entry.userId)
        .filter(userId => !activeInRoomUserIds.has(userId));

    const uniqueUsersToNotify = Array.from(new Set(usersToNotify));

    await createNotificationsForUsers(uniqueUsersToNotify.map(userId => ({
        userId,
        requestId,
        messageChannelId: channelId,
        subject: 'Neue Chat Nachricht',
        body: content,
    })));

    return uniqueUsersToNotify.map(userId => ({
        userId,
    }));
}
