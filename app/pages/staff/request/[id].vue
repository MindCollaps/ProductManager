<template>
    <common-page
        v-if="repairReq && repairReq.customer"
        :title="`Reparaturauftrag von ${ repairReq?.customer.displayName }`"
    >
        <ui-status :status="displayStatus"/>
        <div class="request-savings">
            <repair-savings-tile :summary="savingsSummary"/>
        </div>
        <div
            v-if="repairReq.statusHistory.length > 0"
            class="request-timeline"
        >
            <repair-timeline :history="repairReq.statusHistory"/>
        </div>
        <div class="request-container">
            <div class="request-customer">
                <h2>Kundendetails</h2>
                {{ repairReq?.customer.displayName }} ({{ repairReq?.customer.username }}) /
                {{ repairReq?.customer.email }}
                <div class="request-assign">
                    <h3>Zugewiesener Mitarbeiter</h3>
                    <common-selector
                        v-model="selectedAssignedStaff"
                        one
                        path="/api/v1/staff/user"
                    >
                        <template #add="{ item }">
                            {{ item.name }}
                        </template>
                        <template #remove="{ item }">
                            {{ item.name }}
                        </template>
                    </common-selector>
                    <ui-button
                        v-if="store.me && selectedAssignedStaff[0]?.id !== store.me.id"
                        @click="assignSelfToRequest"
                    >
                        Mir zuweisen
                    </ui-button>
                </div>
                <ui-button @click="openChat()">{{ chatButtonText }}</ui-button>
                <div
                    v-if="allWorkItemsDone"
                    class="request-state-actions"
                >
                    <ui-button
                        v-if="repairReq.status !== RepairRequestStatus.COMPLETED"
                        primary-color="primary500"
                        @click="setRequestState('COMPLETED')"
                    >
                        Abschließen
                    </ui-button>
                    <ui-button
                        v-if="repairReq.status !== RepairRequestStatus.COMPLETED"
                        primary-color="error600"
                        @click="confirmAction = 'REJECTED'"
                    >
                        Ablehnen
                    </ui-button>
                    <ui-button
                        v-if="repairReq.status !== RepairRequestStatus.COMPLETED"
                        primary-color="error600"
                        @click="confirmAction = 'CANCELLED'"
                    >
                        Stornieren
                    </ui-button>
                </div>
                <div
                    v-else-if="repairReq.workItems && repairReq.workItems.length > 0 && repairReq.status === RepairRequestStatus.ACCEPTED"
                    class="request-state-hint"
                >
                    Alle Arbeitsschritte müssen abgeschlossen sein, bevor die Anfrage abgeschlossen werden kann.
                </div>
                <ui-button
                    v-if="canArchive"
                    @click="confirmAction = 'ARCHIVE'"
                >
                    Anfrage archivieren
                </ui-button>
                <common-popup
                    close-text="Abbrechen"
                    :is-visible="confirmAction !== null"
                    :submit-color="confirmAction === 'ARCHIVE' ? 'primary500' : 'error600'"
                    :submit-text="confirmSubmitText"
                    @close="confirmAction = null"
                    @submit="executeConfirmedAction()"
                >
                    <p class="confirm-message">{{ confirmMessage }}</p>
                </common-popup>
            </div>
            <div class="request-params">
                <h2>Kundennotizen</h2>
                <labeled-text :value="repairReq?.subject">
                    Betreff
                </labeled-text>
                <labeled-text :value="repairReq?.deviceName">
                    Gerätename
                </labeled-text>
                <labeled-text :value="repairReq?.deviceBrand">
                    Gerätemarke
                </labeled-text>
                <labeled-text :value="repairReq?.deviceModel">
                    Gerätemodell
                </labeled-text>
                <labeled-text :value="repairReq?.problemDescription">
                    Problembeschreibung
                </labeled-text>
                <labeled-text :value="repairReq?.alreadyTried">
                    Bereits versucht
                </labeled-text>
                <labeled-text :value="repairReq?.suspectedIssue">
                    Vermutete Ursache
                </labeled-text>
                <labeled-text :value="repairReq?.customerNotes">
                    Sonstiges
                </labeled-text>
            </div>
            <div class="request-device">
                <h2>Reparaturgerät</h2>
                <div
                    v-if="!repairReq.device"
                    class="request-device-create"
                >
                    Noch kein Gerät zugeordnet
                    <ui-button @click="isVisible = true">Gerät zuordnen</ui-button>
                    <repair-device-select-popup
                        :is-visible="isVisible"
                        @close="isVisible = false"
                        @select="onDeviceSelected"
                    />
                </div>
                <div
                    v-else
                    class="request-device-container"
                >
                    <div class="request-device-section">
                        <ui-input-text v-model="displayName">Anzeigename</ui-input-text>
                        <ui-input-text v-model="serialNumber">Seriennummer</ui-input-text>
                        <ui-text-area v-model="notes">Notizen</ui-text-area>
                        <ui-button
                            :disabled="saveLoading"
                            @click="saveRepairDevice()"
                        >
                            {{ saveLoading ? 'Wird gespeichert…' : 'Speichern' }}
                        </ui-button>
                    </div>
                    <div class="request-device-section">
                        <h3>Gerät</h3>
                        <ui-labeled-text :value="repairDevice?.device?.name">Name</ui-labeled-text>
                        <ui-labeled-text :value="repairDevice?.device?.deviceBrand.name">Marke</ui-labeled-text>
                        <ui-labeled-text :value="(repairDevice?.device?.purchaseValue ?? '') as string">Neukaufwert</ui-labeled-text>
                    </div>
                    <div class="request-device-section">
                        <h3>Reparaturstatus</h3>
                        <ui-status :status="effectiveRepairStatus ?? repairReq.status"/>
                        <div class="request-device-status-actions">
                            <ui-button
                                v-if="primaryRepairStatusAction"
                                primary-color="primary500"
                                @click="setRepairStatus(primaryRepairStatusAction)"
                            >
                                {{ REPAIR_STATUS_LABELS[primaryRepairStatusAction] }}
                            </ui-button>
                            <button
                                v-if="secondaryRepairStatusActions.length > 0"
                                :aria-expanded="showMoreStatus"
                                class="request-status-more-btn"
                                type="button"
                                @click="showMoreStatus = !showMoreStatus"
                            >
                                {{ showMoreStatus ? 'Weniger Optionen' : 'Weitere Status' }}
                            </button>
                            <div
                                v-if="showMoreStatus"
                                class="request-device-status-more"
                            >
                                <ui-button
                                    v-for="statusAction in secondaryRepairStatusActions"
                                    :key="statusAction"
                                    @click="setRepairStatus(statusAction)"
                                >
                                    {{ REPAIR_STATUS_LABELS[statusAction] ?? statusAction }}
                                </ui-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="request-steps">
                <repair-step-graph
                    editable
                    :request="repairReq"
                    @update="onRepairStepGraphUpdate"
                />
            </div>
        </div>
    </common-page>
