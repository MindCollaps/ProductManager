<template>
    <div
        ref="wrapperRef"
        class="notification-wrapper"
    >
        <ui-button
            :aria-expanded="showNotifications"
            aria-haspopup="true"
            type="secondary"
            @click="toggleNotifications()"
        >
            <div class="notification-indicator">
                <Icon name="material-symbols:notifications-rounded"/>
                <span
                    v-if="store.notificationUnreadCount > 0"
                    :aria-label="`${ store.notificationUnreadCount > 99 ? '99+' : store.notificationUnreadCount } unread notifications`"
                    aria-live="polite"
                    class="notification-indicator_count"
                >
                    {{ store.notificationUnreadCount > 99 ? '99+' : store.notificationUnreadCount }}
                </span>
            </div>
        </ui-button>

        <div
            v-show="showNotifications"
            aria-label="Notifications"
            class="notification-panel"
            role="region"
        >
            <div class="notification-panel_header">
                <div class="notification-panel_title">Notifications</div>
                <div class="notification-panel_actions">
                    <ui-button
                        :disabled="bulkBusy"
                        size="S"
                        type="secondary"
                        @click="markAllAsRead()"
                    >
                        Mark All Read
                    </ui-button>
                    <ui-button
                        :disabled="bulkBusy"
                        size="S"
                        type="secondary"
                        @click="deleteReadNotifications()"
                    >
                        Delete Read
                    </ui-button>
                </div>
            </div>

            <div
                v-if="loading"
                class="notification-panel_loading"
            >
                <ui-loader small/>
            </div>
            <div
                v-else-if="notifications.length === 0"
                class="notification-panel_empty"
            >
                Keine Benachrichtigungen
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
                            <div
                                class="notification-item_subject"
                                :class="{ 'notification-item_subject--read': notification.status !== 'PENDING' }"
                            >
                                {{ notification.subject }}
                            </div>
                            <div class="notification-item_top-right">
                                <span
                                    v-if="notification.status === 'PENDING'"
                                    class="notification-item_new"
                                >NEW</span>
                                <button
                                    aria-label="Delete notification"
                                    class="notification-item_delete"
                                    type="button"
                                    @click.stop="deleteNotification(notification.id)"
                                >
                                    <Icon name="material-symbols:delete-outline"/>
                                </button>
                            </div>
                        </div>
                        <div class="notification-item_body">{{ notification.body }}</div>
                        <div class="notification-item_meta">{{ formatTime(notification.createdAt) }}</div>
                    </div>
                </ui-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onClickOutside, useEventListener } from '@vueuse/core';
import type { WebNotification } from '~~/types/user';
import { ToastMode } from '~~/types/toast';
import { useSocketClient } from '~/composables/socketClient';
import { useToastManager } from '~/composables/toastManager';
import { useStore } from '~/store';

const store = useStore();
const socket = useSocketClient();
const { showToast } = useToastManager();
const showNotifications = ref(false);
const loading = ref(false);
const bulkBusy = ref(false);
const notifications = ref<WebNotification[]>([]);
const wrapperRef = ref<HTMLElement | null>(null);
const deletingIds = new Set<string>();

onClickOutside(wrapperRef, () => {
    showNotifications.value = false;
});

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showNotifications.value) {
        showNotifications.value = false;
    }
});

async function toggleNotifications() {
    showNotifications.value = !showNotifications.value;

    if (showNotifications.value) {
        await loadNotifications();
    }
}

async function loadNotifications() {
    if (loading.value) return;
    loading.value = true;
    try {
        notifications.value = await $fetch<WebNotification[]>('/api/v1/user/notification');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Notifications could not be loaded.' });
    }
    finally {
        loading.value = false;
    }
}

