<template>
    <common-page title="Forgot Password">
        <common-box>
            <ui-input-text v-model="email">E-Mail</ui-input-text>
            <ui-button @click="requestReset">Send reset link</ui-button>
        </common-box>
    </common-page>
</template>

<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';

interface PasswordResetRequestResponse {
    message?: string;
}

const { showToast } = useToastManager();
const email = ref<string>('');

async function requestReset() {
    try {
        const response = await $fetch<PasswordResetRequestResponse>('/api/v1/auth/reset/request', {
            method: 'POST',
            body: {
                email: email.value,
            },
        });

        showToast({
            mode: ToastMode.Success,
            message: response.message || 'If the account exists, a reset link was sent.',
        });
    }
    catch (error) {
        const err = error as { data?: { message?: string; statusMessage?: string }; statusMessage?: string };
        const message = err.data?.message || err.data?.statusMessage || err.statusMessage || 'Request failed';

        showToast({
            mode: ToastMode.Error,
            message,
        });
    }
}
</script>
