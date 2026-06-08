<template>
    <common-edit-page :page/>
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { DeviceCategory } from '@prisma/client';

// Get id from route params
const route = useRoute();
const id = route.params.id as string;

const category: Ref<DeviceCategory | null> = ref(null);

const page: Ref<EditPage> = ref<EditPage>({
        title: 'Edit Device Type',
        fields: [
            {
                label: 'Name',
                type: 'text',
                value: category.value?.name || '',
            },
            {
                label: 'Description',
                type: 'text',
                value: category.value?.description || '',
            },
        ],
        isNew: id === 'new',
    });

onMounted(async () => {
    if (id === 'new') {
        category.value = null;
    } else {
        const { data } = await useFetch(`/api/admin/categories/${id}`);
        category.value = data.value as DeviceCategory;
    }
});
</script>

