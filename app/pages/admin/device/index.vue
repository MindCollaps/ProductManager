<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { ParametersPage } from '~~/types/components';
import type { DeviceWithRelationsType } from '~~/types/req';
import { ToastMode } from '~~/types/toast';

const router = useRouter();
const { showToast } = useToastManager();

const { data: devices, refresh: refreshDevices } = useFetch<DeviceWithRelationsType[]>('/api/v1/admin/device');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Geräte',
        onCreate: '/admin/device/new',
        entries: devices.value?.map(device => ({
            onDelete: async () => {
                try {
                    await $fetch(`/api/v1/staff/device/${ device.id }`, { method: 'DELETE' });
                    await refreshDevices();
                }
                catch {
                    showToast({ message: 'Fehler beim Löschen', mode: ToastMode.Error });
                }
            },
            onEdit: () => {
                router.push(`/admin/device/${ device.id }`);
            },
            fields: [
                {
                    label: 'Name',
                    type: 'text',
                    value: device.name,
                },
                {
                    label: 'Marke',
                    type: 'text',
                    value: device.deviceBrand.name,
                },
                {
                    label: 'Neukaufpreis',
                    type: 'text',
                    value: device.purchaseValue?.toString() ?? '',
                },
                {
                    label: '',
                    type: 'category',
                    value: device.deviceCategories.map(entry => entry.category),
                },
            ],

        })) ?? [],
    };
});
</script>
