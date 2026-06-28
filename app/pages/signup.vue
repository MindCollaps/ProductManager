<template>
    <common-page title="Signup">
        <form
            class="signup-form"
            @submit.prevent="signup"
        >
            <common-box>
                <div class="signup-brand">
                    <svg
                        aria-hidden="true"
                        class="signup-brand__mark"
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
                    <span class="signup-brand__name">Manager</span>
                </div>
                <ui-input-text
                    v-model="username"
                    :input-attrs="{ autocomplete: 'username', autofocus: true }"
                >Username</ui-input-text>
                <ui-input-text
                    v-model="email"
                    :input-attrs="{ autocomplete: 'email' }"
                    input-type="email"
                >E-Mail</ui-input-text>
                <ui-input-text
                    v-model="password"
                    :input-attrs="{ autocomplete: 'new-password' }"
                    input-type="password"
                >Password</ui-input-text>
                <ui-input-text
                    v-model="passwordre"
                    :input-attrs="{ autocomplete: 'new-password' }"
                    input-type="password"
                >Repeat Password</ui-input-text>
                <ui-button
                    :disabled="loading"
                    tag="button"
                    type="submit"
                >Signup</ui-button>
                <ui-button
                    to="/login"
                    type="link"
                >Already have an account?</ui-button>
            </common-box>
        </form>
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
const loading = ref(false);

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
    if (loading.value) return;
    loading.value = true;
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
    finally {
        loading.value = false;
    }
}
</script>

<style scoped lang="scss">
.signup-form {
    width: min(360px, 100%);

    :deep(.common-box) {
        min-width: 0;
    }
}

.signup-brand {
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
