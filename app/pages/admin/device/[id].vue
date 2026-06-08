<template>
    <common-edit-page @save="save" @cancel="cancel" :page/>
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { Device, DeviceCategory } from '@prisma/client';

// Get id from route params
const route = useRoute();
const id = route.params.id as string;

const { data: device } = id !== 'new' 
  ? useFetch<Device>(`/api/v1/admin/device/${id}`)
  : { data: ref<Device | null>(null) };

const { data: categories } = id !== 'new' 
  ? useFetch<DeviceCategory[]>(`/api/v1/admin/device/categories/${id}`)
  : { data: ref<DeviceCategory[]>([]) };

const page: Ref<EditPage> = ref<EditPage>({
        title: id === 'new' ? 'Create Device Type' : 'Edit Device Type',
        fields: [
            {
                label: 'Name',
                type: 'text',
                value: device.value?.name || '',
            },
            {
                label: 'Description',
                type: 'text',
                value: device.value?.description || '',
            },
            {
                label: 'Category',
                type: 'category',
                options: categories.value?.map(e => e.id),
                value: categories.value,
            }
        ],
        isNew: id === 'new',
    });

function save() {
    const device = {
        name: page.value.fields[0]?.value as string,
        description: page.value.fields[1]?.value as string,
        categories: (page.value.fields[2]?.value as DeviceCategory[]).map(e => e.id),
    }
    $fetch(id === 'new' ? '/api/v1/admin/device' : `/api/v1/admin/device/${id}`, {
        method: id === 'new' ? 'POST' : 'PUT',
        body: device
    })
}

function cancel() {

}
</script>

