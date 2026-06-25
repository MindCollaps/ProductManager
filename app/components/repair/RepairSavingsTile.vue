<template>
    <common-box class="savings-tile">
        <h3>Reparaturwert</h3>
        <div class="savings-tile-hero">
            <div class="savings-tile-card savings-tile-card--repair">
                <span class="savings-tile-card-label">Reparaturwert</span>
                <strong class="savings-tile-card-value">{{ formatCurrency(summary.repairValue) }}</strong>
            </div>
            <div class="savings-tile-card savings-tile-card--purchase">
                <span class="savings-tile-card-label">Neukaufwert</span>
                <strong class="savings-tile-card-value">{{ formatCurrency(summary.newPurchaseValue) }}</strong>
            </div>
        </div>
        <div class="savings-tile-breakdown">
            <div class="savings-tile-breakdown-item">
                <span>Arbeitskosten</span>
                <span>{{ formatCurrency(summary.laborCost) }}</span>
            </div>
            <div class="savings-tile-breakdown-item">
                <span>Teilekosten</span>
                <span>{{ formatCurrency(summary.partsCost) }}</span>
            </div>
        </div>
    </common-box>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

import { formatCurrency } from '~~/app/utils/repairSavings';
import type { RepairSavingsSummary } from '~~/types/config';

defineProps({
    summary: {
        type: Object as PropType<RepairSavingsSummary>,
        required: true,
    },
});
</script>

<style scoped lang="scss">
.savings-tile {
    display: flex;
    flex-direction: column;
    gap: 16px;

    h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
    }

    &-hero {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    &-card {
        display: flex;
        flex-direction: column;
        gap: 6px;

        padding: 14px 16px;
        border-radius: 12px;

        &-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            opacity: 0.8;
        }

        &-value {
            font-size: 22px;
            font-weight: 700;
        }

        &--repair {
            color: $success500;
            background: rgb(102 187 88 / 15%);
            border: 1px solid rgb(102 187 88 / 30%);
        }

        &--purchase {
            color: $warning500;
            background: rgb(187 157 88 / 15%);
            border: 1px solid rgb(187 157 88 / 30%);
        }
    }

    &-breakdown {
        display: flex;
        flex-direction: column;
        gap: 6px;

        padding-top: 4px;
        border-top: 1px solid $lightgray125;
    }

    &-breakdown-item {
        display: flex;
        justify-content: space-between;

        font-size: 12px;
        color: $typographyPrimary;
        opacity: 0.7;
    }
}
</style>
