<template>
    <common-page
        v-if="repairReq && repairReq.customer"
        :title="`Reperaturauftrag von ${ repairReq?.customer.displayName }`"
    >
        <ui-status :status="repairReq?.status"/>
        <div class="request-container">
            <div class="request-customer">
                <h2>Assigned Staff</h2>
                <template v-if="repairReq.assignedStaff">
                    {{ repairReq.assignedStaff.displayName }}
                </template>
                <template v-else>
                    <h3>Noch niemand</h3>
                </template>
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
                    v-if="repairDevice"
                    class="request-device-container"
                >
                    <ui-labeled-text :value="repairDevice?.displayName">Display Name</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.serialNumber">Serial Number</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.device?.name">Name</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.device?.deviceBrand.name">Brand</ui-labeled-text>
                    <ui-labeled-text :value="(repairDevice?.device?.purchaseValue ?? '') as string">Neukaufwert</ui-labeled-text>
                    <ui-labeled-text :value="repairDevice?.notes">Notes</ui-labeled-text>
                </div>
                <template v-else>
                    <h3>Noch nicht erstellt</h3>
                </template>
            </div>
            <div class="request-steps">
                <h2>Request steps</h2>
            </div>
        </div>
    </common-page>
</template>

<script lang="ts" setup>
import LabeledText from '~/components/ui/LabeledText.vue';
import type { RepairDeviceWithRelationsType, RepairRequestWithRelationsType } from '~~/types/req';

const route = useRoute();
const id = route.params.id as string;

const displayName = ref('');
const serialNumber = ref('');
const notes = ref('');

const { data: repairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/user/request/${ id }`);
const { data: repairDevice } = useFetch<RepairDeviceWithRelationsType>(`/api/v1/user/repair-device/${ repairReq.value?.device?.id }`);

watch([repairDevice], () => {
    if (repairDevice.value) {
        displayName.value = repairDevice.value.displayName;
        serialNumber.value = repairDevice.value.serialNumber ?? '';
        notes.value = repairDevice.value.notes ?? '';
    }
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
