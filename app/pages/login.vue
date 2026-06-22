<template>
    <common-page title="Login">
        <common-box>
            <ui-input-text
                v-model="username"
                @keyup.enter="login"
            >Username</ui-input-text>
            <ui-input-text
                v-model="password"
                input-type="password"
                @keyup.enter="login"
            >Password</ui-input-text>
            <ui-button type="link" to="/forgot-password">Forgot password?</ui-button>
            <ui-button @click="login">Login</ui-button>
        </common-box>
    </common-page>
</template>

<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';
import { useStore } from '~/store';

const { showToast } = useToastManager();
const store = useStore();

const router = useRouter();
const username = ref<string>();
const password = ref<string>();

interface LoginResponse {
    redirect?: string;
    message?: string;
}

interface FetchErrorLike {
    data?: {
        message?: string;
        statusMessage?: string;
    };
    statusMessage?: string;
}

async function login() {
    try {
        const response = await $fetch<LoginResponse>('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: username.value,
                password: password.value,
            }),
        });
        void store.fetchMe();
        if (response.redirect) {
            router.push(response.redirect);
        }
    }
    catch (error) {
        const err = error as FetchErrorLike;

        showToast({
            mode: ToastMode.Error,
            message: err.data?.message || err.data?.statusMessage || err.statusMessage || 'Login failed',
        });
    }
}
</script>
