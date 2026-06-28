<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { DeviceBrand, DeviceCategory } from '@prisma/client';
import type { DeviceWithRelationsType } from '~~/types/req';

const { id, page, syncPage, save: saveToApi, cancel } = useAdminEdit('/api/v1/admin/device', '/admin/device');

const { data: device } = useFetch<DeviceWithRelationsType>(() => `/api/v1/admin/device/${ id.value }`);

watch([device, id], () => {
    syncPage('Neues Gerät', 'Gerät bearbeiten', [
        { label: 'Name', type: 'text', value: device.value?.name || '' },
        { label: 'Beschreibung', type: 'text', value: device.value?.description || '' },
        { label: 'Kategorie', type: 'category', value: device.value?.deviceCategories?.map(e => e.category) ?? [] },
        { label: 'Marke', type: 'label', value: device.value?.deviceBrand?.name ?? '' },
        { label: 'Neukaufpreis', type: 'number', value: device.value?.purchaseValue?.toString() ?? '' },
    ]);
}, { immediate: true });

async function save() {
    await saveToApi({
        name: page.value.fields[0]?.value as string,
        description: page.value.fields[1]?.value as string,
        categories: (page.value.fields[2]?.value as DeviceCategory[]).map(e => e.id),
        deviceBrandId: (page.value.fields[3]?.value as DeviceBrand[]).at(0)?.id,
        purchaseValue: Number(page.value.fields[4]?.value as number),
    });
}
</script>
