<template>
    <common-page :title="params.title">
        <template #actions>
            <ui-button @click="router.push(params.onCreate)">Erstellen</ui-button>
        </template>
        <div
            v-if="params.entries.length > 0"
            class="parameters-list"
        >
            <div
                v-for="(e, index) in params.entries"
                :key="index"
                class="parameters-entry-container"
            >
                <div class="parameters-entry">
                    <div
                        v-for="f in e.fields"
                        :key="f.label"
                        class="parameters-entry-field"
                    >
                        <template v-if="f.type === 'text'">
                            {{ f.label }}: {{ f.value }}
                        </template>
                        <div
                            v-if="f.type === 'icon'"
                            class="parameters-entry-field-icon"
                        >
                            <Icon
                                v-if="f.value"
                                :name="f.value as string"
                                size="18"
                            />
                            <span
                                v-else
                                class="parameters-entry-field-icon-empty"
                            >—</span>
                        </div>
                        <div
                            v-if="f.type === 'category'"
                            class="parameters-entry-field-categories"
                        >
                            <common-category
                                v-for="c in f.value as DeviceCategory[]"
                                :key="c.id"
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
                    ><template #icon><Icon name="material-symbols:edit"/></template></ui-button>
                    <ui-button
                        v-if="pendingDeleteIndex === index"
                        class="parameters-delete-confirm-btn"
                        primary-color="error600"
                        size="S"
                        @click="handleDeleteClick(index, e.onDelete)"
                    >Löschen?</ui-button>
                    <ui-button
                        v-else
                        primary-color="error700"
                        @click="handleDeleteClick(index, e.onDelete)"
                    ><template #icon><Icon name="material-symbols:delete"/></template></ui-button>
                </div>
            </div>
        </div>
        <div
            v-else
            class="parameters-empty"
        >
            <span class="parameters-empty-title">Noch keine Einträge vorhanden.</span>
            <span class="parameters-empty-hint">Klicke auf „Erstellen", um loszulegen.</span>
        </div>
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

const pendingDeleteIndex = ref<number | null>(null);
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

function handleDeleteClick(index: number, onDelete: () => void) {
    if (pendingDeleteIndex.value === index) {
        onDelete();
        cancelPending();
    }
    else {
        if (pendingTimer) clearTimeout(pendingTimer);
        pendingDeleteIndex.value = index;
        pendingTimer = setTimeout(cancelPending, 3000);
    }
}

function cancelPending() {
    pendingDeleteIndex.value = null;
    if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
    }
}

onUnmounted(() => {
    if (pendingTimer) clearTimeout(pendingTimer);
});
</script>

<style lang="scss" scoped>
.parameters-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
    align-content: start;

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
    min-width: 0;

    &-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
        justify-content: space-between;

        padding: 16px;
        border-radius: 8px;

        background: $darkgray900;
    }

    &-buttons {
        display: flex;
        flex-direction: row;
        gap: 8px;
        justify-content: space-between;

        width: 100%;
        padding: 4px;
    }

    &-field {
        overflow: hidden;

        width: 100%;
        min-width: 0;

        text-overflow: ellipsis;
        white-space: nowrap;

        &-icon {
            display: flex;
            align-items: center;
            color: $lightgray300;

            &-empty {
                color: $darkgray600;
            }
        }

        &-categories {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            justify-content: start;
        }
    }
}

.parameters-delete-confirm-btn {
    animation: confirm-appear 0.12s ease-out;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
}

@keyframes confirm-appear {
    from {
        transform: scale(0.82);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.parameters-empty {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;

    width: 100%;
    padding: 48px 16px;

    &-title {
        font-size: 13px;
        font-weight: 600;
        color: $lightgray400;
    }

    &-hint {
        font-size: 12px;
        color: $darkgray600;
    }
}
</style>
