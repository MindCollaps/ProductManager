<template>
    <div class="notification-wrapper">
        <ui-button
            type="secondary"
            @click="toggleNotifications()"
        >
            <div class="notification-indicator">
                <Icon name="material-symbols:notifications-rounded"/>
                <span
                    v-if="store.notificationUnreadCount > 0"
                    class="notification-indicator_count"
                >
                    {{ store.notificationUnreadCount > 99 ? '99+' : store.notificationUnreadCount }}
                </span>
            </div>
        </ui-button>

        <div
            v-if="showNotifications"
            class="notification-panel"
        >
            <div class="notification-panel_header">
                <div class="notification-panel_title">Notifications</div>
                <div class="notification-panel_actions">
                    <ui-button
                        size="S"
                        type="secondary"
                        @click="markAllAsRead()"
                    >
                        Mark All Read
                    </ui-button>
                    <ui-button
                        size="S"
                        type="secondary"
                        @click="deleteReadNotifications()"
                    >
                        Delete Read
                    </ui-button>
                </div>
            </div>
            <div
                v-if="notifications.length === 0"
                class="notification-panel_empty"
            >
                Keine Notifications
            </div>
            <div
                v-else
                class="notification-panel_list"
            >
                <ui-button
                    v-for="notification in notifications"
                    :key="notification.id"
                    text-align="left"
                    type="secondary"
                    width="100%"
                    @click="openNotification(notification)"
                >
                    <div class="notification-item">
                        <div class="notification-item_top">
                            <div class="notification-item_subject">{{ notification.subject }}</div>
                            <button
                                class="notification-item_delete"
                                type="button"
                                @click.stop="deleteNotification(notification.id)"
                            >
                                <Icon name="material-symbols:delete-outline"/>
                            </button>
                        </div>
                        <div class="notification-item_body">{{ notification.body }}</div>
                        <div class="notification-item_meta">
                            <span
                                v-if="notification.status === 'PENDING'"
                                class="notification-item_new"
                            >NEW</span>
                            {{ formatTime(notification.createdAt) }}
                        </div>
                    </div>
                </ui-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { WebNotification } from '~~/types/user';

import { useSocketClient } from '~/composables/socketClient';
import { useStore } from '~/store';

const store = useStore();
const socket = useSocketClient();
const showNotifications = ref(false);
const notifications = ref<WebNotification[]>([]);

async function toggleNotifications() {
    showNotifications.value = !showNotifications.value;

    if (showNotifications.value) {
        await loadNotifications();
    }
}

async function loadNotifications() {
    notifications.value = await $fetch<WebNotification[]>('/api/v1/user/notification');
}

async function openNotification(notification: WebNotification) {
    if (notification.status === 'PENDING') {
        await $fetch(`/api/v1/user/notification/${ notification.id }`, {
            method: 'PUT',
        });
    }

    socket?.emit('notification:sync');
    showNotifications.value = false;

    if (notification.messageChannelId && notification.requestId) {
        await navigateTo(`/chat/room/${ notification.requestId }`);
        return;
    }

    if (notification.requestId) {
        await navigateTo(`/request/${ notification.requestId }`);
        return;
    }

    await navigateTo('/profile');
}

async function deleteNotification(notificationId: string) {
    await $fetch(`/api/v1/user/notification/${ notificationId }`, {
        method: 'DELETE',
    });

    notifications.value = notifications.value.filter(item => item.id !== notificationId);
    socket?.emit('notification:sync');
}

async function deleteReadNotifications() {
    await $fetch('/api/v1/user/notification', {
        method: 'DELETE',
    });

    notifications.value = notifications.value.filter(item => item.status === 'PENDING');
    socket?.emit('notification:sync');
}

async function markAllAsRead() {
    await $fetch('/api/v1/user/notification', {
        method: 'PUT',
    });

    notifications.value = notifications.value.map(item => {
        if (item.status !== 'PENDING') {
            return item;
        }

        return {
            ...item,
            status: 'SENT',
        };
    });

    socket?.emit('notification:sync');
}

function formatTime(value: string) {
    return new Date(value).toLocaleString();
}
</script>

<style scoped lang="scss">
.notification-wrapper {
    position: relative;
}

.notification-indicator {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 22px;
    height: 22px;
    border-radius: 50%;

    color: $lightgray0;

    background: $warning600;

    &_count {
        position: absolute;
        top: -6px;
        right: -8px;

        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9px;

        font-size: 10px;
        font-weight: 700;
        line-height: 18px;
        color: $lightgray0;
        text-align: center;

        background: $error500;
    }
}

.notification-panel {
    position: absolute;
    z-index: 50;
    top: calc(100% + 8px);
    right: 0;

    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 320px;
    max-height: 420px;
    border: 1px solid $lightgray125;
    border-radius: 8px;

    background: $darkgray900;

    &_title {
        font-size: 13px;
        font-weight: 700;
        color: $typographyPrimary;
    }

    &_header {
        display: flex;
        flex-shrink: 0;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        padding: 12px 12px 10px;
        border-bottom: 1px solid $darkgray700;
    }

    &_actions {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    &_list {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 10px 12px 12px;
    }

    &_empty {
        padding: 12px;
        font-size: 12px;
        color: $typographyPrimary;
    }
}

.notification-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    width: 100%;

    text-align: left;

    &_subject {
        font-size: 13px;
        font-weight: 700;
    }

    &_top {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
    }

    &_delete {
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: center;

        border: none;

        color: $lightgray150;

        background: transparent;
    }

    &_body {
        font-size: 12px;
        color: $typographyPrimary;
        word-break: break-word;
        white-space: normal;
    }

    &_meta {
        display: flex;
        gap: 6px;
        align-items: center;

        font-size: 11px;
        color: $lightgray300;
    }

    &_new {
        padding: 0 6px;
        border-radius: 8px;

        font-size: 10px;
        font-weight: 700;
        color: $lightgray0;

        background: $warning600;
    }
}
</style>
