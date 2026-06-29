<template>
    <div class="step-graph">
        <div class="step-graph-header">
            <div class="step-graph-copy">
                <h2>Arbeitsschritte</h2>
                <div
                    v-if="workItems.length > 0"
                    class="step-graph-count"
                >
                    <transition
                        mode="out-in"
                        name="stat-count"
                    >
                        <span
                            :key="completedWorkItems"
                            class="step-graph-count-num"
                        >{{ completedWorkItems }}</span>
                    </transition>
                    <span class="step-graph-count-sep"> / {{ workItems.length }} erledigt</span>
                </div>
            </div>

            <div class="step-graph-actions">
                <ui-button
                    v-if="editable && request.status === 'ACCEPTED'"
                    :disabled="isBusy"
                    @click="workItems.length === 0 ? initializeDefaultSteps() : openResetConfirm()"
                >
                    {{ workItems.length === 0 ? 'Standardschritte anlegen' : 'Zurücksetzen' }}
                </ui-button>
                <ui-button
                    v-if="editable"
                    @click="openCreate(0)"
                >
                    Schritt hinzufügen
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

        <transition name="step-graph-fade">
            <common-box v-if="workItems.length === 0">
                <h3>Noch keine Schritte definiert</h3>
                <p v-if="editable">Standardschritte anlegen oder den ersten Schritt manuell hinzufügen.</p>
                <p v-else>Sobald das Team Schritte anlegt, werden sie hier angezeigt.</p>
            </common-box>
        </transition>

        <transition-group
            appear
            class="step-graph-phases"
            name="phase-list"
            tag="div"
        >
            <repair-step-phase
                v-for="(phase, i) in phases"
                :key="phase.startOrder"
                :editable="editable"
                :phase="phase"
                :style="{ '--phase-i': i }"
                @add="openCreate"
            >
                <template #default="{ index, item }">
                    <repair-work-item-card
                        :current-user-id="store.me?.id ?? null"
                        :editable="editable"
                        :item="item"
                        :part-orders="partOrders"
                        :style="{ '--card-i': index }"
                        @addPart="openPartPopup(item.id)"
                        @assignSelf="assignSelfToWorkItem(item)"
                        @changePartStatus="updatePartOrderStatus"
                        @delete="openDeleteConfirm(item)"
                        @edit="openEdit(item)"
                        @toggleDone="toggleWorkItemCompletion(item)"
                        @toggleInProgress="toggleWorkItemInProgress(item)"
                    />
                </template>
            </repair-step-phase>
        </transition-group>

        <repair-work-item-editor
            v-if="editable"
            :default-order-index="editorDefaultOrderIndex"
            :is-visible="isEditorVisible"
            :item="editingItem"
            :phase-end-order="editorPhaseEndOrder"
            :phase-start-order="editorPhaseStartOrder"
            :title="editingItem ? 'Schritt bearbeiten' : 'Neuer Schritt'"
            @close="closeEditor"
            @save="saveWorkItem"
        />

        <common-popup
            :is-visible="isPartPopupVisible"
            submit-text="Teil hinzufügen"
            @close="closePartPopup"
            @submit="createPartOrder"
        >
            <div class="step-graph-part-popup">
                <h3>Ersatzteil hinzufügen</h3>
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
                <ui-input-number v-model="partQuantity">Menge</ui-input-number>
                <ui-input-text v-model="partSupplier">Lieferant</ui-input-text>
                <ui-input-number v-model="partEstimatedCost">Kalkulierter Preis</ui-input-number>
                <ui-text-area v-model="partNote">Notiz</ui-text-area>
            </div>
        </common-popup>

        <common-popup
            close-text="Abbrechen"
            :is-visible="isDeleteConfirmVisible"
            submit-color="error600"
            submit-text="Löschen"
            @close="cancelDelete"
            @submit="confirmDelete"
        >
            <div class="step-graph-confirm-popup">
                <h3>Schritt löschen?</h3>
                <p v-if="itemPendingDelete">„{{ itemPendingDelete.title }}" wird unwiderruflich gelöscht.</p>
            </div>
        </common-popup>

        <common-popup
            close-text="Abbrechen"
            :is-visible="isResetConfirmVisible"
            submit-color="error600"
            submit-text="Zurücksetzen"
            @close="isResetConfirmVisible = false"
            @submit="confirmReset"
        >
            <div class="step-graph-confirm-popup">
                <h3>Schritte zurücksetzen?</h3>
                <p>Alle aktuellen Schritte werden durch die Standardschritte ersetzt. Diese Aktion kann nicht rückgängig gemacht werden.</p>
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
import { ToastMode } from '~~/types/toast';
import { useStore } from '~/store';

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

