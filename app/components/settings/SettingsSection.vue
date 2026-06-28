<template>
    <div class="settings-section">
        <div class="settings-section-header">
            <h2 class="settings-section-title">{{ title }}</h2>
            <p
                v-if="description"
                class="settings-section-description"
            >
                {{ description }}
            </p>
        </div>
        <div class="settings-section-body">
            <slot/>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    description?: string;
}>();

defineSlots<{ default(): unknown }>();
</script>

<style scoped lang="scss">
.settings-section {
    overflow: hidden;
    border-radius: 8px;
    background: $darkgray875;

    &-header {
        padding: 16px 20px;
        border-bottom: 1px solid $darkgray700;
    }

    &-title {
        margin: 0 0 4px;
        font-size: 14px;
        font-weight: 600;
        color: $lightgray100;
    }

    &-description {
        margin: 0;
        font-size: 12px;
        color: $lightgray400;
    }

    &-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px;
    }
}
</style>
