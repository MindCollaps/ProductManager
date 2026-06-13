<template>
    <div
        class="work-item-status"
        :data-status="status"
    >
        {{ label }}
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

type RepairWorkItemStatus = 'BLOCKED' | 'DONE' | 'IN_PROGRESS' | 'PENDING';

const props = defineProps({
    status: {
        type: String as PropType<RepairWorkItemStatus>,
        required: true,
    },
});

const statusLabels: Record<RepairWorkItemStatus, string> = {
    BLOCKED: 'Blocked',
    DONE: 'Done',
    IN_PROGRESS: 'In progress',
    PENDING: 'Pending',
};

const label = computed(() => statusLabels[props.status]);
</script>

<style scoped lang="scss">
.work-item-status {
    width: fit-content;
    padding: 4px 10px;
    border-radius: 999px;

    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.02em;

    color: $darkgray950;
    background: $lightgray200;

    &[data-status='DONE'] {
        background: $success600;
    }

    &[data-status='IN_PROGRESS'] {
        background: $warning600;
    }

    &[data-status='BLOCKED'] {
        background: $error600;
    }

    &[data-status='PENDING'] {
        background: $lightgray300;
    }
}
</style>