<template>
    <common-page
        v-if="repairReq && repairReq.customer"
        :title="`Reperaturauftrag von ${ repairReq?.customer.displayName }`"
    >
        <ui-status :status="repairReq?.status"/>
        <div class="request-container">
            <div class="request-customer">
                <h2>Customer details</h2>
                {{ repairReq?.customer.displayName }} ({{ repairReq?.customer.username }}) /
                {{ repairReq?.customer.email }}
                <ui-button>Chat (WIP)</ui-button>
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
                    <ui-button @click="saveRepaiDevice()">Save</ui-button>
                    <h3>Device</h3>
                    <ui-labeled-text :value="repairDevice?.device?.name">Name</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.device?.deviceBrand.name">Brand</ui-labeled-text>
                    <ui-labeled-text :value="(repairDevice?.device?.purchaseValue ?? '') as string">Neukaufwert</ui-labeled-text>
                </div>
            </div>
            <div class="request-steps">
                <repair-step-graph
                    :editable="true"
                    :request="repairReq"
                />
            </div>
        </div>
    </common-page>
</template>

<script lang="ts" setup>
import type { Device } from '@prisma/client';
import LabeledText from '~/components/ui/LabeledText.vue';
import type { RepairDeviceWithRelationsType, RepairRequestWithRelationsType } from '~~/types/req';

const route = useRoute();
const id = route.params.id as string;
const isVisible = ref(false);

const displayName = ref('');
const serialNumber = ref('');
const notes = ref('');
const selectedDevice: Ref<Device | null> = ref(null);
const repairDevice = ref<RepairDeviceWithRelationsType | null>(null);

const { data: repairReq, refresh: refreshRepairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/staff/request/${ id }`);
const { data: devices } = useFetch<Device[]>('/api/v1/staff/device');

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
        await refreshRepairReq();
        await loadRepairDevice();
    }
}

async function saveRepaiDevice() {
    await $fetch(`/api/v1/staff/repair-device/${ repairDevice.value?.id }`, {
        method: 'PUT',
        body: {
            displayName: displayName.value,
            serialNumber: serialNumber.value,
            notes: notes.value,
        },
    });
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

    &-customer {
        display: flex;
        flex-direction: column;
        gap: 16px;

        padding: 16px;
        border-radius: 8px;

        background: $darkgray800;
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
