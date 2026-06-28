<template>
    <div
        ref="selectorRoot"
        class="selector"
        :class="{ 'selector--focused': focused }"
    >
        <div
            v-if="title"
            class="selector_label"
        >
            {{ title }}
        </div>
        <div
            class="selector_container"
            @click="openDropdown"
        >
            <div class="selector_container_selected">
                <template
                    v-for="selectedItem in selectedItems"
                    :key="selectedItem.id"
                >
                    <div class="selector_tag">
                        <slot
                            :item="selectedItem"
                            name="remove"
                        />
                        <button
                            class="selector_tag_remove"
                            type="button"
                            @click.stop="removeItem(selectedItem)"
                        >
                            ×
                        </button>
                    </div>
                </template>
            </div>
            <div class="selector_input_wrapper">
                <button
                    class="selector_toggle"
                    type="button"
                    @click.stop="toggleDropdown"
                    @mousedown.prevent
                >
                    <icon
                        class="selector_icon"
                        name="material-symbols:arrow-drop-down"
                        :size="20"
                    />
                </button>
                <input
                    ref="searchText"
                    v-model="searchText"
                    class="selector_input"
                    :placeholder="selectedItems.length === 0 ? 'Search or click to select...' : ''"
                    type="text"
                    @blur="onBlur"
                    @focus="openDropdown"
                >
            </div>
        </div>
        <div
            v-if="(searchText.length >= 1 || showAll) && (searchEntries?.length || showAll)"
            class="selector_select"
        >
            <div class="selector_select_centerbox">
                <template
                    v-for="option in showAll ? leftEntries : searchEntries"
                    :key="option.id"
                >
                    <div
                        class="selector_select_item"
                        @click="addItem(option)"
                    >
                        <div class="selector_select_item_content">
                            <slot
                                :item="option"
                                name="add"
                            />
                        </div>
                        <div class="selector_select_item_add">+</div>
                    </div>
                </template>
                <div
                    v-if="searchEntries?.length === 0 && !showAll"
                    class="selector_select_empty"
                >
                    Nothing found
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts" generic="T extends { id: string, name: string }">
import type { PropType } from 'vue';

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

const propsPath = toRef(() => props.path);
const { data: allEntries, refresh: refreshEntries } = useFetch<T[]>(propsPath);
watch(propsPath, () => refreshEntries());
const leftEntries = computed(() => allEntries.value?.filter(e => !selectedItems.value?.some(s => s.id === e.id)));
const searchText = ref('');
const searchTextRef = useTemplateRef('searchText');
const selectorRoot = useTemplateRef('selectorRoot');
const searchEntries = computed(() => leftEntries.value?.filter(e => e.name.toLowerCase().startsWith(searchText.value.toLowerCase()) || e.name.includes(searchText.value)));
const showAll = ref(false);
const blurTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

function clearBlurTimeout() {
    if (blurTimeout.value) {
        clearTimeout(blurTimeout.value);
        blurTimeout.value = null;
    }
}

function openDropdown() {
    clearBlurTimeout();
    searchTextRef.value?.focus();
}

function toggleDropdown() {
    clearBlurTimeout();
    showAll.value = !showAll.value;
    if (showAll.value) {
        searchTextRef.value?.focus();
    }
}

function addItem(c: T) {
    if (props.one) {
        selectedItems.value = [c];
        showAll.value = false;
    }
    else {
        selectedItems.value.push(c);
    }
    searchText.value = '';
}

function removeItem(c: T) {
    if (!selectedItems.value) return;
    const idx = selectedItems.value.findIndex(e => e.id === c.id);
    if (idx !== -1) selectedItems.value.splice(idx, 1);
}

function onBlur(event: FocusEvent) {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && selectorRoot.value?.contains(nextTarget)) {
        return;
    }

    blurTimeout.value = setTimeout(() => {
        showAll.value = false;
        blurTimeout.value = null;
    }, 150);
}
</script>

<style scoped lang="scss">
.selector {
    width: 100%;

    &_label {
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
        color: $typographyPrimary;

        @include mobile {
            font-size: 10px;
        }
    }

    &_container {
        cursor: text;

        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;

        padding: 10px 14px;
        border: 1px solid $lightgray150;
        border-radius: 8px;

        background: $darkgray900;

        transition: all 0.2s ease;

        @include hover {
            &:hover {
                border-color: $lightgray125;
                background: $darkgray850;
            }
        }

        &:focus-within {
            border-color: $primary500;
            box-shadow: 0 0 0 3px $primary500;
        }

        &_selected {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
    }

    &_tag {
        display: flex;
        gap: 6px;
        align-items: center;

        padding: 4px 10px;
        border-radius: 6px;

        font-size: 12px;
        font-weight: 500;
        color: white;
        white-space: nowrap;

        background: $primary500;

        &_remove {
            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            width: 18px;
            height: 18px;
            border: none;
            border-radius: 4px;

            font-size: 16px;
            font-weight: 300;
            color: white;

            background: rgb(255 255 255 / 20%);

            transition: background 0.2s;

            &:hover {
                background: rgb(255 255 255 / 30%);
            }
        }
    }

    &_input_wrapper {
        display: flex;
        flex: 1;
        gap: 8px;
        align-items: center;

        min-width: 120px;
    }

    &_icon {
        flex-shrink: 0;
        color: $typographyPrimary;
    }

    &_toggle {
        cursor: pointer;

        display: inline-flex;
        align-items: center;
        justify-content: center;

        padding: 0;
        border: none;

        color: $typographyPrimary;

        background: transparent;
    }

    &_input {
        flex: 1;

        min-width: 80px;
        border: none;

        font-size: 14px;
        color: $typographyPrimary;

        background: none;

        &::placeholder {
            color: $lightgray400;
        }

        &:focus {
            outline: none;
        }
    }

    &_select {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        align-items: stretch;

        width: 100%;
        max-height: 240px;
        margin-top: 4px;
        border: 1px solid $lightgray150;
        border-radius: 8px;

        background: $darkgray900;
        box-shadow: 0 4px 12px rgb(0 0 0 / 20%);

        &_centerbox {
            display: flex;
            flex-direction: column;
            gap: 0;
            align-items: stretch;

            width: 100%;
        }

        &_item {
            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: space-between;

            padding: 10px 12px;
            border-bottom: 1px solid $darkgray850;

            transition: background 0.15s ease;

            &:last-child {
                border-bottom: none;
            }

            @include hover {
                &:hover {
                    background: $darkgray850;
                }
            }

            &_content {
                flex: 1;
                font-size: 13px;
                color: $typographyPrimary;
            }

            &_add {
                display: flex;
                align-items: center;
                justify-content: center;

                width: 24px;
                height: 24px;
                border-radius: 4px;

                font-size: 16px;
                font-weight: 300;
                color: white;

                opacity: 0;
                background: $primary500;

                transition: opacity 0.15s ease;
            }

            @include hover {
                &:hover .selector_select_item_add {
                    opacity: 1;
                }
            }
        }

        &_empty {
            padding: 16px;
            font-size: 13px;
            color: $lightgray400;
            text-align: center;
        }
    }

    &--focused .input_container {
        border-color: $primary500;
    }
}
</style>
