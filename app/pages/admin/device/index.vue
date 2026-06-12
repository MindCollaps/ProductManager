<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { ParametersPage } from '~~/types/components';
import type { DeviceWithCategories } from '~~/types/device';

const router = useRouter();

const { data: devices, refresh: refreshDevices } = useFetch<DeviceWithCategories[]>('/api/v1/admin/device');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Devices',
        onCreate: '/admin/device/new',
        entries: devices.value?.map(device => ({
            onDelete: () => {
                const confirmer = confirm(`Bist du sicher dass du ${ device.name } Loeschen willst?`);

                if (confirmer) {
                    $fetch(`/api/v1/staff/device/${ device.id }`, {
                        method: 'DELETE',
                    });
                    refreshDevices();
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
                    label: '',
                    type: 'category',
                    value: device.deviceCategories.map(entry => entry.category),
                },
            ],

        })) ?? [],
    };
});
</script>
