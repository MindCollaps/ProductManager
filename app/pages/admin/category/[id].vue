<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { DeviceCategory } from '@prisma/client';

const { id, page, syncPage, save: saveToApi, cancel } = useAdminEdit('/api/v1/admin/device-category', '/admin/category');

const { data: category } = useFetch<DeviceCategory>(() => `/api/v1/admin/device-category/${ id.value }`);

watch([category, id], () => {
    syncPage('Create Device Category', 'Edit Device Category', [
        { label: 'Name', type: 'text', value: category.value?.name || '' },
        { label: 'Slug', type: 'label', value: category.value?.slug || '' },
        { label: 'Description', type: 'text', value: category.value?.description || '' },
        { label: 'Color', type: 'color', value: category.value?.color || '' },
    ]);
}, { immediate: true });

async function save() {
    await saveToApi({
        name: page.value.fields[0]?.value as string,
        slug: page.value.fields[1]?.value as string,
        description: page.value.fields[2]?.value as string,
        color: page.value.fields[3]?.value as string,
    });
}
</script>
