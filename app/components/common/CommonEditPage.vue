<template>
    <common-page :title="page.title">
        <div class="edit-page-fields">
            <template v-for="(field, index) in page.fields" :key="index">
                <common-input-text v-if="field.type === 'text'" v-model="field.value as string">{{ field.label }}</common-input-text>
                <common-input-number v-if="field.type === 'number'" v-model="field.value as number">{{ field.label }}</common-input-number>
                <common-checkbox v-if="field.type === 'checkbox'" v-model="field.value as boolean">{{ field.label }}</common-checkbox>
                <common-category-selector v-if="field.type === 'category'" v-model="field.value as DeviceCategory[]">{{ field.label }}</common-category-selector>
            </template>
        </div>
        <div class="edit-page-controll">
            <common-button @click="$emit('save', $event)" type="primary">Save</common-button>
            <common-button @click="$emit('cancel', $event)" type="secondary">Cancel</common-button>
        </div>
    </common-page>
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { DeviceCategory } from '@prisma/client';

defineProps({
    page: {
        type: Object as PropType<EditPage>,
        required: true,
    },
});

defineEmits({
    save(e: MouseEvent) {
        return true;
    },
    cancel(e: MouseEvent) {
        return true;
    }
});
</script>
<style lang="scss" scoped>  
.edit-page-fields {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.edit-page-controll {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
}
</style>