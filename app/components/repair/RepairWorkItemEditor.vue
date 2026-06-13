<template>
    <common-popup
        :is-visible="isVisible"
        :submit-text="submitText"
        close-text="Cancel"
        @close="emit('close')"
        @submit="submit"
    >
        <div class="work-item-editor">
            <h2>{{ title }}</h2>

            <common-selector
                v-model="selectedWorkItemType"
                one
                path="/api/v1/admin/work-item-type"
            >
                <template #add="{ item }">
                    {{ item.name }}
                </template>
                <template #remove="{ item }">
                    {{ item.name }}
                </template>
            </common-selector>

            <common-selector
                v-model="selectedStaff"
                one
                path="/api/v1/staff/user"
            >
                <template #add="{ item }">
                    {{ item.name }}
                </template>
                <template #remove="{ item }">
                    {{ item.name }}
                </template>
            </common-selector>

            <ui-input-text v-model="form.title">Title</ui-input-text>
            <ui-input-number v-model="form.orderIndex">Order</ui-input-number>
            <ui-input-number v-model="form.laborMinutes">Labor minutes</ui-input-number>
            <ui-text-area v-model="form.description">Description</ui-text-area>
            <ui-checkbox v-model="form.completed">Completed</ui-checkbox>
        </div>
    </common-popup>
</template>

<script setup lang="ts" generic="T extends { id: string; name: string }">
import type { PropType } from 'vue';
import type { RepairWorkItemDraft } from '~~/app/utils/repairWorkItems';
import type { RepairWorkItemWithRelationsType } from '~~/types/req';

type SelectableEntry = { id: string; name: string };
type WorkItemTypeOption = SelectableEntry & {
    description?: string | null;
    sortOrder?: number;
    laborMinutes?: number | null;
};

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: 'Edit work item',
    },
    item: {
        type: Object as PropType<RepairWorkItemWithRelationsType | null>,
        default: null,
    },
    defaultOrderIndex: {
        type: Number,
        default: 0,
    },
});

const emit = defineEmits({
    close() {
        return true;
    },
    save(payload: RepairWorkItemDraft) {
        return true;
    },
});

const form = reactive<RepairWorkItemDraft>({
    workItemTypeId: null,
    title: '',
    description: '',
    orderIndex: props.defaultOrderIndex,
    assignedStaffId: null,
    laborMinutes: null,
    completed: false,
});

const selectedWorkItemType = ref<WorkItemTypeOption[]>([]);
const selectedStaff = ref<SelectableEntry[]>([]);

function applySelectedWorkItemTypeDefaults() {
    const selectedWorkItemTypeEntry = selectedWorkItemType.value[0];

    if (!selectedWorkItemTypeEntry) {
        return;
    }

    form.workItemTypeId = selectedWorkItemTypeEntry.id;
    form.title = selectedWorkItemTypeEntry.name;
    form.orderIndex = selectedWorkItemTypeEntry.sortOrder ?? form.orderIndex;
    form.description = selectedWorkItemTypeEntry.description ?? form.description;
    form.laborMinutes = selectedWorkItemTypeEntry.laborMinutes ?? form.laborMinutes;
}

watch([() => props.item, () => props.defaultOrderIndex, () => props.isVisible], () => {
    if (props.item) {
        form.title = props.item.title;
        form.description = props.item.description ?? '';
        form.orderIndex = props.item.orderIndex;
        form.laborMinutes = props.item.laborMinutes ?? null;
        form.completed = props.item.status === 'DONE';
        selectedWorkItemType.value = [
            {
                id: props.item.workItemType.id,
                name: props.item.workItemType.name,
                description: props.item.workItemType.description,
                sortOrder: props.item.workItemType.sortOrder,
                laborMinutes: props.item.workItemType.laborMinutes ?? null,
            },
        ];
        selectedStaff.value = props.item.assignedStaff
            ? [{
                id: props.item.assignedStaff.id,
                name: props.item.assignedStaff.displayName ?? props.item.assignedStaff.username ?? props.item.assignedStaff.email,
            }]
            : [];
        form.workItemTypeId = props.item.workItemType.id;
        form.assignedStaffId = props.item.assignedStaff?.id ?? null;
    }
    else {
        form.title = '';
        form.description = '';
        form.orderIndex = props.defaultOrderIndex;
        form.laborMinutes = null;
        form.completed = false;
        form.workItemTypeId = null;
        form.assignedStaffId = null;
        selectedWorkItemType.value = [];
        selectedStaff.value = [];
    }
}, {
    immediate: true,
});

watch(selectedWorkItemType, () => {
    if (!props.item) {
        applySelectedWorkItemTypeDefaults();
    }
});

const submitText = computed(() => props.item ? 'Update' : 'Create');

function submit() {
    applySelectedWorkItemTypeDefaults();
    form.assignedStaffId = selectedStaff.value[0]?.id ?? null;

    emit('save', { ...form });
}
</script>

<style scoped lang="scss">
.work-item-editor {
    display: flex;
    flex-direction: column;
    gap: 16px;

    min-width: min(720px, 80vw);
}
</style>