async function openNotification(notification: WebNotification) {
    if (notification.status === 'PENDING') {
        try {
            await $fetch(`/api/v1/user/notification/${ notification.id }`, { method: 'PUT' });
        }
        catch {
            showToast({ mode: ToastMode.Error, message: 'Could not mark notification as read.' });
        }
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
    if (deletingIds.has(notificationId)) return;
    deletingIds.add(notificationId);
    try {
        await $fetch(`/api/v1/user/notification/${ notificationId }`, { method: 'DELETE' });
        notifications.value = notifications.value.filter(item => item.id !== notificationId);
        socket?.emit('notification:sync');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Could not delete notification.' });
    }
    finally {
        deletingIds.delete(notificationId);
    }
}

async function deleteReadNotifications() {
    if (bulkBusy.value) return;
    bulkBusy.value = true;
    try {
        await $fetch('/api/v1/user/notification', { method: 'DELETE' });
        notifications.value = notifications.value.filter(item => item.status === 'PENDING');
        socket?.emit('notification:sync');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Could not delete read notifications.' });
    }
    finally {
        bulkBusy.value = false;
    }
}

async function markAllAsRead() {
    if (bulkBusy.value) return;
    bulkBusy.value = true;
    try {
        await $fetch('/api/v1/user/notification', { method: 'PUT' });
        notifications.value = notifications.value.map(item => item.status === 'PENDING' ? { ...item, status: 'SENT' } : item);
        socket?.emit('notification:sync');
    }
    catch {
        showToast({ mode: ToastMode.Error, message: 'Could not mark notifications as read.' });
    }
    finally {
        bulkBusy.value = false;
    }
}

function formatTime(value: string) {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60_000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${ minutes }m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${ hours }h ago`;

    return date.toLocaleDateString('de-DE');
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

    background: $primary600;

    &_count {
        position: absolute;
        top: -6px;
        right: -8px;

        min-width: 18px;
        height: 18px;
        padding: 0 4px;
        border-radius: 9999px;

        font-size: 10px;
        font-weight: 700;
        line-height: 18px;
        color: $lightgray0;
        text-align: center;

        background: $primary500;
    }
}

.notification-panel {
    position: absolute;
    z-index: 60;
    top: calc(100% + 8px);
    right: 0;

    overflow: hidden;
    display: flex;
    flex-direction: column;

    width: 320px;
    max-height: 420px;
    border: 1px solid $darkgray700;
    border-radius: 8px;

    background: $darkgray900;
    box-shadow: 0 8px 24px rgb(0 0 0 / 30%), 0 2px 6px rgb(0 0 0 / 15%);

    animation: notification-drop-in 160ms cubic-bezier(0.25, 1, 0.5, 1) both;

    &_title {
        font-size: 13px;
        font-weight: 700;
        color: $lightgray150;
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

    &_loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    &_list {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;

        padding: 10px 12px 12px;
    }

    &_empty {
        padding: 24px 16px;
        font-size: 12px;
        color: $lightgray400;
        text-align: center;
    }

    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }
}

.notification-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    width: 100%;

    text-align: left;

    &_subject {
        overflow: hidden;

        min-width: 0;

        font-size: 13px;
        font-weight: 700;
        color: $lightgray150;
        text-overflow: ellipsis;
        white-space: nowrap;

        &--read {
            font-weight: 400;
            color: $lightgray400;
        }
    }

    &_top {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
    }

    &_top-right {
        display: flex;
        flex-shrink: 0;
        gap: 6px;
        align-items: center;
    }

    &_delete {
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: center;

        padding: 2px;
        border: none;
        border-radius: 4px;

        color: $lightgray400;

        background: transparent;
        outline: none;

        transition: color 0.15s ease-out;

        @include pc {
            &:hover {
                color: $error500;
            }
        }

        &:focus-visible {
            outline: 2px solid $primary500;
            outline-offset: 1px;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }

    &_body {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;

        font-size: 12px;
        color: $lightgray300;
        overflow-wrap: break-word;
    }

    &_meta {
        font-size: 11px;
        color: $lightgray400;
    }

    &_new {
        padding: 0 6px;
        border-radius: 4px;

        font-size: 10px;
        font-weight: 700;
        line-height: 18px;
        color: $lightgray0;

        background: $primary600;
    }
}

@keyframes notification-drop-in {
    from {
        transform: translateY(-6px);
        opacity: 0;
    }

    to {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
