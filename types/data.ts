import type { UserRole } from "@prisma/client";

export interface UserSession {
    username: string;
    userId: string;
    timeStamp: number;
    random: string;
    role: UserRole;
}

