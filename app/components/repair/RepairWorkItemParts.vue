<template>
    <div class="work-item-parts">
        <div class="work-item-parts-header">
            <h4>Ersatzteile</h4>
            <ui-button
                v-if="editable"
                size="S"
                @click="emit('add')"
            >Teil hinzufügen</ui-button>
        </div>

        <div
            v-if="parts.length === 0"
            class="work-item-parts-empty"
        >Keine Teile zugewiesen</div>

        <div
            v-for="part in parts"
            :key="part.id"
            class="work-item-parts-item"
        >
            <div class="work-item-parts-copy">
                <strong>{{ part.orderedName ?? 'Unbekanntes Teil' }}</strong>
                <span>{{ part.quantity }}×</span>
                <span>{{ statusLabel(part.status) }}</span>
            </div>
            <div
                v-if="editable"
                class="work-item-parts-actions"
            >
                <ui-button
                    v-for="status in nextStatuses(part.status)"
                    :key="status"
                    size="S"
                    @click="emit('transition', part.id, status)"
                >{{ transitionLabel(status) }}</ui-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PartOrderStatus } from '@prisma/client';
import type { PropType } from 'vue';

import { partOrderTransitions } from '~~/app/utils/partOrders';
import type { PartOrderWithRelationsType } from '~~/types/req';

defineProps({
    parts: {
        type: Array as PropType<PartOrderWithRelationsType[]>,
        default: () => [],
    },
    editable: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    add() {
        return true;
    },
    transition(partId: string, status: PartOrderStatus) {
        return Boolean(partId) && Boolean(status);
    },
});

const STATUS_LABELS: Record<PartOrderStatus, string> = {
    DRAFT: 'Entwurf',
    ORDERED: 'Bestellt',
    SHIPPED: 'Versendet',
    RECEIVED: 'Eingegangen',
    ALREADY_IN_STOCK: 'Auf Lager',
    INSTALLED: 'Eingebaut',
    CANCELLED: 'Storniert',
};

const TRANSITION_LABELS: Record<PartOrderStatus, string> = {
    DRAFT: 'Entwurf',
    ORDERED: 'Bestellen',
    SHIPPED: 'Versendet',
    RECEIVED: 'Eingegangen',
    ALREADY_IN_STOCK: 'Lagerware',
    INSTALLED: 'Einbauen',
    CANCELLED: 'Stornieren',
};

function statusLabel(status: PartOrderStatus): string {
    return STATUS_LABELS[status] ?? status;
}

function transitionLabel(status: PartOrderStatus): string {
    return TRANSITION_LABELS[status] ?? status;
}

function nextStatuses(status: PartOrderStatus): PartOrderStatus[] {
    return partOrderTransitions[status] ?? [];
}
</script>

<style scoped lang="scss">
.work-item-parts {
    display: flex;
    flex-direction: column;
    gap: 10px;

    padding-top: 8px;
    border-top: 1px solid $lightgray125;

    &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;

        h4 {
            margin: 0;
            font-size: 13px;
            font-weight: 600;
        }
    }

    &-empty {
        font-size: 11px;
        color: $lightgray400;
    }

    &-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        padding: 10px;
        border: 1px solid $lightgray125;
        border-radius: 8px;

        background: $darkgray850;
    }

    &-copy {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        span {
            font-size: 11px;
            color: $lightgray400;
        }
    }

    &-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
}
</style>
