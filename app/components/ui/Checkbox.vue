<template>
    <div
        :aria-checked="checked"
        class="checkbox"
        :class="{ 'checkbox--checked': checked, 'checkbox--revert': revert }"
        role="checkbox"
        tabindex="0"
        @click="toggle"
        @keydown.enter.prevent="toggle"
        @keydown.space.prevent="toggle"
    >
        <div class="checkbox_icon">
            <Icon
                v-if="checked"
                name="material-symbols:check-rounded"
            />
        </div>
        <div class="checkbox_text">
            <slot/>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    revert: {
        type: Boolean,
        default: false,
    },
});

defineSlots<{ default: () => any }>();

const checked = defineModel({ type: Boolean, required: true });

function toggle() {
    checked.value = !checked.value;
}
</script>

<style scoped lang="scss">
.checkbox {
    cursor: pointer;
    user-select: none;

    display: flex;
    gap: 16px;
    align-items: center;

    font-family: $defaultFont;
    font-size: 12px;
    font-weight: 600;
    line-height: 100%;

    &--revert {
        flex-direction: row-reverse;
    }

    &:focus-visible {
        border-radius: 4px;
        outline: 2px solid $primary500;
        outline-offset: 3px;
    }

    &_icon {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 16px;
        height: 16px;
        border: 1px solid $lightgray100;
        border-radius: 4px;

        transition: background 0.15s cubic-bezier(0.25, 1, 0.5, 1), border-color 0.15s cubic-bezier(0.25, 1, 0.5, 1);

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    &--checked .checkbox {
        &_icon {
            border-color: $primary500;
            background: $primary500;

            svg {
                color: $lightgray150Orig;
                animation: checkmark-appear 0.15s cubic-bezier(0.25, 1, 0.5, 1) both;

                @media (prefers-reduced-motion: reduce) {
                    animation: none;
                }
            }
        }
    }

    @keyframes checkmark-appear {
        from {
            transform: scale(0);
            opacity: 0;
        }

        to {
            transform: scale(1);
            opacity: 1;
        }
    }
}
</style>
