import type { SocketSession } from '~~/types/socket';
import { parseSocketCookie } from '../utils/auth';
import type { Socket, Namespace, Server, DefaultEventsMap } from 'socket.io';
import type { UserSession } from '../../types/data';
import { socketServer } from '../plugins/socket.io.server';

declare module 'socket.io' {
    interface Socket {
        user?: UserSession;
    }
}

export function initSocket(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.use(checkCookies);

    io.on('connection', socket => {
        socket.on('me', () => {
            emitMe(socket);
        });

        emitMe(socket);
    });
}

function emitMe(socket: Socket) {
    const loggedIn = !!socket.user;
    const data: SocketSession = {
        loggedIn,
        admin: socket.user?.role === 'ADMIN',
        username: socket.user?.username ?? '',
        userid: socket.user?.userId ?? '',
        staff: socket.user?.role === 'STAFF',
    };

    socket.emit('me', data);
}

function checkCookies(socket: Socket, next: (err?: Error) => void) {
    parseSocketCookie(socket).then(user => {
        if (!user) return next();
        socket.user = user;
        next();
    }).catch(err => next());
}

function requireAuth(socket: Socket, next: (err?: Error) => void) {
    if (!socket.user?.userId) {
        next(new Error('Unauthorized'));
    }
    else {
        next();
    }
}
