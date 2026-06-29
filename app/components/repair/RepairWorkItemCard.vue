<template>
    <div
        class="work-item-card"
        :style="cardStyle"
    >
        <div class="work-item-card-header">
            <div class="work-item-card-copy">
                <div class="work-item-card-order">{{ item.orderIndex }}</div>
                <div class="work-item-card-title">
                    <Icon
                        v-if="item.workItemType.icon"
                        class="work-item-card-type-icon"
                        :name="item.workItemType.icon"
                    />{{ item.title }}
                </div>
            </div>
            <repair-work-item-status-badge :status="item.status"/>
        </div>

        <div
            v-if="item.description"
            class="work-item-card-description"
        >
            {{ item.description }}
        </div>

        <div class="work-item-card-meta">
            <span>Bearbeiter: {{ assignedStaffLabel }}</span>
            <span v-if="item.laborMinutes !== null">{{ item.laborMinutes }} min</span>
            <span v-if="item.completedAt">Abgeschlossen</span>
            <span v-if="item.workItemType.isDefault">Standard</span>
        </div>

        <repair-work-item-parts
            :editable="editable"
            :parts="itemParts"
            @add="emit('addPart')"
            @transition="(partId, status) => emit('changePartStatus', partId, status)"
        />

        <div
            v-if="editable"
            class="work-item-card-actions"
        >
            <ui-button @click="emit('edit')">Bearbeiten</ui-button>
            <ui-button
                v-if="currentUserId && item.assignedStaff?.id !== currentUserId"
                @click="emit('assignSelf')"
            >
                Mir zuweisen
            </ui-button>
            <ui-button
                @click="emit('toggleInProgress')"
            >
                {{ item.status === 'IN_PROGRESS' ? 'Ausstehend' : 'In Bearbeitung' }}
            </ui-button>
            <ui-button
                @click="emit('toggleDone')"
            >
                {{ item.status === 'DONE' ? 'Wiedereröffnen' : 'Erledigt' }}
            </ui-button>
            <ui-button
                primary-color="error600"
                @click="emit('delete')"
            >
                Löschen
            </ui-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PartOrderStatus } from '@prisma/client';
import type { PropType } from 'vue';
import type { PartOrderWithRelationsType, RepairWorkItemWithRelationsType } from '~~/types/req';

import RepairWorkItemParts from './RepairWorkItemParts.vue';

const props = defineProps({
    item: {
        type: Object as PropType<RepairWorkItemWithRelationsType>,
        required: true,
    },
    editable: {
        type: Boolean,
        default: false,
    },
    partOrders: {
        type: Array as PropType<PartOrderWithRelationsType[]>,
        default: () => [],
    },
    currentUserId: {
        type: String as PropType<string | null>,
        default: null,
    },
});

const emit = defineEmits({
    delete() {
        return true;
    },
    edit() {
        return true;
    },
    toggleInProgress() {
        return true;
    },
    toggleDone() {
        return true;
    },
    addPart() {
        return true;
    },
    changePartStatus(partId: string, status: PartOrderStatus) {
        return Boolean(partId) && Boolean(status);
    },
    assignSelf() {
        return true;
    },
});

const cardStyle = computed(() => ({
    '--accent-color': props.item.workItemType.color ?? 'rgb(148 163 184 / 0.9)',
}));

const assignedStaffLabel = computed(() => props.item.assignedStaff?.displayName ?? props.item.assignedStaff?.username ?? 'Nicht zugewiesen');
const itemParts = computed(() => props.partOrders.filter(partOrder => partOrder.workItemId === props.item.id));
</script>

<style scoped lang="scss">
.work-item-card {
    display: flex;
    flex-direction: column;
    gap: 12px;

    padding: 16px;
    border: 1px solid $lightgray125;
    border-radius: 8px;

    background: $darkgray875;

    animation: card-enter 280ms cubic-bezier(0.25, 1, 0.5, 1) both;
    animation-delay: calc(min(var(--card-i, 0), 7) * 35ms);

    &-header {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        justify-content: space-between;
    }

    &-copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    &-order {
        width: fit-content;
        padding: 4px 8px;
        border: 1px solid $lightgray125;
        border-radius: 999px;

        font-size: 11px;
        font-weight: 600;
        color: $lightgray400;

        background: rgb(255 255 255 / 4%);
    }

    &-title {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: flex-start;

        font-size: 16px;
        font-weight: 700;
    }

    &-type-icon {
        flex-shrink: 0;
        color: var(--accent-color);
    }

    &-description {
        line-height: 1.4;
        color: $typographyPrimary;
    }

    &-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        font-size: 11px;
        color: $lightgray400;
    }

    &-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
}

@keyframes card-enter {
    from {
        transform: translateY(8px);
        opacity: 0;
    }

    to {
        transform: none;
        opacity: 1;
    }
}

@media (prefers-reduced-motion: reduce) {
    .work-item-card {
        animation: none;
    }
}
</style>
