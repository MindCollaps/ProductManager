<template>
    <common-page title="Login">
        <div
            v-if="demoMode"
            class="login-demo-hint"
        >
            Demo aktiv – melde dich mit <strong>demo</strong> / <strong>demo</strong> an, um aktive Aufträge zu sehen.
        </div>
        <form
            class="login-form"
            @submit.prevent="login"
        >
            <common-box>
                <div class="login-brand">
                    <svg
                        aria-hidden="true"
                        class="login-brand__mark"
                        height="26"
                        viewBox="0 0 24 24"
                        width="26"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M2.5 18.5 L2.5 5.5 L12 13.5 L21.5 5.5 L21.5 18.5"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2.1"
                        />
                        <circle
                            cx="12"
                            cy="13.5"
                            fill="currentColor"
                            r="2.2"
                        />
                    </svg>
                    <span class="login-brand__name">Manager</span>
                </div>
                <ui-input-text
                    v-model="username"
                    :input-attrs="{ autocomplete: 'username', autofocus: true }"
                >Username</ui-input-text>
                <ui-input-text
                    v-model="password"
                    :input-attrs="{ autocomplete: 'current-password' }"
                    input-type="password"
                >Password</ui-input-text>
                <ui-button
                    :disabled="loading"
                    tag="button"
                    type="submit"
                >Login</ui-button>
                <ui-button
                    to="/forgot-password"
                    type="link"
                >Forgot password?</ui-button>
            </common-box>
        </form>
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
const loading = ref(false);

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
    if (loading.value) return;
    loading.value = true;
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
    finally {
        loading.value = false;
    }
}
</script>

<style scoped lang="scss">
.login-demo-hint {
    width: min(360px, 100%);
    padding: 10px 14px;
    border-radius: 8px;

    font-size: 13px;
    line-height: 1.5;
    color: $warning700;

    background: rgba($warning500Orig, 0.15);
}

.login-form {
    width: min(360px, 100%);

    :deep(.common-box) {
        min-width: 0;
    }
}

.login-brand {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;

    padding-bottom: 16px;
    border-bottom: 1px solid $darkgray600;

    color: $primary500;

    &__name {
        font-size: 18px;
        font-weight: 700;
        color: $lightgray150;
        letter-spacing: -0.02em;
    }
}
</style>
