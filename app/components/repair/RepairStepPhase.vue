<template>
    <section
        class="step-phase"
        :class="{ 'step-phase--empty': phase.items.length === 0 }"
    >
        <header class="step-phase-header">
            <div class="step-phase-copy">
                <div class="step-phase-range">Phase {{ phase.label }}</div>
                <h3>{{ phase.title }}</h3>
                <p>{{ phase.description }}</p>
            </div>

            <div class="step-phase-summary">
                <div class="step-phase-count">{{ phase.items.length }} step{{ phase.items.length === 1 ? '' : 's' }}</div>
                <ui-button
                    v-if="editable"
                    @click="emit('add', phase.startOrder, phase.endOrder)"
                >
                    Add step
                </ui-button>
            </div>
        </header>

        <div class="step-phase-body">
            <div class="step-phase-rail"/>
            <div class="step-phase-groups">
                <div
                    v-for="(orderGroup, groupIndex) in phase.orderGroups"
                    :key="orderGroup.orderIndex"
                    class="step-phase-order-group"
                    :class="{ 'step-phase-order-group--parallel': orderGroup.items.length > 1 }"
                >
                    <div
                        class="step-phase-order-items"
                        :class="{ 'step-phase-order-items--parallel': orderGroup.items.length > 1 }"
                    >
                        <template
                            v-for="item in orderGroup.items"
                            :key="item.id"
                        >
                            <slot
                                :index="groupIndex"
                                :item="item"
                            />
                        </template>
                    </div>
                </div>

                <div
                    v-if="phase.items.length === 0"
                    class="step-phase-empty"
                >
                    <h4>No steps in this phase yet</h4>
                    <p>This phase is part of the repair flow, but no work items have been created here yet.</p>
                    <ui-button
                        v-if="editable"
                        @click="emit('add', phase.startOrder, phase.endOrder)"
                    >
                        Add the first step
                    </ui-button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts" generic="T extends RepairWorkItemGraphItem">
import type { PropType } from 'vue';
import type { RepairWorkItemGraphItem, RepairWorkItemPhase } from '~~/app/utils/repairWorkItems';

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
    add(phaseStart: number, phaseEnd: number) {
        return true;
    },
});

defineSlots<{
    default(props: { index: number; item: T }): void;
}>();
</script>

<style scoped lang="scss">
.step-phase {
    position: relative;

    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 18px;

    padding: 20px;
    border: 1px solid $lightgray125;
    border-radius: 16px;

    background: linear-gradient(180deg, rgb(255 255 255 / 5%), rgb(255 255 255 / 1%));


    &-header {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        justify-content: space-between;
    }

    &-copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    &-range {
        font-size: 14px;
        font-weight: 700;
        color: $typographyPrimary;
    }

    h3 {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
        color: $typographyPrimary;
    }

    p {
        margin: 0;
        font-size: 13px;
        line-height: 1.45;
        color: $typographyPrimary;
    }

    &-summary {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: flex-end;
    }

    &-count {
        font-size: 12px;
        color: $typographyPrimary;
        text-align: right;
    }

    &-body {
        position: relative;

        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;

        padding-left: 24px;
    }

    &-groups {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    &-order-group {
        display: contents;
    }


    &-order-number {
        display: inline-flex;
        align-items: center;
        justify-content: center;

        min-width: 48px;
        padding: 6px 10px;
        border: 1px solid $lightgray150;
        border-radius: 999px;

        font-size: 13px;
        font-weight: 700;
        color: $typographyPrimary;

        background: rgb(255 255 255 / 8%);
    }

    &-order-label {
        font-size: 11px;
        color: $typographyPrimary;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    &-order-items {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 12px;

        &--parallel {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }
    }

    &-empty {
        display: flex;
        flex-direction: column;
        gap: 10px;

        padding: 18px;
        border: 1px dashed $lightgray125;
        border-radius: 8px;

        background: rgb(255 255 255 / 2%);

        h4 {
            margin: 0;
            font-size: 15px;
            color: $typographyPrimary;
        }

        p {
            color: $typographyPrimary;
        }
    }
}
</style>
