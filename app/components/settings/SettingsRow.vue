<template>
    <div
        class="settings-row"
        :class="{ 'settings-row--stacked': stacked }"
    >
        <div class="settings-row-info">
            <span class="settings-row-label">{{ label }}</span>
            <span
                v-if="hint"
                class="settings-row-hint"
            >
                {{ hint }}
            </span>
        </div>
        <div class="settings-row-control">
            <slot/>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    label: string;
    hint?: string;
    stacked?: boolean;
}>();

defineSlots<{ default(): unknown }>();
</script>

<style scoped lang="scss">
.settings-row {
    display: flex;
    gap: 24px;
    align-items: center;
    justify-content: space-between;

    &--stacked {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;

        .settings-row-control {
            width: 100%;
        }
    }

    &-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;

        min-width: 0;
    }

    &-label {
        font-size: 13px;
        font-weight: 500;
        color: $lightgray200;
    }

    &-hint {
        font-size: 12px;
        line-height: 1.4;
        color: $lightgray400;
    }

    &-control {
        flex-shrink: 0;
    }
}
</style>
