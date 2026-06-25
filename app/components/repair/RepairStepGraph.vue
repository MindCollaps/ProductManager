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
                    :part-orders="partOrders"
                    @addPart="openPartPopup(item.id)"
                    @changePartStatus="updatePartOrderStatus"
                    @delete="deleteWorkItem(item)"
                    @edit="openEdit(item)"
                    @toggleDone="toggleWorkItemCompletion(item)"
                    @toggleInProgress="toggleWorkItemInProgress(item)"
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

        <common-popup
            :is-visible="isPartPopupVisible"
            submit-text="Add part"
            @close="closePartPopup"
            @submit="createPartOrder"
        >
            <div class="step-graph-part-popup">
                <h3>Add part to step</h3>
                <common-selector
                    v-model="selectedCatalogPart"
                    one
                    path="/api/v1/staff/part-catalog"
                >
                    <template #add="{ item }">
                        {{ item.name }}
                    </template>
                    <template #remove="{ item }">
                        {{ item.name }}
                    </template>
                </common-selector>
                <ui-input-number v-model="partQuantity">Quantity</ui-input-number>
                <ui-input-text v-model="partSupplier">Supplier</ui-input-text>
                <ui-input-number v-model="partEstimatedCost">Estimated Cost</ui-input-number>
                <ui-text-area v-model="partNote">Note</ui-text-area>
            </div>
        </common-popup>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { PartCatalog, PartOrderStatus } from '@prisma/client';

import type { PartOrderResponse, PartOrderUpdatePayload } from '~~/types/parts';
import type { PartOrderWithRelationsType, RepairRequestWithRelationsType, RepairWorkItemWithRelationsType } from '~~/types/req';
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
const partOrders = ref<PartOrderWithRelationsType[]>([]);
const isEditorVisible = ref(false);
const editingItem = ref<RepairWorkItemWithRelationsType | null>(null);
const editorDefaultOrderIndex = ref(0);
const isPartPopupVisible = ref(false);
const selectedWorkItemId = ref<string | null>(null);
const selectedCatalogPart = ref<PartCatalog[]>([]);
const partQuantity = ref(1);
const partSupplier = ref('');
const partEstimatedCost = ref<number | null>(null);
const partNote = ref('');
const router = useRouter();
const route = useRoute();

watch(() => props.request.workItems, items => {
    workItems.value = [...(items ?? [])];
}, { immediate: true });

watch(() => props.request.partOrders, orders => {
    partOrders.value = [...(orders ?? [])];
}, { immediate: true });

watch(selectedCatalogPart, parts => {
    const part = parts[0];
    if (part?.retailPrice != null) {
        partEstimatedCost.value = parseFloat(String(part.retailPrice));
    }
});

const phases = computed(() => groupRepairWorkItemsByPhase(workItems.value));
const completedWorkItems = computed(() => workItems.value.filter(workItem => workItem.status === 'DONE').length);

function closeEditor() {
    isEditorVisible.value = false;
    editingItem.value = null;
}

function closePartPopup() {
    isPartPopupVisible.value = false;
    selectedWorkItemId.value = null;
    selectedCatalogPart.value = [];
    partQuantity.value = 1;
    partSupplier.value = '';
    partEstimatedCost.value = null;
    partNote.value = '';
}

function openPartPopup(workItemId: string) {
    selectedWorkItemId.value = workItemId;
    isPartPopupVisible.value = true;
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

function upsertLocalPartOrder(partOrder: PartOrderWithRelationsType) {
    const existingIndex = partOrders.value.findIndex(existing => existing.id === partOrder.id);

    if (existingIndex === -1) {
        partOrders.value = [partOrder, ...partOrders.value];
        return;
    }

    const nextPartOrders = [...partOrders.value];
    nextPartOrders.splice(existingIndex, 1, partOrder);
    partOrders.value = nextPartOrders;
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
        status: draft.status,
        completedAt: draft.status === 'DONE' ? new Date().toISOString() : null,
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

    partOrders.value = partOrders.value.filter(po => po.workItemId !== item.id);
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
            status: completed ? 'DONE' : 'PENDING',
            completedAt: completed ? new Date().toISOString() : null,
        },
        method: 'PUT',
    });

    upsertLocalWorkItem(response.data);
}

async function toggleWorkItemInProgress(item: RepairWorkItemWithRelationsType) {
    const inProgress = item.status !== 'IN_PROGRESS';

    const response = await $fetch<{ data: RepairWorkItemWithRelationsType }>(`/api/v1/staff/request/${ props.request.id }/steps/${ item.id }`, {
        body: {
            title: item.title,
            description: item.description ?? '',
            orderIndex: item.orderIndex,
            workItemTypeId: item.workItemType.id,
            assignedStaffId: item.assignedStaff?.id ?? null,
            laborMinutes: item.laborMinutes ?? null,
            status: inProgress ? 'IN_PROGRESS' : 'PENDING',
            completedAt: null,
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

async function createPartOrder() {
    const workItemId = selectedWorkItemId.value;
    const catalogPart = selectedCatalogPart.value[0];

    if (!workItemId || !catalogPart) {
        return;
    }

    const response = await $fetch<PartOrderResponse>(`/api/v1/staff/request/${ props.request.id }/steps/${ workItemId }/parts`, {
        body: {
            catalogPartId: catalogPart.id,
            quantity: partQuantity.value,
            supplierName: partSupplier.value || undefined,
            estimatedCost: partEstimatedCost.value,
            note: partNote.value || undefined,
            workItemId,
        },
        method: 'POST',
    });

    upsertLocalPartOrder(response.data);
    closePartPopup();
}

async function updatePartOrderStatus(partId: string, status: PartOrderStatus) {
    const payload: PartOrderUpdatePayload = {
        status,
    };

    const response = await $fetch<PartOrderResponse>(`/api/v1/staff/request/${ props.request.id }/parts/${ partId }`, {
        body: payload,
        method: 'PUT',
    });

    upsertLocalPartOrder(response.data);
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

    &-part-popup {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: min(560px, 80vw);
    }
}
</style>
