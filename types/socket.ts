export type SocketSession = {
    loggedIn: boolean;
    admin: boolean;
    username: string;
    userid: string;
    staff: boolean;
};

export type ChatAuthor = {
    id: string;
    username: string;
};

export type ChatMessage = {
    id: string;
    requestId: string;
    channelId: string;
    content: string;
    isInternal: boolean;
    createdAt: string;
    sender: ChatAuthor | null;
};

export type ChatJoinPayload = {
    requestId: string;
};

export type ChatJoinAck = {
    ok: boolean;
    error?: string;
    requestId?: string;
    channelId?: string;
    messages?: ChatMessage[];
};

export type ChatSendPayload = {
    requestId: string;
    content: string;
};

export type ChatSendAck = {
    ok: boolean;
    error?: string;
};

export type NotificationBadgePayload = {
    unreadCount: number;
};

export type RepairUpdatePayload = {
    requestId: string;
};

export interface ClientToServerEvents {
    me: () => void;
    'chat:join': (payload: ChatJoinPayload, ack: (response: ChatJoinAck) => void) => void;
    'chat:leave': (payload: ChatJoinPayload) => void;
    'chat:send': (payload: ChatSendPayload, ack: (response: ChatSendAck) => void) => void;
    'notification:sync': () => void;
    'repair:watch': (payload: RepairUpdatePayload) => void;
    'repair:unwatch': (payload: RepairUpdatePayload) => void;
}

export interface ServerToClientEvents {
    me: (data: SocketSession) => void;
    'chat:message': (payload: { requestId: string; message: ChatMessage }) => void;
    'notification:badge': (payload: NotificationBadgePayload) => void;
    'repair:update': (payload: RepairUpdatePayload) => void;
    errorMessage: (message: string) => void;
    infoMessage: (message: string) => void;
    warningMessage: (message: string) => void;
    successMessage: (message: string) => void;
}

export type SocketData = {
    user?: import('./data').UserSession;
    joinedRequestIds: Set<string>;
};
