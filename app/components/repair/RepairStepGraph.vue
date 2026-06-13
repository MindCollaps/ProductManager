<template>
    <div class="step-graph">
        <div class="step-graph-header">
            <div>
                <h2>Repair steps</h2>
                <p>Order 0-100, grouped by phase and editable per step.</p>
            </div>

            <div class="step-graph-actions">
                <ui-button
                    v-if="editable && request.status === 'ACCEPTED'"
                    @click="initializeDefaultSteps"
                >
                    {{ workItems.length === 0 ? 'Initialize default steps' : 'Reset defaults' }}
                </ui-button>
                <ui-button
                    v-if="editable"
                    @click="openCreate(0)"
                >
                    Add step
                </ui-button>
            </div>
        </div>

        <template v-if="phases.length > 0">
            <repair-step-phase
                v-for="phase in phases"
                :key="phase.startOrder"
                :phase="phase"
                :editable="editable"
                @add="openCreate"
            >
                <template #default="{ item }">
                    <repair-work-item-card
                        :editable="editable"
                        :item="item"
                        @delete="deleteWorkItem(item)"
                        @edit="openEdit(item)"
                        @toggle="toggleWorkItemCompletion(item)"
                    />
                </template>
            </repair-step-phase>
        </template>

        <common-box v-else>
            <h3>No repair steps defined yet</h3>
            <p v-if="editable">Create custom steps or initialize the default baseline steps.</p>
            <p v-else>Steps will appear here once staff defines them.</p>
        </common-box>

        <repair-work-item-editor
            v-if="editable"
            :default-order-index="editorDefaultOrderIndex"
            :is-visible="isEditorVisible"
            :item="editingItem"
            :title="editingItem ? 'Edit step' : 'Create step'"
            @close="closeEditor"
            @save="saveWorkItem"
        />
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RepairRequestWithRelationsType, RepairWorkItemWithRelationsType } from '~~/types/req';
import type { RepairWorkItemDraft } from '~~/app/utils/repairWorkItems';
import { groupRepairWorkItemsByPhase } from '~~/app/utils/repairWorkItems';

const props = defineProps({
    request: {
        type: Object as PropType<RepairRequestWithRelationsType>,
        required: true,
    },
    editable: {
        type: Boolean,
        default: false,
    },
});

const workItems = ref<RepairWorkItemWithRelationsType[]>([]);
const isEditorVisible = ref(false);
const editingItem = ref<RepairWorkItemWithRelationsType | null>(null);
const editorDefaultOrderIndex = ref(0);

watch(() => props.request.workItems, items => {
    workItems.value = [...(items ?? [])];
}, { immediate: true });

const phases = computed(() => groupRepairWorkItemsByPhase(workItems.value));

function closeEditor() {
    isEditorVisible.value = false;
    editingItem.value = null;
}

function openCreate(orderIndex: number) {
    editingItem.value = null;
    editorDefaultOrderIndex.value = orderIndex;
    isEditorVisible.value = true;
}

function openEdit(item: RepairWorkItemWithRelationsType) {
    editingItem.value = item;
    editorDefaultOrderIndex.value = item.orderIndex;
    isEditorVisible.value = true;
}

function upsertLocalWorkItem(workItem: RepairWorkItemWithRelationsType) {
    const existingIndex = workItems.value.findIndex(existing => existing.id === workItem.id);

    if (existingIndex === -1) {
        workItems.value = [...workItems.value, workItem].sort((left, right) => left.orderIndex - right.orderIndex);
        return;
    }

    const nextItems = [...workItems.value];
    nextItems.splice(existingIndex, 1, workItem);
    workItems.value = nextItems.sort((left, right) => left.orderIndex - right.orderIndex);
}

function removeLocalWorkItem(workItemId: string) {
    workItems.value = workItems.value.filter(workItem => workItem.id !== workItemId);
}

function buildPayload(draft: RepairWorkItemDraft) {
    const assignedStaffId = draft.assignedStaffId && draft.assignedStaffId.length > 0 ? draft.assignedStaffId : null;
    const workItemTypeId = draft.workItemTypeId ?? null;

    if (!workItemTypeId) {
        throw new Error('A work item type is required');
    }

    return {
        title: draft.title,
        description: draft.description.length > 0 ? draft.description : null,
        orderIndex: draft.orderIndex,
        workItemTypeId,
        assignedStaffId,
        laborMinutes: draft.laborMinutes,
        status: draft.completed ? 'DONE' : (assignedStaffId ? 'IN_PROGRESS' : 'PENDING'),
        completedAt: draft.completed ? new Date().toISOString() : null,
    };
}

async function saveWorkItem(draft: RepairWorkItemDraft) {
    const payload = buildPayload(draft);

    if (editingItem.value) {
        const response = await $fetch<{ data: RepairWorkItemWithRelationsType }>(`/api/v1/staff/request/${ props.request.id }/steps/${ editingItem.value.id }`, {
            body: payload,
            method: 'PUT',
        });

        upsertLocalWorkItem(response.data);
    }
    else {
        const response = await $fetch<{ data: RepairWorkItemWithRelationsType }>(`/api/v1/staff/request/${ props.request.id }/steps`, {
            body: payload,
            method: 'POST',
        });

        upsertLocalWorkItem(response.data);
    }

    closeEditor();
}

async function deleteWorkItem(item: RepairWorkItemWithRelationsType) {
    const confirmed = confirm(`Delete ${ item.title }?`);

    if (!confirmed) {
        return;
    }

    await $fetch(`/api/v1/staff/request/${ props.request.id }/steps/${ item.id }`, {
        method: 'DELETE',
    });

    removeLocalWorkItem(item.id);
}

async function toggleWorkItemCompletion(item: RepairWorkItemWithRelationsType) {
    const completed = item.status !== 'DONE';

    const response = await $fetch<{ data: RepairWorkItemWithRelationsType }>(`/api/v1/staff/request/${ props.request.id }/steps/${ item.id }`, {
        body: {
            title: item.title,
            description: item.description ?? '',
            orderIndex: item.orderIndex,
            workItemTypeId: item.workItemType.id,
            assignedStaffId: item.assignedStaff?.id ?? null,
            laborMinutes: item.laborMinutes ?? null,
            status: completed ? 'DONE' : (item.assignedStaff ? 'IN_PROGRESS' : 'PENDING'),
            completedAt: completed ? new Date().toISOString() : null,
        },
        method: 'PUT',
    });

    upsertLocalWorkItem(response.data);
}

async function initializeDefaultSteps() {
    const response = await $fetch<RepairWorkItemWithRelationsType[]>(`/api/v1/staff/request/${ props.request.id }/steps/defaults`, {
        method: 'POST',
    });

    workItems.value = [...response];
}
</script>

<style scoped lang="scss">
.step-graph {
    display: flex;
    flex-direction: column;
    gap: 18px;

    &-header {
        display: flex;
        gap: 16px;
        align-items: end;
        justify-content: space-between;
    }

    &-actions {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: flex-end;
    }
}
</style>