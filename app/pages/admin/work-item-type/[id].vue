<template>
    <view-edit-page
        :page
        @cancel="cancel"
        @save="save"
    />
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { WorkItemType } from '@prisma/client';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);

const { data: workItemType } = useFetch<WorkItemType>(() => `/api/v1/admin/work-item-type/${ id.value }`);

const page: Ref<EditPage> = ref({
    title: 'Create Work Item Type',
    fields: [
        { label: 'Name', type: 'text', value: workItemType.value?.name || '' },
        { label: 'Slug', type: 'label', value: workItemType.value?.slug || '' },
        { label: 'Description', type: 'text', value: workItemType.value?.description || '' },
        { label: 'Color', type: 'color', value: workItemType.value?.color || '' },
        { label: 'Icon', type: 'text', value: workItemType.value?.icon || '' },
        { label: 'Sort Order', type: 'number', value: workItemType.value?.sortOrder ?? 0 },
    ],
    isNew: true,
});

watch([workItemType, id], () => {
    page.value.title = id.value === 'new' ? 'Create Work Item Type' : 'Edit Work Item Type';
    page.value.fields = [
        { label: 'Name', type: 'text', value: workItemType.value?.name || '' },
        { label: 'Slug', type: 'label', value: workItemType.value?.slug || '' },
        { label: 'Description', type: 'text', value: workItemType.value?.description || '' },
        { label: 'Color', type: 'color', value: workItemType.value?.color || '' },
        { label: 'Icon', type: 'text', value: workItemType.value?.icon || '' },
        { label: 'Sort Order', type: 'number', value: workItemType.value?.sortOrder ?? 0 },
    ];
    page.value.isNew = id.value === 'new';
}, {
    immediate: true,
});

const { showToast } = useToastManager();

function save() {
    const workItemType = {
        name: page.value.fields[0]?.value as string,
        slug: page.value.fields[1]?.value as string,
        description: page.value.fields[2]?.value as string,
        color: page.value.fields[3]?.value as string,
        icon: page.value.fields[4]?.value as string,
        sortOrder: Number(page.value.fields[5]?.value as number),
    };

    $fetch(id.value === 'new' ? '/api/v1/admin/work-item-type' : `/api/v1/admin/work-item-type/${ id.value }`, {
        method: id.value === 'new' ? 'POST' : 'PUT',
        body: workItemType,
    });

    showToast({
        message: 'Saved',
    });
}

function cancel() {
    router.push('/admin/work-item-type');
}

</script>

