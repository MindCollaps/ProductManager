<template>
    <div
        class="labeled_text"
        :class="{ 'input--focused': focused }"
    >
        <div
            class="labeled_text_label"
        >
            <slot/>
        </div>
        <div
            class="labeled_text_container"
        >
            <label class="labeled_text__text">
                <Icon
                    v-if="icon"
                    class="labeled_text__text_icon"
                    :name="icon"
                />
                {{ compValue }}
            </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
    icon: {
        type: String,
    },
    value: {
        type: String as PropType<string | undefined | null>,
    },
});

defineSlots<{ default?: () => string }>();

const focused = defineModel('focused', { type: Boolean });
const compValue = computed(() => {
    if (props.value) {
        if (props.value.length > 0) {
            return props.value;
        }
    }
    return '—';
});
</script>

<style scoped lang="scss">
.labeled_text {
    width: 100%;

    &_label {
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
    }

    &_container {
        display: flex;
        gap: 16px;
        align-items: center;

        width: 100%;
        padding: 8px 16px;
        border: 2px solid transparent;
        border-radius: 8px;

        background: $darkgray950;

        transition: 0.3s;

        @include hover {
            &:hover {
                border-color: $darkgray800;
            }
        }
    }

    &__text {
        display: flex;
        gap: 12px;
        align-items: center;
        width: 100%;
    }
}
</style>
