export interface DashboardStats {
    topDevices: { name: string; count: number }[];
    topDefects: { name: string; count: number }[];
    topParts: { name: string; count: number }[];
    teamLoad: { username: string; displayName: string | null; active: number; completed: number }[];
}
