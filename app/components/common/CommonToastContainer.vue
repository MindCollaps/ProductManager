<template>
    <div class="toast-container">
        <transition-group
            class="toast-stack"
            name="toast-list"
            tag="div"
        >
            <common-toast
                v-for="toast in toasts"
                :key="toast.id"
                :toast="toast"
                @close="store.removeToast(toast.id)"
            />
        </transition-group>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useStore } from '~/store';

const store = useStore();
const { toasts } = storeToRefs(store);
</script>

<style scoped lang="scss">
.toast-container {
    position: fixed;
    z-index: 9999;
    right: 32px;
    bottom: 32px;

    width: 400px;
    max-width: calc(100vw - 64px);
}

.toast-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.toast-list-enter-active {
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.toast-list-leave-active {
    position: absolute;
    right: 0;
    width: 100%;
    transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}

.toast-list-move {
    transition: transform 0.3s ease;
}

.toast-list-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.toast-list-leave-to {
    transform: translateX(100%);
    opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
    .toast-list-enter-active,
    .toast-list-leave-active,
    .toast-list-move {
        transition-duration: 0.01ms !important;
    }
}
</style>
