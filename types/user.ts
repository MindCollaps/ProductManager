export interface WebUser {
    id: string;
    username: string;
    avatarUrl?: string;
    isAdmin: boolean;
    isStaff: boolean;
    loggedIn: boolean;
}
