<template>
    <div
        class="category noselect"
        @click="$emit('selected', $event)"
    >
        <div
            class="category-color"
            :style="{
                '--category-color': category?.color ?? '#bfbfc2',
            }"
        />
        {{ category?.slug }}
    </div>
</template>

<script setup lang="ts">
import type { DeviceCategory } from '@prisma/client';

defineProps({
    category: {
        type: Object as PropType<DeviceCategory>,
    },
});

defineEmits({
    selected(e: MouseEvent) {
        return true;
    },
});
</script>

<style scoped lang="scss">
.category {
    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;
    justify-content: center;


    &-color {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 20px;
        height: 20px;
        border-radius: 100%;

        background: var(--category-color);
    }
}
</style>
