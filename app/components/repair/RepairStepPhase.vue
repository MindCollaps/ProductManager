<template>
    <section class="step-phase">
        <header class="step-phase-header">
            <div>
                <div class="step-phase-range">Order {{ phase.label }}</div>
                <div class="step-phase-count">{{ phase.items.length }} step{{ phase.items.length === 1 ? '' : 's' }}</div>
            </div>
            <ui-button v-if="editable" @click="emit('add', phase.startOrder)">Add step</ui-button>
        </header>

        <div class="step-phase-items">
            <slot
                v-for="item in phase.items"
                :key="item.id"
                :item="item"
            />
        </div>
    </section>
</template>

<script setup lang="ts" generic="T extends { id: string }">
import type { PropType } from 'vue';
import type { RepairWorkItemPhase } from '~~/app/utils/repairWorkItems';

defineProps({
    phase: {
        type: Object as PropType<RepairWorkItemPhase<T>>,
        required: true,
    },
    editable: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    add(phaseStart: number) {
        return true;
    },
});
</script>

<style scoped lang="scss">
.step-phase {
    display: flex;
    flex-direction: column;
    gap: 16px;

    padding: 18px;
    border: 1px solid $lightgray125;
    border-radius: 20px;

    background: linear-gradient(180deg, rgb(255 255 255 / 4%), rgb(255 255 255 / 1%));

    &-header {
        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;
    }

    &-range {
        font-size: 14px;
        font-weight: 700;
        color: $darkgray950;
    }

    &-count {
        font-size: 12px;
        color: $darkgray700;
    }

    &-items {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
}
</style>