<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { WorkItemType } from '@prisma/client';
import type { ParametersPage } from '~~/types/components';
import { ToastMode } from '~~/types/toast';

type WorkItemTypeWithDefault = WorkItemType & { laborMinutes: number | null; isDefault: boolean };

const router = useRouter();
const { showToast } = useToastManager();

const { data: workItemTypes, refresh: refreshWorkItemTypes } = useFetch<WorkItemTypeWithDefault[]>('/api/v1/admin/work-item-type');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Aufgabentypen',
        onCreate: '/admin/work-item-type/new',
        entries: workItemTypes.value?.map(workItemType => ({
            onDelete: async () => {
                try {
                    await $fetch(`/api/v1/admin/work-item-type/${ workItemType.id }`, { method: 'DELETE' });
                    await refreshWorkItemTypes();
                }
                catch {
                    showToast({ message: 'Fehler beim Löschen', mode: ToastMode.Error });
                }
            },
            onEdit: () => {
                router.push(`/admin/work-item-type/${ workItemType.id }`);
            },
            fields: [
                {
                    label: 'Name',
                    type: 'text',
                    value: workItemType.name,
                },
                {
                    label: 'Slug',
                    type: 'text',
                    value: workItemType.slug,
                },
                {
                    label: 'Beschreibung',
                    type: 'text',
                    value: workItemType.description ?? '',
                },
                {
                    label: 'Farbe',
                    type: 'color',
                    value: workItemType.color ?? '',
                },
                {
                    label: 'Icon',
                    type: 'icon',
                    value: workItemType.icon ?? '',
                },
                {
                    label: 'Reihenfolge',
                    type: 'text',
                    value: workItemType.sortOrder?.toString() ?? '',
                },
                {
                    label: 'Arbeitsminuten',
                    type: 'text',
                    value: workItemType.laborMinutes?.toString() ?? '',
                },
                {
                    label: 'Standardschritt',
                    type: 'text',
                    value: workItemType.isDefault ? 'Ja' : 'Nein',
                },
            ],

        })) ?? [],
    };
});
</script>
