<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { PartCatalogEntry } from '~~/types/parts';
import type { ParametersPage } from '~~/types/components';
import { ToastMode } from '~~/types/toast';

const router = useRouter();
const { showToast } = useToastManager();
const { data: parts, refresh } = useFetch<PartCatalogEntry[]>('/api/v1/admin/part-catalog');

const params = computed<ParametersPage>(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Teilekatalog',
        onCreate: '/admin/parts/new',
        entries: (parts.value ?? []).map(part => ({
            onDelete: async () => {
                try {
                    await $fetch(`/api/v1/admin/part-catalog/${ part.id }`, { method: 'DELETE' });
                    await refresh();
                }
                catch {
                    showToast({ message: 'Fehler beim Löschen', mode: ToastMode.Error });
                }
            },
            onEdit: () => router.push(`/admin/parts/${ part.id }`),
            fields: [
                { label: 'Name', type: 'text', value: part.name },
                { label: 'Hersteller', type: 'text', value: part.manufacturer ?? '' },
                { label: 'SKU', type: 'text', value: part.sku ?? '' },
            ],
        })),
    };
});
</script>