const emit = defineEmits<{ update: [] }>();

const { showToast } = useToastManager();

const workItems = ref<RepairWorkItemWithRelationsType[]>([]);
const partOrders = ref<PartOrderWithRelationsType[]>([]);
const isEditorVisible = ref(false);
const editingItem = ref<RepairWorkItemWithRelationsType | null>(null);
const editorDefaultOrderIndex = ref(0);
const editorPhaseStartOrder = ref<number | null>(null);
const editorPhaseEndOrder = ref<number | null>(null);
const store = useStore();
const isPartPopupVisible = ref(false);
const isResetConfirmVisible = ref(false);
const itemPendingDelete = ref<RepairWorkItemWithRelationsType | null>(null);
const selectedWorkItemId = ref<string | null>(null);
const selectedCatalogPart = ref<PartCatalog[]>([]);
const partQuantity = ref(1);
const partSupplier = ref('');
const partEstimatedCost = ref<number | null>(null);
const partNote = ref('');
const isBusy = ref(false);
const router = useRouter();
const route = useRoute();

const isDeleteConfirmVisible = computed(() => itemPendingDelete.value !== null);

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
    editorPhaseStartOrder.value = null;
    editorPhaseEndOrder.value = null;
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

function openCreate(orderIndex: number, phaseEnd?: number) {
    editingItem.value = null;
    editorDefaultOrderIndex.value = orderIndex;
    if (phaseEnd !== undefined) {
        editorPhaseStartOrder.value = orderIndex;
        editorPhaseEndOrder.value = phaseEnd;
    }
    else {
        editorPhaseStartOrder.value = null;
        editorPhaseEndOrder.value = null;
    }
    isEditorVisible.value = true;
}

function openEdit(item: RepairWorkItemWithRelationsType) {
    editingItem.value = item;
    editorDefaultOrderIndex.value = item.orderIndex;
    editorPhaseStartOrder.value = item.orderIndex;
    editorPhaseEndOrder.value = getWorkItemPhaseEnd(item.orderIndex);
    isEditorVisible.value = true;
}

function openDeleteConfirm(item: RepairWorkItemWithRelationsType) {
    itemPendingDelete.value = item;
}

function cancelDelete() {
    itemPendingDelete.value = null;
}

function openResetConfirm() {
    isResetConfirmVisible.value = true;
}

async function confirmReset() {
    isResetConfirmVisible.value = false;
    await initializeDefaultSteps();
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
    let payload: ReturnType<typeof buildPayload>;
    try {
        payload = buildPayload(draft);
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Bitte einen Arbeitsschritttyp auswählen.' });
        return;
    }

    try {
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
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Schritt konnte nicht gespeichert werden. Bitte erneut versuchen.' });
    }
}

async function confirmDelete() {
    const item = itemPendingDelete.value;
    if (!item) return;
    itemPendingDelete.value = null;

    try {
        await $fetch(`/api/v1/staff/request/${ props.request.id }/steps/${ item.id }`, {
            method: 'DELETE',
        });
        partOrders.value = partOrders.value.filter(po => po.workItemId !== item.id);
        removeLocalWorkItem(item.id);
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Schritt konnte nicht gelöscht werden. Bitte erneut versuchen.' });
    }
}

async function toggleWorkItemCompletion(item: RepairWorkItemWithRelationsType) {
    const completed = item.status !== 'DONE';

    try {
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
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Status konnte nicht aktualisiert werden.' });
    }
}

async function toggleWorkItemInProgress(item: RepairWorkItemWithRelationsType) {
    const inProgress = item.status !== 'IN_PROGRESS';

    try {
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
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Status konnte nicht aktualisiert werden.' });
    }
}

