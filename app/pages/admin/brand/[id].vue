<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { DeviceBrand } from '@prisma/client';

const { id, page, syncPage, save: saveToApi, cancel } = useAdminEdit('/api/v1/admin/brand', '/admin/brand');

const { data: brand } = useFetch<DeviceBrand>(() => `/api/v1/admin/brand/${ id.value }`);

watch([brand, id], () => {
    syncPage('Create Device Brand', 'Edit Device Brand', [
        { label: 'Name', type: 'text', value: brand.value?.name || '' },
    ]);
}, { immediate: true });

async function save() {
    await saveToApi({ name: page.value.fields[0]?.value as string });
}
</script>
