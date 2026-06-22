<template>
    <common-page title="Verify Email">
        <common-box>
            <p>{{ statusMessage }}</p>
            <ui-button
                v-if="done"
                @click="goToLogin"
            >Go to login</ui-button>
        </common-box>
    </common-page>
</template>

<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';

interface VerifyResponse {
    message?: string;
    redirect?: string;
}

const route = useRoute();
const router = useRouter();
const { showToast } = useToastManager();

const done = ref(false);
const statusMessage = ref('Verifying your email...');

function getTokenFromQuery() {
    const token = route.query.token;

    if (typeof token === 'string') {
        return token;
    }

    return '';
}

async function verifyEmail() {
    const token = getTokenFromQuery();

    if (!token) {
        statusMessage.value = 'Verification token is missing.';
        done.value = true;
        return;
    }

    try {
        const response = await $fetch<VerifyResponse>('/api/v1/auth/email/verify', {
            method: 'POST',
            body: {
                token,
            },
        });

        statusMessage.value = response.message || 'Email verified successfully.';
        done.value = true;

        if (response.redirect) {
            await router.push(response.redirect);
        }
    }
    catch (error) {
        const err = error as { data?: { message?: string; statusMessage?: string }; statusMessage?: string };
        const message = err.data?.message || err.data?.statusMessage || err.statusMessage || 'Email verification failed';

        statusMessage.value = message;
        done.value = true;
        showToast({
            mode: ToastMode.Error,
            message,
        });
    }
}

function goToLogin() {
    router.push('/login');
}

void verifyEmail();
</script>
