<template>
    <transition>
        <div
            v-if="isVisible"
            aria-modal="true"
            class="popup"
            role="dialog"
            @click.self="emit('close')"
            @keydown.esc="emit('close')"
        >
            <div
                ref="contentRef"
                class="popup-content"
            >
                <slot/>
                <div class="popup-control">
                    <ui-button
                        :primary-color="submitColor"
                        type="primary"
                        @click="emit('submit')"
                    >
                        <template
                            v-if="submitIcon"
                            #icon
                        >
                            <Icon
                                :name="submitIcon"
                                size="16px"
                            />
                        </template>
                        <template #default>
                            {{ submitText }}
                        </template>
                    </ui-button>
                    <ui-button
                        :primary-color="closeColor"
                        type="primary"
                        @click="emit('close')"
                    >
                        <template
                            v-if="closeIcon"
                            #icon
                        >
                            <Icon
                                :name="closeIcon"
                                size="16px"
                            />
                        </template>
                        <template v-if="closeText">
                            {{ closeText }}
                        </template>
                    </ui-button>
                </div>
            </div>
        </div>
    </transition>
</template>


<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
    type: {
        type: String as PropType<'default' | 'black' | 'transparent'>,
        default: 'default',
    },
    isVisible: {
        type: Boolean,
    },
    submitText: {
        type: String,
        default: 'Bestätigen',
    },
    closeText: {
        type: String,
        default: 'Schließen',
    },
    submitColor: {
        type: String as PropType<ColorsList>,
        default: 'success500',
    },
    closeColor: {
        type: String as PropType<ColorsList>,
        default: 'error600',
    },
    submitIcon: {
        type: String,
    },
    closeIcon: {
        type: String,
    },
});

const emit = defineEmits({
    close() {
        return true;
    },
    submit() {
        return true;
    },
});

defineSlots<{
    default(): any;
}>();

const contentRef = ref<HTMLElement | null>(null);

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

watch(() => props.isVisible, async visible => {
    if (visible) {
        document.body.style.overflow = 'hidden';
        await nextTick();
        const first = contentRef.value?.querySelector<HTMLElement>(FOCUSABLE);
        first?.focus();
    }
    else {
        document.body.style.overflow = '';
    }
});

function trapFocus(e: KeyboardEvent) {
    if (!props.isVisible || !contentRef.value) return;
    const focusable = [...contentRef.value.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.key === 'Tab') {
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        }
        else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }
}

onMounted(() => document.addEventListener('keydown', trapFocus));
onUnmounted(() => {
    document.removeEventListener('keydown', trapFocus);
    document.body.style.overflow = '';
});
</script>

<style scoped lang="scss">
.v-enter-active {
    transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);

    .popup-content {
        animation: popup-appear 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
}

.v-leave-active {
    transition: opacity 0.2s cubic-bezier(0.25, 1, 0.5, 1);

    .popup-content {
        animation: popup-appear 0.15s cubic-bezier(0.25, 1, 0.5, 1) both reverse;
    }
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}

@keyframes popup-appear {
    from {
        transform: scale(0.94) translateY(10px);
        opacity: 0;
    }

    to {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .v-enter-active,
    .v-leave-active {
        transition-duration: 0.01ms !important;

        .popup-content { animation: none; }
    }
}

.popup {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100vw;
    height: 100dvh;
    padding: 16px;

    background: rgb(212 238 247 / 10%);

    &-content {
        overflow-y: auto;

        max-height: calc(100dvh - 32px);
        padding: 32px;
        border-radius: 8px;

        background: $darkgray950;
    }

    &-control {
        display: flex;
        flex-flow: row;
        gap: 16px;
        align-items: center;
        justify-content: right;

        margin-top: 32px;
    }
}
</style>
