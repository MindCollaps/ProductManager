<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { DeviceCategory } from '@prisma/client';
import type { ParametersPage } from '~~/types/components';
import { ToastMode } from '~~/types/toast';

const router = useRouter();
const { showToast } = useToastManager();

const { data: categories, refresh: refreshCategories } = useFetch<DeviceCategory[]>('/api/v1/admin/device-category');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Kategorien',
        onCreate: '/admin/category/new',
        entries: categories.value?.map(category => ({
            onDelete: async () => {
                try {
                    await $fetch(`/api/v1/admin/category/${ category.id }`, { method: 'DELETE' });
                    await refreshCategories();
                }
                catch {
                    showToast({ message: 'Fehler beim Löschen', mode: ToastMode.Error });
                }
            },
            onEdit: () => {
                router.push(`/admin/category/${ category.id }`);
            },
            fields: [
                {
                    label: 'Name',
                    type: 'text',
                    value: category.name,
                },
                {
                    label: 'Slug',
                    type: 'text',
                    value: category.slug ?? '',
                },
                {
                    label: 'Beschreibung',
                    type: 'text',
                    value: category.description ?? '',
                },
                {
                    label: 'Farbe',
                    type: 'color',
                    value: category.color ?? '',
                },
            ],

        })) ?? [],
    };
});
</script>
