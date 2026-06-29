<template>
    <div class="colorpicker-container">
        <div
            v-if="$slots.default"
            class="colorpicker_label"
        >
            <slot/>
        </div>
        <div class="colorpicker_control">
            <input
                v-model="color"
                class="colorpicker"
                type="color"
            >
            <ui-input-text v-model="color"/>
        </div>
    </div>
</template>

<script lang="ts" setup>
defineSlots<{ default?: () => string }>();

const color = defineModel<string>({
    type: String,
    default: () => '',
});
</script>

<style lang="scss" scoped>
.colorpicker {
    width: 120px;
    padding: 1px;
    border: 0;

    background: transparent;
    outline: 0;

    &-container {
        display: flex;
        flex-direction: column;
    }

    &_control {
        display: flex;
        gap: 16px;
        align-items: center;
    }

    &_label {
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;

        @include mobile {
            font-size: 10px;
        }
    }
}
</style>
