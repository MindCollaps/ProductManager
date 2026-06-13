<template>
    <div class="work-item-card">
        <div class="work-item-card-header">
            <div>
                <div class="work-item-card-title">{{ item.title }}</div>
                <div class="work-item-card-subtitle">
                    {{ item.workItemType.name }} · Order {{ item.orderIndex }}
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
            <span>Assigned: {{ assignedStaffLabel }}</span>
            <span v-if="item.laborMinutes !== null">{{ item.laborMinutes }} min</span>
            <span v-if="item.completedAt">Completed</span>
            <span v-if="item.workItemType.isDefault">Default</span>
        </div>

        <div
            v-if="editable"
            class="work-item-card-actions"
        >
            <ui-button @click="emit('edit')">Edit</ui-button>
            <ui-button @click="emit('toggle')">
                {{ item.status === 'DONE' ? 'Reopen' : 'Complete' }}
            </ui-button>
            <ui-button primary-color="error600" @click="emit('delete')">Delete</ui-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { RepairWorkItemWithRelationsType } from '~~/types/req';

const props = defineProps({
    item: {
        type: Object as PropType<RepairWorkItemWithRelationsType>,
        required: true,
    },
    editable: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits({
    delete() {
        return true;
    },
    edit() {
        return true;
    },
    toggle() {
        return true;
    },
});

const assignedStaffLabel = computed(() => props.item.assignedStaff?.displayName ?? props.item.assignedStaff?.username ?? 'Unassigned');
</script>

<style scoped lang="scss">
.work-item-card {
    display: flex;
    flex-direction: column;
    gap: 12px;

    padding: 16px;
    border: 1px solid $lightgray150;
    border-radius: 16px;

    background: linear-gradient(180deg, rgb(255 255 255 / 3%), rgb(255 255 255 / 1%));

    &-header {
        display: flex;
        gap: 12px;
        align-items: start;
        justify-content: space-between;
    }

    &-title {
        font-size: 16px;
        font-weight: 700;
    }

    &-subtitle,
    &-meta {
        font-size: 12px;
        color: $darkgray700;
    }

    &-description {
        line-height: 1.4;
        color: $darkgray900;
    }

    &-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    &-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }
}
</style>