<template>
    <div class="common-page">
        <div
            v-if="$slots['actions']"
            class="common-page-header"
        >
            <h1>{{ title }}</h1>
            <slot name="actions"/>
        </div>
        <h1 v-else>{{ title }}</h1>
        <slot/>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
}>();

defineSlots<{
    default: () => any;
    actions?: () => any;
}>();
</script>

<style scoped lang="scss">
.common-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    align-items: center;

    padding: 32px;

    h1 {
        margin: 0;
        font-size: 38px;
        font-weight: bold;
        text-wrap: balance;

        @include mobile {
            font-size: 32px;
        }
    }

    p {
        font-size: 14px;

        @include mobile {
            font-size: 12px;
        }
    }

    &-header {
        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;

        width: 100%;
    }
}
</style>
