<template>
    <common-page :title="params.title">
        <div class="parameters-list">
            <div
                v-for="e in params.entries"
                class="parameters-entry-container"
            >
                <div class="parameters-entry">
                    <div
                        v-for="f in e.fields"
                        class="parameters-entry-field"
                    >
                        <template v-if="f.type === 'text'">
                            {{ f.label }}: {{ f.value }}
                        </template>
                        <div
                            v-if="f.type === 'category'"
                            class="parameters-entry-field-categories"
                        >
                            <common-category
                                v-for="c in f.value as DeviceCategory[]"
                                :category="c"
                            />
                        </div>
                        <div
                            v-if="f.type === 'color'"
                            class="page-color-container"
                        >
                            <div
                                class="page-color"
                                :style="{
                                    '--page-color': f.value as string,
                                }"
                            />
                            {{ f.value }}
                        </div>
                    </div>
                </div>
                <div class="parameters-entry-buttons">
                    <ui-button
                        primary-color="warning700"
                        @click="e.onEdit"
                    >Edit</ui-button><ui-button
                        primary-color="error700"
                        @click="e.onDelete"
                    >Delete</ui-button>
                </div>
            </div>
        </div>
        <ui-button @click="router.push(params.onCreate)">Create</ui-button>
    </common-page>
</template>

<script lang="ts" setup>
import type { DeviceCategory } from '@prisma/client';
import type { ParametersPage } from '~~/types/components';
import { CommonPage } from '#components';

defineProps({
    params: {
        type: Object as PropType<ParametersPage>,
        required: true,
    },
});

const router = useRouter();
</script>

<style lang="scss" scoped>
.parameters-list {
    display: flex;
    gap: 16px;
    height: fit-content;
    width: 100%;
}

.page-color {
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background: var(--page-color);

    &-container {
        display: flex;
        gap: 8px;
        align-items: center;
    }
}

.parameters-entry {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: start;

    &-container {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        flex-wrap: wrap;

        width: 10%;
        padding: 16px;
        border-radius: 16px;

        background: $darkgray900;
    }

    &-buttons {
        display: flex;
        flex-direction: row;
        gap: 8px;
        justify-content: space-between;
        padding: 4px;

        width: 100%;
    }

    &-field {
        &-categories {
            display: flex;
            flex-direction: row;
            gap: 8px;
            align-items: center;
            justify-content: start;
        }
    }
}
</style>
