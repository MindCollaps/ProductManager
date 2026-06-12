<template>
    <common-page title="Neuer Reperaturauftrag">
        <common-box>
            <ui-input-text v-model="deviceName">Geraetename</ui-input-text>
            <ui-input-text v-model="deviceBrand">Geraete Marke</ui-input-text>
            <ui-input-text v-model="deviceModel">Geraete Modell</ui-input-text>
            <ui-text-area v-model="problemDesciption">Problembeschreibung</ui-text-area>
            <ui-text-area v-model="alreadyTried">Was hast du bisher versucht?</ui-text-area>
            <ui-text-area v-model="suspectedIssue">Was glaubst du ist die Ursache?</ui-text-area>
            <ui-text-area v-model="customerNotes">Sonstiges?</ui-text-area>
            <ui-button @click="send()">Anfragen</ui-button>
        </common-box>
    </common-page>
</template>

<script lang="ts" setup>
import { ToastMode } from '~~/types/toast';

const deviceName = ref('');
const deviceModel = ref('');
const deviceBrand = ref('');
const problemDesciption = ref('');
const alreadyTried = ref('');
const suspectedIssue = ref('');
const customerNotes = ref('');

const router = useRouter();

const { showToast } = useToastManager();

async function send() {
    try {
        const request = {
            deviceName: deviceName.value,
            deviceModel: deviceModel.value.length === 0 ? undefined : deviceModel.value,
            deviceBrand: deviceBrand.value.length === 0 ? undefined : deviceBrand.value,
            problemDescription: problemDesciption.value,
            alreadyTried: alreadyTried.value.length === 0 ? undefined : alreadyTried.value,
            suspectedIssue: suspectedIssue.value.length === 0 ? undefined : suspectedIssue.value,
            customerNotes: customerNotes.value.length === 0 ? undefined : customerNotes.value,
        };

        await $fetch('/api/v1/user/request', {
            method: 'POST',
            body: request,
        });

        router.push('/request');
    }
    catch (error: any) {
        showToast({
            mode: ToastMode.Error,
            message: error.data?.message || error.data?.statusMessage || error.statusMessage || 'Request creation failed',
        });
    }
}
</script>
