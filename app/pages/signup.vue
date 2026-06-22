<template>
    <common-page title="Signup">
        <common-box>
            <ui-input-text
                v-model="username"
                @keyup.enter="signup"
            >Username</ui-input-text>
            <ui-input-text
                v-model="email"
                @keyup.enter="signup"
            >E-Mail</ui-input-text>
            <ui-input-text
                v-model="password"
                input-type="password"
                @keyup.enter="signup"
            >Password</ui-input-text>
            <ui-input-text
                v-model="passwordre"
                input-type="password"
                @keyup.enter="signup"
            >Repeat Password</ui-input-text>
            <ui-button @click="signup">Signup</ui-button>
        </common-box>
    </common-page>
</template>

<script setup lang="ts">
import { useToastManager } from '~/composables/toastManager';
import { useStore } from '~/store';
import { ToastMode } from '~~/types/toast';

const router = useRouter();
const { showToast } = useToastManager();
const store = useStore();

const username = ref<string>();
const password = ref<string>();
const passwordre = ref<string>();
const email = ref<string>();

interface SignupResponse {
    redirect?: string;
    message?: string;
    requiresEmailVerification?: boolean;
}

interface ValidationIssue {
    message: string;
}

interface FetchErrorLike {
    data?: {
        message?: string;
        statusMessage?: string;
        data?: ValidationIssue[];
    };
    statusMessage?: string;
}

async function signup() {
    try {
        const response = await $fetch<SignupResponse>('/api/v1/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                username: username.value,
                password: password.value,
                passwordRepeated: passwordre.value,
                email: email.value,
            }),
        });

        if (response.requiresEmailVerification) {
            showToast({
                mode: ToastMode.Success,
                message: response.message || 'Account created. Please verify your email first.',
                duration: 9000,
            });
            await router.push('/login');
            return;
        }

        void store.fetchMe();
        if (response.redirect) {
            router.push(response.redirect);
        }
    }
    catch (error) {
        const err = error as FetchErrorLike;
        let message = err.data?.message || err.data?.statusMessage || err.statusMessage || 'Signup failed';

        if (Array.isArray(err.data?.data)) {
            message = err.data.data.map(item => item.message).join('\n');
        }

        showToast({
            mode: ToastMode.Error,
            message,
            duration: 8000,
        });
    }
}
</script>
