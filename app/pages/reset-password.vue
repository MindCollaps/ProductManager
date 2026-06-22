<template>
    <common-page title="Reset Password">
        <common-box>
            <ui-input-text
                v-model="password"
                input-type="password"
            >Password</ui-input-text>
            <ui-input-text
                v-model="passwordRepeated"
                input-type="password"
            >Repeat Password</ui-input-text>
            <ui-button @click="resetPassword">Reset password</ui-button>
        </common-box>
    </common-page>
</template>

<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';

interface PasswordResetConfirmResponse {
    message?: string;
}

const route = useRoute();
const router = useRouter();
const { showToast } = useToastManager();

const password = ref<string>('');
const passwordRepeated = ref<string>('');

function getTokenFromQuery() {
    const token = route.query.token;

    if (typeof token === 'string') {
        return token;
    }

    return '';
}

async function resetPassword() {
    const token = getTokenFromQuery();

    if (!token) {
        showToast({
            mode: ToastMode.Error,
            message: 'Reset token is missing.',
        });
        return;
    }

    try {
        const response = await $fetch<PasswordResetConfirmResponse>('/api/v1/auth/reset', {
            method: 'POST',
            body: {
                token,
                password: password.value,
                passwordRepeated: passwordRepeated.value,
            },
        });

        showToast({
            mode: ToastMode.Success,
            message: response.message || 'Password updated successfully.',
        });

        await router.push('/login');
    }
    catch (error) {
        const err = error as { data?: { message?: string; statusMessage?: string }; statusMessage?: string };
        const message = err.data?.message || err.data?.statusMessage || err.statusMessage || 'Reset failed';

        showToast({
            mode: ToastMode.Error,
            message,
        });
    }
}
</script>
