<template>
    <view-parameters :params="params"/>
</template>

<script setup lang="ts">
import type { WorkItemType } from '@prisma/client';
import type { ParametersPage } from '~~/types/components';

type WorkItemTypeWithDefault = WorkItemType & { laborMinutes: number | null; isDefault: boolean };

const router = useRouter();

const { data: workItemTypes, refresh: refreshWorkItemTypes } = useFetch<WorkItemTypeWithDefault[]>('/api/v1/admin/work-item-type');
const params: ComputedRef<ParametersPage> = computed(() => {
    return {
        editable: true,
        removeable: true,
        title: 'Work Item Types',
        onCreate: '/admin/work-item-type/new',
        entries: workItemTypes.value?.map(workItemType => ({
            onDelete: () => {
                const confirmer = confirm(`Bist du sicher dass du ${ workItemType.name } loeschen willst?`);

                if (confirmer) {
                    $fetch(`/api/v1/admin/work-item-type/${ workItemType.id }`, {
                        method: 'DELETE',
                    });
                    refreshWorkItemTypes();
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
                    label: 'Description',
                    type: 'text',
                    value: workItemType.description ?? '',
                },
                {
                    label: 'Color',
                    type: 'color',
                    value: workItemType.color ?? '',
                },
                {
                    label: 'Icon',
                    type: 'text',
                    value: workItemType.icon ?? '',
                },
                {
                    label: 'Sort Order',
                    type: 'text',
                    value: workItemType.sortOrder?.toString() ?? '',
                },
                {
                    label: 'Labor Minutes',
                    type: 'text',
                    value: workItemType.laborMinutes?.toString() ?? '',
                },
                {
                    label: 'Default Step',
                    type: 'text',
                    value: workItemType.isDefault ? 'Yes' : 'No',
                },
            ],

        })) ?? [],
    };
});
</script>