</template>

<script lang="ts" setup>
import { RepairRequestStatus, RepairStatus } from '@prisma/client';

import LabeledText from '~/components/ui/LabeledText.vue';
import RepairSavingsTile from '~/components/repair/RepairSavingsTile.vue';
import RepairTimeline from '~/components/repair/RepairTimeline.vue';
import { calculateRepairSavings } from '~~/app/utils/repairSavings';
import type { AppConfigResponse } from '~~/types/config';
import type { RepairDeviceWithRelationsType, RepairRequestWithRelationsType } from '~~/types/req';
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';
import { useSocketClient } from '~/composables/socketClient';
import { useStore } from '~/store';

const route = useRoute();
const id = route.params.id as string;
const isVisible = ref(false);
const { showToast } = useToastManager();
const store = useStore();

const displayName = ref('');
const serialNumber = ref('');
const notes = ref('');
const repairDevice = ref<RepairDeviceWithRelationsType | null>(null);
const confirmAction = ref<'REJECTED' | 'CANCELLED' | 'ARCHIVE' | null>(null);
const saveLoading = ref(false);
const showMoreStatus = ref(false);

type StaffUser = { id: string; name: string };
const selectedAssignedStaff = ref<StaffUser[]>([]);
const assignInitializing = ref(true);

const { data: repairReq, refresh: refreshRepairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/staff/request/${ id }`);
const { data: config } = useFetch<AppConfigResponse>('/api/v1/user/config');
const repairStatusOverride = ref<RepairStatus | null>(null);

const hourlyRate = computed(() => Number(config.value?.hourlyRate ?? 0));
const savingsSummary = computed(() => {
    if (!repairReq.value) {
        return { laborCost: 0, newPurchaseValue: 0, partsCost: 0, repairValue: 0, savedValue: 0 };
    }
    return calculateRepairSavings(repairReq.value, hourlyRate.value);
});

watch(() => repairReq.value?.assignedStaff, staff => {
    assignInitializing.value = true;
    const u = staff;
    selectedAssignedStaff.value = u
        ? [{ id: u.id, name: u.displayName ?? u.username ?? u.email }]
        : [];
    nextTick(() => {
        assignInitializing.value = false;
    });
}, { immediate: true });

watch(selectedAssignedStaff, async staff => {
    if (assignInitializing.value) return;
    await $fetch(`/api/v1/staff/request/${ id }`, {
        method: 'PUT',
        body: { assignedStaffId: staff[0]?.id ?? null },
    });
    await refreshRepairReq();
});

const latestRepairStatus = computed(() => repairReq.value?.statusHistory?.[0]?.status ?? null);
const effectiveRepairStatus = computed(() => repairStatusOverride.value ?? latestRepairStatus.value);
const isFirstWorkItemCompleted = computed(() => {
    const workItems = repairReq.value?.workItems ?? [];

    if (workItems.length === 0) {
        return false;
    }

    const firstWorkItem = [...workItems].sort((left, right) => left.orderIndex - right.orderIndex)[0];
    return firstWorkItem?.status === 'DONE';
});
const displayStatus = computed(() => {
    if (!repairReq.value) {
        return RepairRequestStatus.WAITING_FOR_REVIEW;
    }

    if (repairReq.value.status === RepairRequestStatus.ACCEPTED && effectiveRepairStatus.value && isFirstWorkItemCompleted.value) {
        return effectiveRepairStatus.value;
    }

    return repairReq.value.status;
});
const allWorkItemsDone = computed(() => {
    if (!repairReq.value?.workItems || repairReq.value.workItems.length === 0) {
        return false;
    }

    return repairReq.value.workItems.every(workItem => workItem.status === 'DONE');
});
const isArchived = computed(() => repairReq.value?.statusHistory?.some(item => item.status === RepairStatus.ARCHIVED) ?? false);
const canArchive = computed(() => repairReq.value?.status === RepairRequestStatus.COMPLETED && !isArchived.value);

const REPAIR_STATUS_SEQUENCE: RepairStatus[] = [
    RepairStatus.RECEIVED,
    RepairStatus.IN_DIAGNOSIS,
    RepairStatus.WAITING_FOR_PARTS,
    RepairStatus.IN_REPAIR,
    RepairStatus.IN_QA,
    RepairStatus.IN_OUTGOING,
    RepairStatus.ON_THE_WAY_TO_CUSTOMER,
    RepairStatus.DELIVERED,
];

const repairStatusActions = computed<RepairStatus[]>(() => {
    const actions: RepairStatus[] = [
        RepairStatus.RECEIVED,
        RepairStatus.IN_DIAGNOSIS,
        RepairStatus.WAITING_FOR_PARTS,
        RepairStatus.IN_REPAIR,
        RepairStatus.IN_QA,
        RepairStatus.IN_OUTGOING,
    ];

    if (effectiveRepairStatus.value === RepairStatus.IN_OUTGOING) {
        actions.push(RepairStatus.ON_THE_WAY_TO_CUSTOMER);
    }

    if (effectiveRepairStatus.value === RepairStatus.ON_THE_WAY_TO_CUSTOMER) {
        actions.push(RepairStatus.DELIVERED);
    }

    return actions.filter(status => status !== effectiveRepairStatus.value);
});

const primaryRepairStatusAction = computed<RepairStatus | null>(() => {
    if (repairStatusActions.value.length === 0) return null;
    const current = effectiveRepairStatus.value;
    if (current === null) return repairStatusActions.value[0] ?? null;
    const currentIdx = REPAIR_STATUS_SEQUENCE.indexOf(current);
    if (currentIdx === -1) return repairStatusActions.value[0] ?? null;
    for (let i = currentIdx + 1; i < REPAIR_STATUS_SEQUENCE.length; i++) {
        const candidate = REPAIR_STATUS_SEQUENCE[i];
        if (candidate && repairStatusActions.value.includes(candidate)) return candidate;
    }
    return repairStatusActions.value[0] ?? null;
});

const secondaryRepairStatusActions = computed<RepairStatus[]>(() => repairStatusActions.value.filter(s => s !== primaryRepairStatusAction.value));

const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
    [RepairStatus.RECEIVED]: 'Empfangen',
    [RepairStatus.IN_DIAGNOSIS]: 'Diagnose',
    [RepairStatus.WAITING_FOR_PARTS]: 'Warte auf Teile',
    [RepairStatus.IN_REPAIR]: 'In Reparatur',
    [RepairStatus.IN_QA]: 'Qualitätsprüfung',
    [RepairStatus.IN_OUTGOING]: 'Im Ausgang',
    [RepairStatus.ON_THE_WAY_TO_CUSTOMER]: 'Unterwegs zum Kunden',
    [RepairStatus.DELIVERED]: 'Zugestellt',
    [RepairStatus.ARCHIVED]: 'Archiviert',
    [RepairStatus.ON_THE_WAY_TO_SHOP]: 'Unterwegs',
};

const chatButtonText = computed(() => {
    if (repairReq.value?.status === RepairRequestStatus.WAITING_FOR_REVIEW) {
        return 'Kunden fragen';
    }

    return 'Chat';
});

const confirmMessage = computed(() => {
    const name = repairReq.value?.customer?.displayName ?? 'diesem Kunden';
    if (confirmAction.value === 'REJECTED') {
        return `Möchtest du die Reparaturanfrage von ${ name } dauerhaft ablehnen? Diese Aktion kann nicht rückgängig gemacht werden.`;
    }
    if (confirmAction.value === 'CANCELLED') {
        return `Möchtest du die Reparaturanfrage von ${ name } dauerhaft stornieren? Diese Aktion kann nicht rückgängig gemacht werden.`;
    }
    if (confirmAction.value === 'ARCHIVE') {
        return `Möchtest du diese Reparaturanfrage archivieren? Sie wird im Archiv gespeichert und aus der aktiven Liste entfernt.`;
    }
    return '';
});

const confirmSubmitText = computed(() => {
    if (confirmAction.value === 'REJECTED') return 'Ablehnen';
    if (confirmAction.value === 'CANCELLED') return 'Stornieren';
    if (confirmAction.value === 'ARCHIVE') return 'Archivieren';
    return 'Bestätigen';
});

async function executeConfirmedAction() {
    const action = confirmAction.value;
    confirmAction.value = null;
    if (action === 'REJECTED') await setRequestState('REJECTED');
    else if (action === 'CANCELLED') await setRequestState('CANCELLED');
    else if (action === 'ARCHIVE') await archiveRequest();
}

async function loadRepairDevice() {
    if (!repairReq.value?.device?.id) {
        repairDevice.value = null;
        return;
    }

    repairDevice.value = await $fetch<RepairDeviceWithRelationsType>(`/api/v1/staff/repair-device/${ repairReq.value.device.id }`);

    displayName.value = repairDevice.value.displayName;
    serialNumber.value = repairDevice.value.serialNumber ?? '';
    notes.value = repairDevice.value.notes ?? '';
}

watch(() => repairReq.value?.device?.id, async () => {
    await loadRepairDevice();
}, {
    immediate: true,
});

async function syncRequestStateView() {
    await refreshRepairReq();
}

async function onRepairStepGraphUpdate() {
    await syncRequestStateView();
}

async function onDeviceSelected(device: { id: string; name: string }) {
    if (!repairReq.value) return;
    isVisible.value = false;
    await $fetch('/api/v1/staff/repair-device', {
        method: 'POST',
        body: {
            deviceId: device.id,
            displayName: device.name,
            requestId: repairReq.value.id,
        },
    });
    await syncRequestStateView();
    await loadRepairDevice();
}

async function saveRepairDevice() {
    if (saveLoading.value) return;
    saveLoading.value = true;

    try {
        await $fetch(`/api/v1/staff/repair-device/${ repairDevice.value?.id }`, {
            method: 'PUT',
            body: {
                displayName: displayName.value,
                serialNumber: serialNumber.value,
                notes: notes.value,
            },
        });
        showToast({ mode: ToastMode.Success, message: 'Gerät gespeichert.' });
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Speichern fehlgeschlagen. Bitte erneut versuchen.' });
    }
    finally {
        saveLoading.value = false;
    }
}

async function assignSelfToRequest() {
    if (!store.me) return;
    await $fetch(`/api/v1/staff/request/${ id }`, {
        method: 'PUT',
        body: { assignedStaffId: store.me.id },
    });
    await refreshRepairReq();
}

async function openChat() {
    if (!repairReq.value) {
        return;
    }

    await $fetch(`/api/v1/staff/request/${ repairReq.value.id }/chat`, {
        method: 'POST',
    });

    await navigateTo(`/chat/room/${ repairReq.value.id }`);
}

async function setRequestState(status: Extract<RepairRequestStatus, 'CANCELLED' | 'REJECTED' | 'COMPLETED'>) {
    if (!repairReq.value) {
        return;
    }

    const previousStatus = repairReq.value.status;
    repairReq.value.status = status;

    try {
        await $fetch(`/api/v1/staff/request/${ repairReq.value.id }/state`, {
            method: 'PUT',
            body: { status },
        });
    }
    catch {
        repairReq.value.status = previousStatus;
        showToast({ mode: ToastMode.Error, message: 'Statusänderung fehlgeschlagen. Bitte erneut versuchen.' });
        return;
    }

    await syncRequestStateView();
}

async function setRepairStatus(status: RepairStatus) {
    if (!repairReq.value) {
        return;
    }

    showMoreStatus.value = false;
    repairStatusOverride.value = status;

    try {
        await $fetch(`/api/v1/staff/request/${ repairReq.value.id }/repair-status`, {
            method: 'PUT',
            body: { status },
        });
    }
    catch {
        repairStatusOverride.value = null;
        showToast({ mode: ToastMode.Error, message: 'Reparaturstatus konnte nicht aktualisiert werden.' });
        return;
    }

    await syncRequestStateView();
    repairStatusOverride.value = null;
}

async function archiveRequest() {
    if (!repairReq.value) {
        return;
    }

    try {
        await $fetch(`/api/v1/staff/request/${ repairReq.value.id }/archive`, {
            method: 'POST',
        });
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Archivierung fehlgeschlagen. Bitte erneut versuchen.' });
        return;
    }

    await syncRequestStateView();
}

const socket = useSocketClient();
onMounted(() => {
    socket?.emit('repair:watch', { requestId: id });
    socket?.on('repair:update', async ({ requestId }) => {
        if (requestId === id) await refreshRepairReq();
    });
});
onUnmounted(() => {
    socket?.emit('repair:unwatch', { requestId: id });
    socket?.off('repair:update');
});
</script>

<style lang="scss" scoped>
.request {
    &-container {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 32px;
        width: 100%;

        @include mobile {
            display: flex;
            flex-direction: column;
        }
    }

    &-params {
        display: flex;
        flex-direction: column;
        gap: 12px;

        padding: 16px;
        border-radius: 8px;

        background: $darkgray800;
    }

    &-device {
        padding: 16px;
        border-radius: 8px;
        background: $darkgray800;

        &-create {
            display: flex;
            flex-direction: column;
            gap: 12px;

            font-size: 13px;
            line-height: 1.4;
            color: $lightgray400;
        }

        &-container {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        &-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px 0;

            &:first-child {
                padding-top: 0;
            }

            &:last-child {
                padding-bottom: 0;
            }

            & + & {
                border-top: 1px solid $darkgray700;
            }

            h3 {
                margin: 0;

                font-size: 11px;
                font-weight: 600;
                color: $lightgray400;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
        }

        &-status-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        &-status-more {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }
    }

    &-steps {
        padding: 16px;
        border-radius: 8px;
        background: $darkgray800;
    }

    &-savings {
        grid-column: 1 / -1;
        width: 100%;
    }

    &-timeline {
        grid-column: 1 / -1;

        width: 100%;
        padding: 16px;
        border-radius: 8px;

        background: $darkgray800;
    }

    &-customer {
        display: flex;
        flex-direction: column;
        gap: 16px;

        padding: 16px;
        border-radius: 8px;

        background: $darkgray800;
    }

    &-assign {
        display: flex;
        flex-direction: column;
        gap: 8px;

        h3 {
            margin: 0;
            font-size: 13px;
            font-weight: 600;
        }
    }

    &-state-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    &-state-hint {
        font-size: 12px;
        line-height: 1.4;
        color: $lightgray400;
    }

}

.request-status-more-btn {
    cursor: pointer;

    padding: 2px 0;
    border: none;

    font-size: 12px;
    color: $lightgray400;
    text-align: left;

    background: none;

    transition: color 0.15s ease;

    &:hover {
        color: $lightgray150;
    }

    &:focus-visible {
        border-radius: 4px;
        color: $lightgray150;
        outline: 2px solid $primary500;
        outline-offset: 3px;
    }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}

.confirm-message {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: $lightgray150;

    &-params {
        display: flex;
        flex-direction: column;
        gap: 16px;

        padding: 16px;
        border-radius: 8px;

        background: $darkgray800;
    }
}
</style>
