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
    syncPage('Neuer Aufgabentyp', 'Aufgabentyp bearbeiten', [
        { label: 'Name', type: 'text', value: workItemType.value?.name || '' },
        { label: 'Slug', type: 'label', value: workItemType.value?.slug || '' },
        { label: 'Beschreibung', type: 'text-area', value: workItemType.value?.description || '' },
        { label: 'Farbe', type: 'color', value: workItemType.value?.color || '' },
        { label: 'Icon', type: 'icon', value: workItemType.value?.icon || '' },
        { label: 'Reihenfolge', type: 'number', value: workItemType.value?.sortOrder ?? 0 },
        { label: 'Arbeitsminuten', type: 'number', value: workItemType.value?.laborMinutes ?? 0 },
        { label: 'Standardschritt', type: 'checkbox', value: workItemType.value?.isDefault ?? false },
    ]);
}, { immediate: true });

async function save() {
    await saveToApi({
        name: page.value.fields[0]?.value as string,
        slug: page.value.fields[1]?.value as string,
        description: page.value.fields[2]?.value as string,
        color: page.value.fields[3]?.value as string,
        icon: page.value.fields[4]?.value as string,
        sortOrder: Number(page.value.fields[5]?.value as number),
        laborMinutes: Number(page.value.fields[6]?.value as number),
        isDefault: Boolean(page.value.fields[7]?.value),
    });
}
</script>
