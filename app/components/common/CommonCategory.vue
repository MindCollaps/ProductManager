<template>
    <div
        class="category"
        :class="addable || deletable ? 'category-selectable' : ''"
        @click="$emit('selected', $event)"
    >
    {{ addable ? '+' : '' }} {{ deletable ? '-' : '' }}
    <div
class="category-color" :style="{
            '--category-color': category?.color ?? '$lightgray300',
        }"/>
     {{ category?.slug }}
    </div>
</template>

<script setup lang="ts">
import type { DeviceCategory } from '@prisma/client';

const props = defineProps({
    category: {
    type: Object as PropType<DeviceCategory>
    },
    addable: {
        type: Boolean,
        default: false,
    },
    deletable: {
        type: Boolean,
        default: false,
    }
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

    &-selectable {
        cursor: pointer;
    }

    &-color {
        width: 20px;
        height: 20px;
        border-radius: 100%;
        background: var(--category-color);
    }
}
</style>
