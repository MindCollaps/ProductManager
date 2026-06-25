<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { PartCatalogEntry } from '~~/types/parts';
import type { ParametersPage } from '~~/types/components';

const router = useRouter();
const { data: parts, refresh } = useFetch<PartCatalogEntry[]>('/api/v1/admin/part-catalog');

const params = computed<ParametersPage>(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Parts Catalog',
        onCreate: '/admin/parts/new',
        entries: (parts.value ?? []).map(part => ({
            onDelete: async () => {
                if (!confirm(`Delete ${ part.name }?`)) return;
                await $fetch(`/api/v1/admin/part-catalog/${ part.id }`, { method: 'DELETE' });
                await refresh();
            },
            onEdit: () => router.push(`/admin/parts/${ part.id }`),
            fields: [
                { label: 'Name', type: 'text', value: part.name },
                { label: 'Manufacturer', type: 'text', value: part.manufacturer ?? '' },
                { label: 'SKU', type: 'text', value: part.sku ?? '' },
            ],
        })),
    };
});
</script>
