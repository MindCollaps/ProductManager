<template>
    <div
        :aria-label="toast.title"
        class="toast"
        :class="`toast--${ toast.mode.toLowerCase() }`"
        :role="toastRole"
    >
        <div class="toast-header">
            <div
                aria-hidden="true"
                :class="`toast-icon toast-icon--${ toast.mode.toLowerCase() }`"
            >
                <Icon
                    :name="toastIcon[toast.mode]"
                    size="20px"
                />
            </div>

            <div class="toast-title">{{ toast.title }}</div>

            <ui-button
                aria-label="Schließen"
                class="toast-close"
                icon-width="16px"
                size="S"
                tag="button"
                type="secondary"
                @click="emit('close')"
            >
                <template #icon>
                    <Icon
                        name="material-symbols:close"
                        size="16px"
                    />
                </template>
            </ui-button>
        </div>

        <div
            v-if="toast.message"
            class="toast-content"
        >
            {{ toast.message }}
        </div>

        <div
            aria-hidden="true"
            class="toast-progress"
            :class="`toast-progress--${ toast.mode.toLowerCase() }`"
            :style="{ animationDuration: `${ toast.duration }ms` }"
        />
    </div>
</template>


<script setup lang="ts">
import { ToastMode } from '~~/types/toast';
import type { Toast } from '~~/types/toast';

const props = defineProps<{
    toast: Toast;
}>();

const emit = defineEmits<{
    close: [];
}>();

const toastIcon = {
    [ToastMode.Info]: 'material-symbols:info',
    [ToastMode.Warning]: 'material-symbols:warning',
    [ToastMode.Error]: 'material-symbols:error',
    [ToastMode.Success]: 'material-symbols:check-circle',
};

const toastRole = computed(() => props.toast.mode === ToastMode.Error || props.toast.mode === ToastMode.Warning
    ? 'alert'
    : 'status');
</script>

<style scoped lang="scss">
    .toast {
        position: relative;

        overflow: hidden;
        display: flex;
        flex-direction: column;

        width: 100%;
        padding: 14px 16px 16px;
        border: 1px solid $darkgray800;
        border-radius: 8px;

        background: $darkgray875;

        &--success { border-color: rgb(102 187 88 / 35%); }
        &--error { border-color: rgb(187 88 102 / 35%); }
        &--warning { border-color: rgb(187 157 88 / 35%); }
        &--info { border-color: rgb(88 187 173 / 35%); }

        &-header {
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }

        &-icon {
            --icon-glow-color: #{$info500};

            flex-shrink: 0;
            padding-top: 1px;
            animation:
                toast-icon-pop 300ms cubic-bezier(0.16, 1, 0.3, 1) both,
                toast-icon-glow 500ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;

            &--success {
                --icon-glow-color: #{$success500};
                color: $success500;
            }

            &--error {
                --icon-glow-color: #{$error500};
                color: $error500;
            }

            &--warning {
                --icon-glow-color: #{$warning500};
                color: $warning500;
            }

            &--info {
                --icon-glow-color: #{$info500};
                color: $info500;
            }

            @media (prefers-reduced-motion: reduce) {
                animation: none;
            }
        }

        &-title {
            flex: 1;

            min-width: 0;

            font-size: 13px;
            font-weight: 600;
            line-height: 1.4;
            color: $lightgray150;
            overflow-wrap: anywhere;

            animation: toast-fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1) 60ms both;

            @media (prefers-reduced-motion: reduce) {
                animation: none;
            }
        }

        &-close {
            flex-shrink: 0;
            margin-top: -4px;
            margin-right: -4px;
            animation: toast-fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1) 60ms both;

            @media (prefers-reduced-motion: reduce) {
                animation: none;
            }
        }

        &-content {
            margin-top: 8px;
            padding-left: 28px;

            font-size: 13px;
            line-height: 1.5;
            color: $lightgray200;
            overflow-wrap: anywhere;

            animation: toast-fade-up 220ms cubic-bezier(0.16, 1, 0.3, 1) 130ms both;

            @media (prefers-reduced-motion: reduce) {
                animation: none;
            }
        }

        &-progress {
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            transform-origin: left center;

            height: 2px;

            animation: toast-shrink linear forwards;

            &--success { background: $success500; }
            &--error { background: $error500; }
            &--warning { background: $warning500; }
            &--info { background: $info500; }

            @media (prefers-reduced-motion: reduce) {
                display: none;
            }
        }
    }

    @keyframes toast-icon-pop {
        0% {
            transform: scale(0.5);
            opacity: 0;
        }

        60% {
            transform: scale(1.15);
            opacity: 1;
        }

        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    @keyframes toast-icon-glow {
        0% { filter: drop-shadow(0 0 0 var(--icon-glow-color)); }
        35% { filter: drop-shadow(0 0 6px var(--icon-glow-color)); }
        100% { filter: drop-shadow(0 0 0 var(--icon-glow-color)); }
    }

    @keyframes toast-fade-up {
        from {
            transform: translateY(4px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @keyframes toast-shrink {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
    }
</style>
