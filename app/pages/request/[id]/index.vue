<template>
    <common-page
        v-if="repairReq && repairReq.customer"
        :title="`Reparaturauftrag von ${ repairReq?.customer.displayName }`"
    >
        <ui-status :status="displayStatus"/>
        <repair-savings-tile :summary="savingsSummary"/>
        <div
            v-if="showTimeline"
            class="request-timeline"
        >
            <repair-timeline :history="repairReq.statusHistory"/>
        </div>
        <div
            v-if="isCompletedView"
            class="request-compact"
        >
            <div class="request-customer">
                <h2>Zuständiger Mitarbeiter</h2>
                <template v-if="repairReq.assignedStaff">
                    {{ repairReq.assignedStaff.displayName }}
                </template>
                <template v-else>
                    <h3>Noch niemand</h3>
                </template>
                <ui-button @click="openChat()">Chat</ui-button>
            </div>

            <div class="request-steps">
                <repair-step-graph
                    :editable="false"
                    :request="repairReq"
                />
            </div>
        </div>

        <div
            v-else
            class="request-container"
        >
            <div class="request-customer">
                <h2>Zuständiger Mitarbeiter</h2>
                <template v-if="repairReq.assignedStaff">
                    {{ repairReq.assignedStaff.displayName }}
                </template>
                <template v-else>
                    <h3>Noch niemand</h3>
                </template>
                <ui-button @click="openChat()">Chat</ui-button>
            </div>
            <div class="request-params">
                <h2>Kundenangaben</h2>
                <labeled-text :value="repairReq?.subject">
                    Betreff
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
                <h2>Gerät</h2>
                <div
                    v-if="repairDevice"
                    class="request-device-container"
                >
                    <ui-labeled-text :value="repairDevice?.displayName">Bezeichnung</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.serialNumber">Seriennummer</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.device?.name">Gerätetyp</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.device?.deviceBrand.name">Marke</ui-labeled-text>
                    <ui-labeled-text :value="(repairDevice?.device?.purchaseValue ?? '') as string">Neukaufwert</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.notes">Hinweise</ui-labeled-text>
                </div>
                <template v-else>
                    <h3>Noch nicht erstellt</h3>
                </template>
            </div>
            <div class="request-steps">
                <repair-step-graph
                    :editable="false"
                    :request="repairReq"
                />
            </div>
        </div>
    </common-page>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';

import LabeledText from '~/components/ui/LabeledText.vue';
import RepairSavingsTile from '~/components/repair/RepairSavingsTile.vue';
import RepairTimeline from '~/components/repair/RepairTimeline.vue';
import { calculateRepairSavings } from '~~/app/utils/repairSavings';
import type { AppConfigResponse } from '~~/types/config';
import type { RepairDeviceWithRelationsType, RepairRequestWithRelationsType } from '~~/types/req';
import { useSocketClient } from '~/composables/socketClient';

const route = useRoute();
const id = route.params.id as string;

const displayName = ref('');
const serialNumber = ref('');
const notes = ref('');
const repairDevice = ref<RepairDeviceWithRelationsType | null>(null);

const { data: repairReq, refresh: refreshRepairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/user/request/${ id }`);
const { data: config } = useFetch<AppConfigResponse>('/api/v1/user/config');
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

    if (repairReq.value.status === RepairRequestStatus.ACCEPTED && isFirstWorkItemCompleted.value) {
        return repairReq.value.statusHistory?.[0]?.status ?? repairReq.value.status;
    }

    return repairReq.value.status;
});
const isCompletedView = computed(() => repairReq.value?.status === RepairRequestStatus.COMPLETED);
const showTimeline = computed(() => (config.value?.showTimelineToCustomer ?? false) &&
    (repairReq.value?.statusHistory?.length ?? 0) > 0);
const hourlyRate = computed(() => Number(config.value?.hourlyRate ?? 0));
const savingsSummary = computed(() => {
    if (!repairReq.value) {
        return {
            laborCost: 0,
            newPurchaseValue: 0,
            partsCost: 0,
            repairValue: 0,
            savedValue: 0,
        };
    }

    return calculateRepairSavings(repairReq.value, hourlyRate.value);
});

async function loadRepairDevice() {
    if (!repairReq.value?.device?.id) {
        repairDevice.value = null;
        return;
    }

    repairDevice.value = await $fetch<RepairDeviceWithRelationsType>(`/api/v1/user/repair-device/${ repairReq.value.device.id }`);

    displayName.value = repairDevice.value.displayName;
    serialNumber.value = repairDevice.value.serialNumber ?? '';
    notes.value = repairDevice.value.notes ?? '';
}

watch(() => repairReq.value?.device?.id, async () => {
    await loadRepairDevice();
}, {
    immediate: true,
});

async function openChat() {
    if (!repairReq.value) {
        return;
    }

    await navigateTo(`/chat/room/${ repairReq.value.id }`);
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
    &-compact {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        width: 100%;
    }

    &-container {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
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

    &-timeline {
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
