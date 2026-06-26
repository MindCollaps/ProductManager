<template>
    <common-page
        v-if="repairReq && repairReq.customer"
        :title="`Reperaturauftrag von ${ repairReq?.customer.displayName }`"
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
                <h2>Customer details</h2>
                {{ repairReq?.customer.displayName }} ({{ repairReq?.customer.username }}) /
                {{ repairReq?.customer.email }}
                <div class="request-assign">
                    <h3>Assigned Staff</h3>
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
                </div>
                <ui-button @click="openChat()">{{ chatButtonText }}</ui-button>
                <div
                    v-if="allWorkItemsDone"
                    class="request-state-actions"
                >
                    <ui-button
                        v-if="repairReq.status !== RepairRequestStatus.COMPLETED"
                        @click="setRequestState('COMPLETED')"
                    >Mark Complete</ui-button>
                    <ui-button
                        v-if="repairReq.status !== RepairRequestStatus.COMPLETED"
                        primary-color="error600"
                        @click="setRequestState('REJECTED')"
                    >
                        Reject
                    </ui-button>
                    <ui-button
                        v-if="repairReq.status !== RepairRequestStatus.COMPLETED"
                        primary-color="error600"
                        @click="setRequestState('CANCELLED')"
                    >
                        Cancel
                    </ui-button>
                </div>
                <ui-button
                    v-if="canArchive"
                    @click="archiveRequest()"
                >
                    Archive Request
                </ui-button>
            </div>
            <div class="request-params">
                <h2>Customer Notes</h2>
                <labeled-text :value="repairReq?.subject">
                    Subject
                </labeled-text>
                <labeled-text :value="repairReq?.deviceName">
                    Geraetename
                </labeled-text>
                <labeled-text :value="repairReq?.deviceBrand">
                    Geraete Marke
                </labeled-text>
                <labeled-text :value="repairReq?.deviceModel">
                    Geraete Modell
                </labeled-text>
                <labeled-text :value="repairReq?.problemDescription">
                    Problembeschreibung
                </labeled-text>
                <labeled-text :value="repairReq?.alreadyTried ">
                    Hat versucht
                </labeled-text>
                <labeled-text :value="repairReq?.suspectedIssue ">
                    Denkt Ursache ist
                </labeled-text>
                <labeled-text :value="repairReq?.customerNotes">
                    Sonstiges
                </labeled-text>
            </div>
            <div class="request-device">
                <h2>Repair Device</h2>
                <div
                    v-if="!repairReq.device"
                    class="request-device-create"
                >
                    Noch kein Device erstellt
                    <ui-button @click="isVisible = true">Create</ui-button>
                    <common-popup
                        :is-visible="isVisible"
                        @close="isVisible = false"
                        @submit="onSubmit()"
                    >
                        <div class="request-device_popup-container">
                            <div
                                v-for="d in devices"
                                :key="d.id"
                                class="request-device_popup"
                            >
                                {{ d.name }}
                                <ui-button @click="selectedDevice?.id === d.id ? selectedDevice = null : selectedDevice = d">{{ d.id === selectedDevice?.id ? 'Unselect' : 'Select' }}</ui-button>
                            </div>
                        </div>
                    </common-popup>
                </div>
                <div
                    v-else
                    class="request-device-container"
                >
                    <ui-input-text v-model="displayName">Display Name</ui-input-text>
                    <ui-input-text v-model="serialNumber">Serial Number</ui-input-text>
                    <ui-text-area v-model="notes">Notes</ui-text-area>
                    <ui-button @click="saveRepairDevice()">Save</ui-button>
                    <h3>Device</h3>
                    <ui-labeled-text :value="repairDevice?.device?.name">Name</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.device?.deviceBrand.name">Brand</ui-labeled-text>
                    <ui-labeled-text :value="(repairDevice?.device?.purchaseValue ?? '') as string">Neukaufwert</ui-labeled-text>
                    <h3>Repair Status</h3>
                    <ui-status :status="effectiveRepairStatus ?? repairReq.status"/>
                    <div class="request-device-status-actions">
                        <ui-button
                            v-for="statusAction in repairStatusActions"
                            :key="statusAction"
                            @click="setRepairStatus(statusAction)"
                        >
                            {{ statusAction }}
                        </ui-button>
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

