<template>
    <div
        ref="menuRef"
        class="header__menu"
    >
        <div
            v-for="button in headerMenu"
            :key="button.text"
            class="header__menu_btn-wrapper"
        >
            <ui-button
                :aria-expanded="button.children ? openDropdown === button.text : undefined"
                :aria-haspopup="button.children ? 'true' : undefined"
                class="header__menu_btn-container"
                :class="{ 'header__menu_btn-container--open': button.children && openDropdown === button.text }"
                :disabled="button.disabled"
                :tag="button.children ? 'button' : undefined"
                :to="button.children ? undefined : button.path"
                :type="button.active ? 'primary' : 'secondary'"
                :width="button.width"
                @click="button.children ? toggleDropdown(button.text) : button.action?.()"
                @keydown.escape.stop="closeAll"
            >
                <template
                    v-if="button.icon"
                    #icon
                >
                    <Icon :name="button.icon"/>
                </template>
                <div class="header__menu_btn">
                    <span class="header__menu_btn_text">{{ button.text }}</span>
                    <span
                        v-if="button.children"
                        aria-hidden="true"
                        class="header__menu_btn_chevron"
                    >
                        <Icon
                            class="header__menu_btn_chevron_icon"
                            :class="{ 'header__menu_btn_chevron_icon--open': openDropdown === button.text }"
                            name="material-symbols:arrow-drop-down-rounded"
                        />
                    </span>
                </div>
            </ui-button>

            <transition name="dropdown">
                <div
                    v-if="button.children && openDropdown === button.text"
                    class="header__menu_dropdown"
                >
                    <ui-button
                        v-for="child in button.children"
                        :key="child.text"
                        :disabled="child.disabled"
                        :to="child.path"
                        :type="child.active ? 'primary' : 'secondary'"
                        @click="child.action?.(); closeAll()"
                        @keydown.escape.stop="closeAll"
                    >
                        <template
                            v-if="child.icon"
                            #icon
                        >
                            <Icon :name="child.icon"/>
                        </template>
                        {{ child.text }}
                    </ui-button>
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useHeaderMenu } from '~/composables/navigation';

const headerMenu = computed(() => {
    const menu = useHeaderMenu();
    return menu.value.filter(x => !(x.hide ?? false));
});

const openDropdown = ref<string | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const route = useRoute();

function toggleDropdown(key: string) {
    openDropdown.value = openDropdown.value === key ? null : key;
}

function closeAll() {
    openDropdown.value = null;
}

function onDocumentClick(event: MouseEvent) {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
        closeAll();
    }
}

watch(() => route.path, closeAll);

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick);
});
</script>

<style scoped lang="scss">
.header__menu {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: center;

    &_btn-wrapper {
        position: relative;
    }

    &_btn-container {
        position: relative;

        &--open {
            border-bottom-right-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
            background: $darkgray875 !important;
        }
    }

    &_btn {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;

        width: 100%;

        text-align: left;

        &_text {
            overflow: hidden;
            flex: 1;

            min-width: 0;

            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &_chevron {
            display: flex;
            flex-shrink: 0;

            &_icon {
                width: 20px;

                &--open {
                    transform: rotate(180deg);
                }

                @media (prefers-reduced-motion: reduce) {
                    transition: none;
                }

                @include pc {
                    transition: transform 0.2s ease;
                }
            }
        }
    }

    &_dropdown {
        position: absolute;
        z-index: 10;
        top: calc(100% - 1px);
        left: 0;

        display: flex;
        flex-direction: column;
        gap: 8px;

        min-width: max(100%, 160px);
        padding: 8px;
        border-bottom-right-radius: 8px;
        border-bottom-left-radius: 8px;

        background: $darkgray875;
    }
}

.dropdown-enter-active,
.dropdown-leave-active {
    transition: opacity 0.15s ease-out, transform 0.15s ease-out;

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}

.dropdown-enter-from,
.dropdown-leave-to {
    transform: translateY(-4px);
    opacity: 0;
}
</style>
