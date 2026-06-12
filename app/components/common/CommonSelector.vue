<template>
    <div
        class="selector"
        :class="{ 'selector--focused': focused }"
    >
        <div
            v-if="$slots.default"
            class="selector_label"
        >
            {{ title }}
        </div>
        <div
            class="selector_container"
            @click="searchTextRef?.focus()"
        >
            <template v-for="item in selectedItems">
                <ui-button @click="removeItem(item)">Remove</ui-button>
                <slot
                    :item="item"
                    name="remove"
                />
            </template>
            <icon
                name="material-symbols:arrow-drop-down"
                :size="22"
                style="cursor: pointer;"
                @click="showAll = !showAll"
            />
            <input
                ref="searchText"
                v-model="searchText"
                :size="searchText.length || 1"
                type="text"
            >
        </div>
        <div
            v-if="searchText.length >= 1 || showAll"
            class="selector_select"
        >
            <div class="selector_select_centerbox">
                <template v-for="item in showAll ? leftEntries : searchEntries">
                    <div class="selector_select_controll">
                        <ui-button @click="addItem(item)">Add</ui-button>
                        <slot
                            :item="item"
                            name="add"
                        />
                    </div>
                </template>
                {{ searchEntries?.length === 0 ? 'Nothing found' : '' }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends { id: string, name: string }">
const props = defineProps({
    title: {
        type: String,
    },
    height: {
        type: String,
    },
    disabled: {
        type: Boolean,
    },
    path: {
        type: String,
        required: true,
    },
    one: {
        type: Boolean,
        default: false,
    },
});

defineSlots<{
    add(props: { item: T }): any;
    remove(props: { item: T }): any;
}>();

const selectedItems = defineModel<T[]>({
    type: Array as PropType<T[]>,
    default: () => [],
});

const focused = defineModel('focused', { type: Boolean });

const { data: allEntries } = useFetch<T[]>(props.path);
const leftEntries = computed(() => allEntries.value?.filter(e => !selectedItems.value?.some(s => s.id === e.id)));
const searchText = ref('');
const searchTextRef = useTemplateRef('searchText');
const searchEntries = computed(() => leftEntries.value?.filter(e => e.name.toLowerCase().startsWith(searchText.value.toLowerCase()) || e.name.includes(searchText.value)));
const showAll = ref(false);

function addItem(c: T) {
    if (props.one) {
        selectedItems.value = [c];
    }
    else {
        selectedItems.value.push(c);
    }
}

function removeItem(c: T) {
    if (!selectedItems.value) return;
    const idx = selectedItems.value.findIndex(e => e.id === c.id);
    if (idx !== -1) selectedItems.value.splice(idx, 1);
}
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
        display: flex;
        flex-direction: column;
        align-items: center;

        width: 100%;
        margin-top: 8px;
        border: 2px solid transparent;
        border-radius: 8px;

        background: $darkgray900;

        transition: 0.3s;

        @include hover {
            &:hover {
                border-color: $darkgray800;
            }
        }

        &_controll {
            display: flex;
            gap: 16px;
            align-items: center;
            justify-content: center;
        }

        &_centerbox {
            display: flex;
            flex-direction: column;
            gap: 8px;
            align-items: start;

            width: 100%;
            width: fit-content;
        }
    }

    &--focused .input_container {
        border-color: $primary500
    }
}
</style>