import type { Device } from '@prisma/client';
import LabeledText from '~/components/ui/LabeledText.vue';
import RepairSavingsTile from '~/components/repair/RepairSavingsTile.vue';
import RepairTimeline from '~/components/repair/RepairTimeline.vue';
import { calculateRepairSavings } from '~~/app/utils/repairSavings';
import type { AppConfigResponse } from '~~/types/config';
import type { RepairDeviceWithRelationsType, RepairRequestWithRelationsType } from '~~/types/req';

const route = useRoute();
const id = route.params.id as string;
const isVisible = ref(false);

const displayName = ref('');
const serialNumber = ref('');
const notes = ref('');
const selectedDevice: Ref<Device | null> = ref(null);
const repairDevice = ref<RepairDeviceWithRelationsType | null>(null);

type StaffUser = { id: string; name: string };
const selectedAssignedStaff = ref<StaffUser[]>([]);
const assignInitializing = ref(true);

const { data: repairReq, refresh: refreshRepairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/staff/request/${ id }`);
const { data: devices } = useFetch<Device[]>('/api/v1/staff/device');
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

const chatButtonText = computed(() => {
    if (repairReq.value?.status === RepairRequestStatus.WAITING_FOR_REVIEW) {
        return 'Frag den Customer';
    }

    return 'Chat';
});

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

async function onSubmit() {
    if (selectedDevice.value && repairReq.value) {
        isVisible.value = false;
        await $fetch('/api/v1/staff/repair-device', {
            method: 'POST',
            body: {
                deviceId: selectedDevice.value.id,
                displayName: selectedDevice.value.name,
                requestId: repairReq.value.id,
            },
        });
        await syncRequestStateView();
        await loadRepairDevice();
    }
}

async function saveRepairDevice() {
    await $fetch(`/api/v1/staff/repair-device/${ repairDevice.value?.id }`, {
        method: 'PUT',
        body: {
            displayName: displayName.value,
            serialNumber: serialNumber.value,
            notes: notes.value,
        },
    });
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
            body: {
                status,
            },
        });
    }
    catch {
        repairReq.value.status = previousStatus;
        throw createError({
            statusCode: 400,
            statusMessage: 'State update failed',
        });
    }

    await syncRequestStateView();
}

async function setRepairStatus(status: RepairStatus) {
    if (!repairReq.value) {
        return;
    }

    repairStatusOverride.value = status;

    try {
        await $fetch(`/api/v1/staff/request/${ repairReq.value.id }/repair-status`, {
            method: 'PUT',
            body: {
                status,
            },
        });
    }
    catch {
        repairStatusOverride.value = null;
        throw createError({
            statusCode: 400,
            statusMessage: 'Repair status update failed',
        });
    }

    await syncRequestStateView();
    repairStatusOverride.value = null;
}

async function archiveRequest() {
    if (!repairReq.value) {
        return;
    }

    await $fetch(`/api/v1/staff/request/${ repairReq.value.id }/archive`, {
        method: 'POST',
    });

    await syncRequestStateView();
}
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

    &-device {
        padding: 16px;
        border-radius: 8px;
        background: $darkgray800;

        &-create {
            margin-bottom: 16px;
        }

        &_popup {
            display: flex;
            flex-direction: row;
            gap: 16px;
            align-items: center;
            justify-content: space-between;

            &-container {
                overflow: scroll;
                display: flex;
                flex-direction: column;
                gap: 16px;

                height: 80vh;
            }
        }

        &-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
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

    &-device-status-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

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
