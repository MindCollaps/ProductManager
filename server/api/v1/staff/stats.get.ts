import { RepairRequestStatus, UserRole } from '@prisma/client';
import type { DashboardStats } from '~~/types/stats';

export default defineEventHandler(async (): Promise<DashboardStats> => {
    // Pre-collect IDs for work items in the repair-execution phase (orderIndex 30–89)
    const repairPhaseItems = await prisma.repairWorkItem.findMany({
        where: { orderIndex: { gte: 30, lte: 89 } },
        select: { id: true, workItemTypeId: true },
    });
    const repairPhaseIdSet = repairPhaseItems.map(w => w.id);

    // Aggregate work item type counts for defect classification
    const defectTypeCount = new Map<string, number>();
    for (const item of repairPhaseItems) {
        defectTypeCount.set(item.workItemTypeId, (defectTypeCount.get(item.workItemTypeId) ?? 0) + 1);
    }
    const topDefectTypeIds = [...defectTypeCount.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

    const [deviceGroups, brandGroups, partOrderGroups, activeGroups, completedGroups, staffUsers, defectTypes] = await Promise.all([
        // Catalog-linked repair devices
        prisma.repairDevice.groupBy({
            by: ['deviceId'],
            where: { deviceId: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        }),
        // Free-text brand fallback for repairs without a catalog device
        prisma.repairRequest.groupBy({
            by: ['deviceBrand'],
            where: {
                deviceBrand: { not: null },
                device: { is: null },
            },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        }),
        // Most-ordered part names on repair-execution work items
        repairPhaseIdSet.length
            ? prisma.partOrder.groupBy({
                by: ['orderedName'],
                where: { workItemId: { in: repairPhaseIdSet } },
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 5,
            })
            : Promise.resolve([]),
        prisma.repairRequest.groupBy({
            by: ['assignedStaffId'],
            where: {
                assignedStaffId: { not: null },
                status: {
                    in: [
                        RepairRequestStatus.ACCEPTED,
                        RepairRequestStatus.WAITING_FOR_RESPONSE,
                        RepairRequestStatus.WAITING_FOR_REVIEW,
                    ],
                },
            },
            _count: { id: true },
        }),
        prisma.repairRequest.groupBy({
            by: ['assignedStaffId'],
            where: {
                assignedStaffId: { not: null },
                status: RepairRequestStatus.COMPLETED,
            },
            _count: { id: true },
        }),
        prisma.user.findMany({
            where: { role: { in: [UserRole.STAFF, UserRole.ADMIN] }, isActive: true },
            select: { id: true, username: true, displayName: true },
        }),
        // Resolve work item type names for top defect types
        topDefectTypeIds.length
            ? prisma.workItemType.findMany({
                where: { id: { in: topDefectTypeIds } },
                select: { id: true, name: true },
            })
            : Promise.resolve([]),
    ]);

    // Häufige Defekte: work item type names for repair-execution steps
    const typeNameMap = new Map(defectTypes.map(t => [t.id, t.name]));
    const topDefects = topDefectTypeIds.flatMap(id => {
        const name = typeNameMap.get(id);
        const count = defectTypeCount.get(id) ?? 0;
        return name ? [{ name, count }] : [];
    });

    // Meistgenutzte Teile: part order names from repair-execution steps
    const topParts = partOrderGroups.map(g => ({ name: g.orderedName, count: g._count.id }));

    // Geräte: catalog device names merged with free-text brands
    const deviceIds = deviceGroups
        .filter((g): g is typeof g & { deviceId: string } => g.deviceId != null)
        .map(g => g.deviceId);
    const catalogDevices = deviceIds.length
        ? await prisma.device.findMany({
            where: { id: { in: deviceIds } },
            select: { id: true, name: true },
        })
        : [];
    const deviceNameMap = new Map(catalogDevices.map(d => [d.id, d.name]));
    const catalogEntries = deviceGroups.flatMap(g => {
        if (!g.deviceId) return [];
        const name = deviceNameMap.get(g.deviceId);
        return name ? [{ name, count: g._count.id }] : [];
    });
    const freeTextEntries = brandGroups
        .filter((g): g is typeof g & { deviceBrand: string } => g.deviceBrand != null)
        .map(g => ({ name: g.deviceBrand, count: g._count.id }));
    const deviceCountMap = new Map<string, number>();
    for (const e of [...catalogEntries, ...freeTextEntries]) {
        deviceCountMap.set(e.name, (deviceCountMap.get(e.name) ?? 0) + e.count);
    }
    const topDevices = [...deviceCountMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Team load
    const activeMap = new Map(
        activeGroups
            .filter((g): g is typeof g & { assignedStaffId: string } => g.assignedStaffId != null)
            .map(g => [g.assignedStaffId, g._count.id]),
    );
    const completedMap = new Map(
        completedGroups
            .filter((g): g is typeof g & { assignedStaffId: string } => g.assignedStaffId != null)
            .map(g => [g.assignedStaffId, g._count.id]),
    );
    const teamLoad = staffUsers
        .filter(u => activeMap.has(u.id) || completedMap.has(u.id))
        .map(u => ({
            username: u.username ?? u.id,
            displayName: u.displayName,
            active: activeMap.get(u.id) ?? 0,
            completed: completedMap.get(u.id) ?? 0,
        }))
        .sort((a, b) => b.active - a.active);

    return { topDevices, topDefects, topParts, teamLoad };
});
