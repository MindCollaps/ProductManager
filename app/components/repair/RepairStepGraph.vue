<template>
    <div class="step-graph">
        <div class="step-graph-header">
            <div class="step-graph-copy">
                <h2>Repair flow</h2>
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
                <ui-button
                    v-if="!route.path.endsWith('/graph')"
                    @click="router.push(`/request/${ request.id }/graph`)"
                >
                    <template #icon>
                        <Icon name="material-symbols:fullscreen"/>
                    </template>
                </ui-button>
                <ui-button
                    v-else
                    @click="router.back()"
                >
                    <template #icon>
                        <Icon name="material-symbols:fullscreen-exit"/>
                    </template>
                </ui-button>
            </div>
        </div>

        <div class="step-graph-overview">
            <div class="step-graph-stat">
                <span class="step-graph-stat-value">{{ completedWorkItems }} / {{ workItems.length }}</span>
                <span class="step-graph-stat-label">done</span>
            </div>
        </div>

        <common-box v-if="workItems.length === 0">
            <h3>No repair steps defined yet</h3>
            <p v-if="editable">Initialize the default baseline steps or add the first custom node to start shaping the flow.</p>
            <p v-else>Steps will appear here once staff defines them.</p>
        </common-box>

        <repair-step-phase
            v-for="phase in phases"
            :key="phase.startOrder"
            :editable="editable"
            :phase="phase"
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
const router = useRouter();
const route = useRoute();

watch(() => props.request.workItems, items => {
    workItems.value = [...(items ?? [])];
}, { immediate: true });

const phases = computed(() => groupRepairWorkItemsByPhase(workItems.value));
const completedWorkItems = computed(() => workItems.value.filter(workItem => workItem.status === 'DONE').length);

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

    &-copy {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-width: 780px;
    }

    &-header {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        justify-content: space-between;
    }

    &-actions {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: flex-end;
    }

    &-overview {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
    }

    &-stat {
        display: flex;
        flex-direction: column;
        gap: 4px;

        padding: 14px 16px;
        border: 1px solid $lightgray125;
        border-radius: 16px;

        background: linear-gradient(180deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 1%));

        &-value {
            font-size: 22px;
            font-weight: 800;
            line-height: 1;
            color: $typographyPrimary;
        }

        &-label {
            font-size: 12px;
            color: $typographyPrimary;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
    }

    &-legend {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 10px;
    }

    &-legend-item {
        display: flex;
        flex-direction: column;
        gap: 4px;

        padding: 12px 14px;
        border: 1px solid $lightgray125;
        border-radius: 14px;

        background: rgb(255 255 255 / 3%);

        &--empty {
            opacity: 0.6;
        }
    }

    &-legend-title {
        font-size: 13px;
        font-weight: 700;
        color: $typographyPrimary;
    }

    &-legend-label {
        font-size: 12px;
        color: $typographyPrimary;
    }
}
</style>
