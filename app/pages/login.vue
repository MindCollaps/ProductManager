<template>
    <common-page title="Login">
        <div
            v-if="demoMode"
            class="login-demo-hint"
        >
            Demo aktiv – melde dich mit <strong>demo</strong> / <strong>demo</strong> an, um aktive Aufträge zu sehen.
        </div>
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
            <ui-button
                to="/forgot-password"
                type="link"
            >Forgot password?</ui-button>
            <ui-button @click="login">Login</ui-button>
        </common-box>
    </common-page>
</template>

<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import { useToastManager } from '~/composables/toastManager';
import { useStore } from '~/store';
import type { AppConfigResponse } from '~~/types/config';

const { showToast } = useToastManager();
const store = useStore();

const router = useRouter();
const username = ref<string>();
const password = ref<string>();

const { data: publicConfig } = await useFetch<AppConfigResponse>('/api/v1/user/config');
const demoMode = computed(() => publicConfig.value?.demoMode ?? false);

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

<style scoped lang="scss">
.login-demo-hint {
    width: min(360px, 100%);
    margin-right: auto;
    margin-bottom: 16px;
    margin-left: auto;
    padding: 10px 14px;
    border-radius: 8px;

    font-size: 13px;
    line-height: 1.5;
    color: $warning700Orig;

    background: rgba($warning500Orig, 0.15);
}
</style>
