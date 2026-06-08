<template>
    <div
        class="selector"
        :class="{ 'selector--focused': focused }"
    >
        <div
            v-if="$slots.default"
            class="selector_label"
        >
            <slot/>
        </div>
        <div
            class="selector_container"
            @click="searchTextRef?.focus()"
        >
            <common-category v-for="c in selectedCategories" deletable :key="c.slug" @selected="selectedCategories = selectedCategories.filter(e => e.slug !== c.slug)" :category="c"/>
            <input ref="searchText" v-model="searchText" type="text" :size="searchText.length || 1">
        </div>
        <div v-if="searchText.length >= 1" class="selector_select">
            <div class="selector_select_centerbox">
                <common-category v-for="c in searchCategories" addable :key="c.slug" @selected="selectedCategories.push(c)" :category="c"/>
                {{ searchCategories?.length == 0 ? 'No category found' : '' }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { DeviceCategory } from '@prisma/client';

    const props = defineProps({
    height: {
        type: String,
    },
    disabled: {
        type: Boolean,
    },
});

defineEmits({
    change(event: Event) {
        return true;
    },
});

defineSlots<{ default?: () => string }>();
const selectedCategories = defineModel<DeviceCategory[]>({
    required: true
})

const focused = defineModel('focused', { type: Boolean });

const {data: allCategories} = useAsyncData<DeviceCategory[]>('categories', () => $fetch<DeviceCategory[]>('/api/v1/admin/device-category'), {immediate: true});
const leftCategories = computed(() => allCategories.value?.filter(e => !selectedCategories.value?.includes(e)));
const searchText = ref('');
const searchTextRef = useTemplateRef('searchText');
const searchCategories = computed(() => leftCategories.value?.filter(e => e.slug.startsWith(searchText.value) || e.name.startsWith(searchText.value) || e.name.includes(searchText.value) || e.slug.includes(searchText.value)));
</script>

<style scoped lang="scss">
.selector {
    width: 100%;

    &_label {
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;

        @include mobile {
            font-size: 10px;
        }
    }

    &_container {
        cursor: text;

        display: flex;
        gap: 16px;
        align-items: center;

        
        padding: 8px 16px;
        border: 2px solid transparent;
        border-radius: 8px;

        background: $darkgray900;

        transition: 0.3s;

        @include hover {
            &:hover {
                border-color: $darkgray800;
            }
        }

        input {
            border: none;
            color: $typographyPrimary;
            background: none;

            &:focus {
                outline: none;
            }
        }
    }

    &_select {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;

        border: 2px solid transparent;
        border-radius: 8px;

        background: $darkgray900;

        transition: 0.3s;

        @include hover {
            &:hover {
                border-color: $darkgray800;
            }
        }

        &_centerbox {
            display: flex;
            flex-direction: column;
            gap: 4px;
            align-items: start;

            width: fit-content;
        }
    }

    &--focused .input_container {
        border-color: $primary500
    }
}
</style>
