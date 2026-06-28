<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { DeviceBrand } from '@prisma/client';
import type { ParametersPage } from '~~/types/components';
import { ToastMode } from '~~/types/toast';

const router = useRouter();
const { showToast } = useToastManager();

const { data: brands, refresh: refreshBrands } = useFetch<DeviceBrand[]>('/api/v1/admin/brand');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Marken',
        onCreate: '/admin/brand/new',
        entries: brands.value?.map(brand => ({
            onDelete: async () => {
                try {
                    await $fetch(`/api/v1/admin/brand/${ brand.id }`, { method: 'DELETE' });
                    await refreshBrands();
                }
                catch {
                    showToast({ message: 'Fehler beim Löschen', mode: ToastMode.Error });
                }
            },
            onEdit: () => {
                router.push(`/admin/brand/${ brand.id }`);
            },
            fields: [
                {
                    label: 'Name',
                    type: 'text',
                    value: brand.name,
                },
            ],

        })) ?? [],
    };
});
</script>
