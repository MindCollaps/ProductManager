<template>
    <common-page :title="page.title">
        <div class="edit-page-fields">
            <template
                v-for="(field, index) in page.fields"
                :key="index"
            >
                <ui-input-text
                    v-if="field.type === 'text'"
                    v-model="field.value as string"
                >{{ field.label }}</ui-input-text>
                <ui-input-number
                    v-if="field.type === 'number'"
                    v-model="field.value as number"
                >{{ field.label }}</ui-input-number>
                <ui-checkbox
                    v-if="field.type === 'checkbox'"
                    v-model="field.value as boolean"
                >{{ field.label }}</ui-checkbox>
                <common-selector
                    v-if="field.type === 'category'"
                    v-model="field.value as DeviceCategory[]"
                    path="/api/v1/admin/device-category"
                    :title="field.label"
                >
                    <template
                        #add="{ item }"
                    >
                        <common-category
                            :category="item"
                        />
                    </template>
                    <template #remove="{ item }">
                        <common-category
                            :category="item"
                        />
                    </template>
                </common-selector>
                <common-selector
                    v-if="field.type === 'brand'"
                    v-model="field.value as DeviceBrand[]"
                    one
                    path="/api/v1/admin/brand"
                >
                    <template
                        #add="{ item }"
                    >
                        {{ item.name }}
                    </template>
                    <template #remove="{ item }">
                        {{ item.name }}
                    </template>
                </common-selector>
                <ui-input-text
                    v-if="field.type === 'label'"
                    v-model="field.value as string"
                    class="checkbox_text"
                    :disabled="!page.isNew"
                >
                    {{ field.label }}
                </ui-input-text>
                <ui-color-picker
                    v-if="field.type === 'color'"
                    v-model="field.value as string"
                    type="color"
                >
                    {{ field.label }}
                </ui-color-picker>
            </template>
        </div>
        <div class="edit-page-controll">
            <ui-button
                type="primary"
                @click="$emit('save', $event)"
            >Save</ui-button>
            <ui-button
                type="secondary"
                @click="$emit('cancel', $event)"
            >Cancel</ui-button>
        </div>
    </common-page>
</template>

<script setup lang="ts">
import type { EditPage } from '~~/types/components';
import type { DeviceBrand, DeviceCategory } from '@prisma/client';

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
    },
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
