import type { RepairWorkItemWithRelationsType } from '~~/types/req';

export interface RepairWorkItemPhaseItem {
    id: string;
    orderIndex: number;
}

export type RepairWorkItemGraphItem = RepairWorkItemWithRelationsType;

export interface RepairWorkItemOrderGroup<T extends RepairWorkItemPhaseItem = RepairWorkItemGraphItem> {
    orderIndex: number;
    label: string;
    items: T[];
}

export interface RepairWorkItemPhase<T extends RepairWorkItemPhaseItem = RepairWorkItemGraphItem> {
    startOrder: number;
    endOrder: number;
    label: string;
    title: string;
    description: string;
    orderGroups: RepairWorkItemOrderGroup<T>[];
    items: T[];
}

export interface RepairWorkItemDraft {
    workItemTypeId: string | null;
    title: string;
    description: string;
    orderIndex: number;
    assignedStaffId: string | null;
    laborMinutes: number | null;
    status: 'BLOCKED' | 'DONE' | 'IN_PROGRESS' | 'PENDING';
}

const REPAIR_WORK_ITEM_PHASE_DEFINITIONS = [
    {
        startOrder: 0,
        endOrder: 9,
        label: '0-9',
        title: 'Intake',
        description: 'Arrival, handover, and the first checks before detailed work begins.',
    },
    {
        startOrder: 10,
        endOrder: 29,
        label: '10-29',
        title: 'Diagnosis',
        description: 'Fault finding and analysis before any repair work is started.',
    },
    {
        startOrder: 30,
        endOrder: 89,
        label: '30-89',
        title: 'Repair',
        description: 'Parallel repair tasks, part replacement, and intermediate verification.',
    },
    {
        startOrder: 90,
        endOrder: 100,
        label: '90-100',
        title: 'Testing & handover',
        description: 'Final testing, cleaning, confirmation, and customer handover.',
    },
] as const;

export function getWorkItemPhaseStart(orderIndex: number) {
    const phaseDefinition = REPAIR_WORK_ITEM_PHASE_DEFINITIONS.find(definition => orderIndex >= definition.startOrder && orderIndex <= definition.endOrder);

    return phaseDefinition?.startOrder ?? 0;
}

export function getWorkItemPhaseLabel(orderIndex: number) {
    const phaseDefinition = REPAIR_WORK_ITEM_PHASE_DEFINITIONS.find(definition => orderIndex >= definition.startOrder && orderIndex <= definition.endOrder);

    return phaseDefinition?.label ?? '0-9';
}

export function getWorkItemPhaseTitle(orderIndex: number) {
    const phaseDefinition = REPAIR_WORK_ITEM_PHASE_DEFINITIONS.find(definition => orderIndex >= definition.startOrder && orderIndex <= definition.endOrder);

    return phaseDefinition?.title ?? 'Intake';
}

export function getWorkItemPhaseDescription(orderIndex: number) {
    const phaseDefinition = REPAIR_WORK_ITEM_PHASE_DEFINITIONS.find(definition => orderIndex >= definition.startOrder && orderIndex <= definition.endOrder);

    return phaseDefinition?.description ?? 'Arrival, handover, and the first checks before detailed work begins.';
}

export function getWorkItemPhaseEnd(startOrder: number): number {
    const phaseDefinition = REPAIR_WORK_ITEM_PHASE_DEFINITIONS.find(definition => definition.startOrder === startOrder);

    return phaseDefinition?.endOrder ?? startOrder + 9;
}

export function groupRepairWorkItemsByPhase<T extends RepairWorkItemPhaseItem>(workItems: T[]): RepairWorkItemPhase<T>[] {
    const sortedWorkItems = [...workItems].sort((left, right) => {
        if (left.orderIndex !== right.orderIndex) {
            return left.orderIndex - right.orderIndex;
        }

        return 0;
    });

    const phases = new Map<number, RepairWorkItemPhase<T>>(
        REPAIR_WORK_ITEM_PHASE_DEFINITIONS.map(definition => [definition.startOrder, {
            startOrder: definition.startOrder,
            endOrder: definition.endOrder,
            label: definition.label,
            title: definition.title,
            description: definition.description,
            orderGroups: [],
            items: [],
        }]),
    );

    for (const workItem of sortedWorkItems) {
        const startOrder = getWorkItemPhaseStart(workItem.orderIndex);
        const existingPhase = phases.get(startOrder);

        if (existingPhase) {
            existingPhase.items.push(workItem);

            const existingOrderGroup = existingPhase.orderGroups.find(orderGroup => orderGroup.orderIndex === workItem.orderIndex);

            if (existingOrderGroup) {
                existingOrderGroup.items.push(workItem);
                continue;
            }

            existingPhase.orderGroups.push({
                orderIndex: workItem.orderIndex,
                label: String(workItem.orderIndex),
                items: [workItem],
            });

            existingPhase.orderGroups.sort((left, right) => left.orderIndex - right.orderIndex);

            continue;
        }
    }

    return [...phases.values()].sort((left, right) => left.startOrder - right.startOrder);
}
