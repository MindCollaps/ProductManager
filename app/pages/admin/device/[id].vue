<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { Device, DeviceCategory } from '@prisma/client';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);

const { data: device } = useFetch<Device>(`/api/v1/admin/device/${ id.value }`);

const { data: categories } = useFetch<DeviceCategory[]>(`/api/v1/admin/device/categories/${ id.value }`);

const page = ref<EditPage>({
    title: id.value === 'new' ? 'Create Device Type' : 'Edit Device Type',
    fields: [
        { label: 'Name', type: 'text', value: '' },
        { label: 'Description', type: 'text', value: '' },
        { label: 'Category', type: 'category', options: [], value: [] },
    ],
    isNew: true,
});

watch([device, categories, id], () => {
    page.value.title = id.value === 'new' ? 'Create Device Type' : 'Edit Device Type';
    page.value.fields = [
        { label: 'Name', type: 'text', value: device.value?.name || '' },
        { label: 'Description', type: 'text', value: device.value?.description || '' },
        { label: 'Category', type: 'category', options: categories.value?.map(e => e.id) || [], value: categories.value || [] },
    ];
    page.value.isNew = id.value === 'new';
});

const { showToast } = useToastManager();

function save() {
    const device = {
        name: page.value.fields[0]?.value as string,
        description: page.value.fields[1]?.value as string,
        categories: (page.value.fields[2]?.value as DeviceCategory[]).map(e => e.id),
    };
    $fetch(id.value === 'new' ? '/api/v1/admin/device' : `/api/v1/admin/device/${ id.value }`, {
        method: id.value === 'new' ? 'POST' : 'PUT',
        body: device,
    });

    showToast({
        message: 'Saved',
    });
}

function cancel() {
    router.push('/admin/device');
}
</script>

