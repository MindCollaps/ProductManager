<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { WorkItemType } from '@prisma/client';

type WorkItemTypeWithDefault = WorkItemType & { laborMinutes: number | null; isDefault: boolean };

const { id, page, syncPage, save: saveToApi, cancel } = useAdminEdit('/api/v1/admin/work-item-type', '/admin/work-item-type');

const { data: workItemType } = useFetch<WorkItemTypeWithDefault>(() => `/api/v1/admin/work-item-type/${ id.value }`);

watch([workItemType, id], () => {
    syncPage('Create Work Item Type', 'Edit Work Item Type', [
        { label: 'Name', type: 'text', value: workItemType.value?.name || '' },
        { label: 'Slug', type: 'label', value: workItemType.value?.slug || '' },
        { label: 'Description', type: 'text', value: workItemType.value?.description || '' },
        { label: 'Color', type: 'color', value: workItemType.value?.color || '' },
        { label: 'Icon', type: 'text', value: workItemType.value?.icon || '' },
        { label: 'Sort Order', type: 'number', value: workItemType.value?.sortOrder ?? 0 },
        { label: 'Labor Minutes', type: 'number', value: workItemType.value?.laborMinutes ?? 0 },
        { label: 'Default Step', type: 'checkbox', value: workItemType.value?.isDefault ?? false },
    ]);
}, { immediate: true });

async function save() {
    await saveToApi({
        name: page.value.fields[0]?.value as string,
        slug: page.value.fields[1]?.value as string,
        description: page.value.fields[2]?.value as string,
        color: page.value.fields[3]?.value as string,
        icon: page.value.fields[4]?.value as string,
        laborMinutes: Number(page.value.fields[6]?.value as number),
        isDefault: Boolean(page.value.fields[7]?.value),
    });
}
</script>
