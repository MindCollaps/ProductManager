<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { DeviceCategory } from '@prisma/client';
import type { ParametersPage } from '~~/types/components';

const router = useRouter();

const { data: categories, refresh: refreshCategories } = useFetch<DeviceCategory[]>('/api/v1/admin/device-category');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Categories',
        onCreate: '/admin/category/new',
        entries: categories.value?.map(category => ({
            onDelete: () => {
                const confirmer = confirm(`Bist du sicher dass du ${ category.name } loeschen willst?`);

                if (confirmer) {
                    $fetch(`/api/v1/admin/category/${ category.id }`, {
                        method: 'DELETE',
                    });
                    refreshCategories();
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
                    label: 'Desciption',
                    type: 'text',
                    value: category.description ?? '',
                },
                {
                    label: 'Color',
                    type: 'color',
                    value: category.color ?? '',
                },
            ],

        })) ?? [],
    };
});
</script>