async function assignSelfToWorkItem(item: RepairWorkItemWithRelationsType) {
    const selfId = store.me?.id;
    if (!selfId) return;

    try {
        const response = await $fetch<{ data: RepairWorkItemWithRelationsType }>(`/api/v1/staff/request/${ props.request.id }/steps/${ item.id }`, {
            body: {
                title: item.title,
                description: item.description ?? '',
                orderIndex: item.orderIndex,
                workItemTypeId: item.workItemType.id,
                assignedStaffId: selfId,
                laborMinutes: item.laborMinutes ?? null,
                status: item.status,
                completedAt: item.completedAt ?? null,
            },
            method: 'PUT',
        });
        upsertLocalWorkItem(response.data);
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Zuweisung konnte nicht gespeichert werden.' });
    }
}

async function initializeDefaultSteps() {
    isBusy.value = true;
    try {
        const response = await $fetch<RepairWorkItemWithRelationsType[]>(`/api/v1/staff/request/${ props.request.id }/steps/defaults`, {
            method: 'POST',
        });
        workItems.value = [...response];
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Standardschritte konnten nicht geladen werden. Bitte erneut versuchen.' });
    }
    finally {
        isBusy.value = false;
    }
}

async function createPartOrder() {
    const workItemId = selectedWorkItemId.value;
    const catalogPart = selectedCatalogPart.value[0];

    if (!workItemId || !catalogPart) {
        showToast({ mode: ToastMode.Error, message: 'Bitte ein Ersatzteil aus dem Katalog auswählen.' });
        return;
    }

    isBusy.value = true;
    try {
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
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Ersatzteil konnte nicht hinzugefügt werden. Bitte erneut versuchen.' });
    }
    finally {
        isBusy.value = false;
    }
}

async function updatePartOrderStatus(partId: string, status: PartOrderStatus) {
    const payload: PartOrderUpdatePayload = {
        status,
    };

    try {
        const response = await $fetch<PartOrderResponse>(`/api/v1/staff/request/${ props.request.id }/parts/${ partId }`, {
            body: payload,
            method: 'PUT',
        });
        upsertLocalPartOrder(response.data);
        emit('update');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Teilestatus konnte nicht aktualisiert werden.' });
    }
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

    &-phases {
        display: flex;
        flex-direction: column;
        gap: 18px;
    }

    &-count {
        display: flex;
        gap: 2px;
        align-items: baseline;

        font-size: 13px;
        color: $lightgray400;

        &-num {
            display: inline-block;
            font-weight: 700;
            color: $typographyPrimary;
        }
    }

    &-part-popup {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: min(560px, 80vw);
    }

    &-confirm-popup {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: min(440px, 80vw);

        p {
            font-size: 13px;
            color: $lightgray400;
        }
    }
}

// Phase list — enter/leave
.phase-list-enter-active {
    transition: opacity 350ms cubic-bezier(0.25, 1, 0.5, 1),
        transform 350ms cubic-bezier(0.25, 1, 0.5, 1);
    transition-delay: calc(var(--phase-i, 0) * 70ms);
}

.phase-list-leave-active {
    transition: opacity 200ms ease-in;
}

.phase-list-enter-from {
    transform: translateY(14px);
    opacity: 0;
}

.phase-list-leave-to {
    opacity: 0;
}

// Empty state fade
.step-graph-fade-enter-active {
    transition: opacity 200ms ease-out;
}

.step-graph-fade-leave-active {
    transition: opacity 150ms ease-in;
}

.step-graph-fade-enter-from,
.step-graph-fade-leave-to {
    opacity: 0;
}

// Stat counter flip
.stat-count-enter-active {
    transition: opacity 150ms ease-out,
        transform 150ms cubic-bezier(0.25, 1, 0.5, 1);
}

.stat-count-leave-active {
    transition: opacity 100ms ease-in;
}

.stat-count-enter-from {
    transform: translateY(6px);
    opacity: 0;
}

.stat-count-leave-to {
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .phase-list-enter-active,
    .phase-list-leave-active,
    .step-graph-fade-enter-active,
    .step-graph-fade-leave-active,
    .stat-count-enter-active,
    .stat-count-leave-active {
        transition-delay: 0ms !important;
        transition-duration: 0.01ms !important;
    }
}
</style>
