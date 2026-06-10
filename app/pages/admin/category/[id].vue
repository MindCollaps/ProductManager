<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { DeviceCategory } from '@prisma/client';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);

const { data: category } = useFetch<DeviceCategory>(() => `/api/v1/admin/device-category/${ id.value }`);

const page: Ref<EditPage> = ref({
    title: 'Create Device Type',
    fields: [
        {
            label: 'Name',
            type: 'text',
            value: '',
        },
        {
            label: 'Slug',
            type: 'label',
            value: category.value?.slug || '',
        },
        {
            label: 'Description',
            type: 'text',
            value: '',
        },
        {
            label: 'Color',
            type: 'color',
            value: '',
        },
    ],
    isNew: true,
});

watch([category, id], () => {
    page.value.title = id.value === 'new' ? 'Create Device Category' : 'Edit Device Category';
    page.value.fields = [
        { label: 'Name', type: 'text', value: category.value?.name || '' },
        { label: 'Slug', type: 'label', value: category.value?.slug || '' },
        { label: 'Description', type: 'text', value: category.value?.description || '' },
        { label: 'Color', type: 'color', value: category.value?.color || '' },
    ];
    page.value.isNew = id.value === 'new';
});

const { showToast } = useToastManager();

function save() {
    const category = {
        name: page.value.fields[0]?.value as string,
        description: page.value.fields[2]?.value as string,
        color: page.value.fields[3]?.value as string,
        slug: page.value.fields[1]?.value as string,
    };
    $fetch(id.value === 'new' ? '/api/v1/admin/device-category' : `/api/v1/admin/device-category/${ id.value }`, {
        method: id.value === 'new' ? 'POST' : 'PUT',
        body: category,
    });

    showToast({
        message: 'Saved',
    });
}

function cancel() {
    router.push('/admin/category');
}
</script>

