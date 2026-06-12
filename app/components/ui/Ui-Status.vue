<template>
    <div
        v-if="status"
        class="status"
        :style="{
            '--status-color': colorMap.get(status) as string,
        }"
    >
        {{ status }}
    </div>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';
import type { PropType } from 'vue';

defineProps({
    status: {
        type: String as PropType<RepairRequestStatus>,
    },
});

const colorMap: Map<RepairRequestStatus, string> = new Map([
    [RepairRequestStatus.ACCEPTED, colorsList.primary600],
    [RepairRequestStatus.CANCELLED, colorsList.error600],
    [RepairRequestStatus.COMPLETED, colorsList.success600],
    [RepairRequestStatus.REJECTED, colorsList.error600],
    [RepairRequestStatus.WAITING_FOR_RESPONSE, colorsList.warning600],
    [RepairRequestStatus.WAITING_FOR_REVIEW, colorsList.warning600],
]);
</script>

<style lang="scss" scoped>
.status {
    width: fit-content;
    min-width: 16px;
    min-height: 16px;
    padding: 8px;
    border-radius: 8px;

    background: var(--status-color);
}
</style>
