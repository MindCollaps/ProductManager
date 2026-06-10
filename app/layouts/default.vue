<template>
    <div class="app">
        <div
            class="header"
        >
            <div class="header-text">
                Manager
            </div>
            <view-menu/>
            <view-login/>
        </div>
        <div class="app_content">
            <nuxt-loading-indicator :color="colorsList.primary300"/>
            <slot/>
        </div>
        <common-toast-container/>
        <view-version/>
        <changelog-popup/>
    </div>
</template>

<script setup lang="ts">
import ViewMenu from '~/components/view/ViewMenu.vue';
import ViewLogin from '~/components/view/ViewLogin.vue';
import ViewVersion from '~/components/view/ViewVersion.vue';
import ChangelogPopup from '~/components/common/CommonChangelogPopup.vue';
import { colorsList } from '#imports';
import type { WebUser } from '~~/types/user';
import { useStore } from '~/store';

defineSlots<{ default: () => any }>();

const store = useStore();
store.fetchMe();

useLayout();
</script>

<style lang="scss">
@use "~/scss/layout";
</style>

<style scoped lang="scss">
.header {
    position: sticky;

    display: grid;
    grid-template-columns: 0.5fr 2fr 15px 0.3fr;
    gap: 12px;
    align-items: center;

    width: 100%;
    padding: 9px;

    background: $darkgray1000;

    &-text {
        display: flex;
        align-items: center;
        justify-content: start;

        margin-left: 24px;

        font-size: 24px;
    }

    &-container {
        display: flex;
        gap: 100px;
        align-items: center;
    }
}
</style>
