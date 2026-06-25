<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { PartCatalogEntry } from '~~/types/parts';

const { id, page, syncPage, save: saveToApi, cancel } = useAdminEdit('/api/v1/admin/part-catalog', '/admin/parts');

const { data: part } = useFetch<PartCatalogEntry>(() => `/api/v1/admin/part-catalog/${ id.value }`);

watch([part, id], () => {
    syncPage('Create catalog part', 'Edit catalog part', [
        { label: 'Name', type: 'text', value: part.value?.name ?? '' },
        { label: 'Manufacturer', type: 'text', value: part.value?.manufacturer ?? '' },
        { label: 'SKU', type: 'text', value: part.value?.sku ?? '' },
        { label: 'Description', type: 'text', value: part.value?.description ?? '' },
        { label: 'Unit Cost', type: 'number', value: Number(part.value?.unitCost ?? 0) },
        { label: 'Retail Price', type: 'number', value: Number(part.value?.retailPrice ?? 0) },
    ]);
}, { immediate: true });

async function save() {
    await saveToApi({
        name: String(page.value.fields[0]?.value ?? ''),
        manufacturer: String(page.value.fields[1]?.value ?? ''),
        sku: String(page.value.fields[2]?.value ?? ''),
        description: String(page.value.fields[3]?.value ?? ''),
        unitCost: Number(page.value.fields[4]?.value ?? 0),
        retailPrice: Number(page.value.fields[5]?.value ?? 0),
    });
}
</script>
