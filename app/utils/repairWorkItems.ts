import type { RepairWorkItemWithRelationsType } from '~~/types/req';

export type RepairWorkItemGraphItem = RepairWorkItemWithRelationsType;

export interface RepairWorkItemPhase<T extends RepairWorkItemGraphItem = RepairWorkItemGraphItem> {
    startOrder: number;
    endOrder: number;
    label: string;
    items: T[];
}

export interface RepairWorkItemDraft {
    workItemTypeId: string | null;
    title: string;
    description: string;
    orderIndex: number;
    assignedStaffId: string | null;
    laborMinutes: number | null;
    completed: boolean;
}

export function getWorkItemPhaseStart(orderIndex: number) {
    return Math.floor(orderIndex / 10) * 10;
}

export function getWorkItemPhaseLabel(orderIndex: number) {
    const start = getWorkItemPhaseStart(orderIndex);
    const end = Math.min(start + 9, 100);

    if (start >= 100) {
        return '100';
    }

    return `${ start }-${ end }`;
}

export function groupRepairWorkItemsByPhase<T extends { orderIndex: number }>(workItems: T[]): RepairWorkItemPhase<T>[] {
    const sortedWorkItems = [...workItems].sort((left, right) => {
        if (left.orderIndex !== right.orderIndex) {
            return left.orderIndex - right.orderIndex;
        }

        return 0;
    });

    const phases = new Map<number, RepairWorkItemPhase<T>>();

    for (const workItem of sortedWorkItems) {
        const startOrder = getWorkItemPhaseStart(workItem.orderIndex);
        const endOrder = Math.min(startOrder + 9, 100);
        const existingPhase = phases.get(startOrder);

        if (existingPhase) {
            existingPhase.items.push(workItem);
            continue;
        }

        phases.set(startOrder, {
            startOrder,
            endOrder,
            label: getWorkItemPhaseLabel(workItem.orderIndex),
            items: [workItem],
        });
    }

    return [...phases.values()].sort((left, right) => left.startOrder - right.startOrder);
}