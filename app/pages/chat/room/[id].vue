<template>
    <common-page :title="`Chat · ${ repairReq?.subject }`">
        <div class="chat-room">
            <div class="chat-room_messages">
                <div
                    v-if="isJoining"
                    class="chat-room_state"
                >
                    Verbinde mit dem Chat...
                </div>

                <div
                    v-else-if="messages.length === 0"
                    class="chat-room_state"
                >
                    Noch keine Nachrichten
                </div>

                <div
                    v-for="message in messages"
                    :key="message.id"
                    class="chat-room_message"
                    :class="{
                        'chat-room_message--own': message.sender?.id === store.me?.id,
                        'chat-room_message--system': message.isInternal && !message.sender,
                    }"
                >
                    <div class="chat-room_message-meta">
                        <span>{{ message.isInternal && !message.sender ? 'System' : (message.sender?.username ?? 'Unknown') }}</span>
                        <span>{{ formatTimestamp(message.createdAt) }}</span>
                    </div>
                    <div class="chat-room_message-content">
                        {{ message.content }}
                    </div>
                </div>
            </div>

            <div class="chat-room_input">
                <ui-text-area
                    v-model="newMessage"
                    :disabled="isJoining || isSending"
                    :input-attrs="{ rows: 3 }"
                    placeholder="Nachricht schreiben..."
                    @keyup.enter="sendMessage()"
                />
                <ui-button
                    :disabled="!canSend"
                    @click="sendMessage()"
                >
                    Senden
                </ui-button>
            </div>
        </div>
    </common-page>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~~/types/socket';
import type { RepairRequestWithRelationsType } from '~~/types/req';
import { ToastMode } from '~~/types/toast';

import { useSocketClient } from '~/composables/socketClient';
import { useToastManager } from '~/composables/toastManager';
import { useStore } from '~/store';

const route = useRoute();
const requestId = String(route.params.id);
const { data: repairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/staff/request/${ requestId }`);
const store = useStore();
const { showToast } = useToastManager();

const socket = useSocketClient();

const newMessage = ref('');
const isJoining = ref(true);
const isSending = ref(false);
const messages = ref<ChatMessage[]>([]);

const canSend = computed(() => {
    return !isJoining.value &&
        !isSending.value &&
        newMessage.value.trim().length > 0 &&
        newMessage.value.trim().length <= 2000;
});

onMounted(async () => {
    if (!socket) {
        showToast({
            mode: ToastMode.Error,
            message: 'Websocket connection unavailable',
        });
        await navigateTo('/request');
        return;
    }

    socket.on('chat:message', onChatMessage);

    socket.emit('chat:join', { requestId }, async response => {
        if (!response.ok) {
            showToast({
                mode: ToastMode.Error,
                message: response.error ?? 'Unable to join chat room',
            });

            await navigateTo('/request');
            return;
        }

        messages.value = response.messages ?? [];
        isJoining.value = false;
    });
});

onBeforeUnmount(() => {
    if (!socket) {
        return;
    }

    socket.emit('chat:leave', { requestId });
    socket.off('chat:message', onChatMessage);
});

async function sendMessage() {
    if (!socket || !canSend.value) {
        return;
    }

    const content = newMessage.value.trim();

    isSending.value = true;
    socket.emit('chat:send', { requestId, content }, response => {
        if (!response.ok) {
            showToast({
                mode: ToastMode.Error,
                message: response.error ?? 'Message could not be sent',
            });
        }
        else {
            newMessage.value = '';
        }

        isSending.value = false;
    });
}

function onChatMessage(payload: { requestId: string; message: ChatMessage }) {
    if (payload.requestId !== requestId) {
        return;
    }

    messages.value.push(payload.message);
}

function formatTimestamp(value: string) {
    return new Date(value).toLocaleString();
}
</script>

<style scoped lang="scss">
.chat-room {
    display: flex;
    flex-direction: column;
    gap: 16px;

    width: 100%;
    max-width: 980px;
    margin: 0 auto;
    padding: 16px;
    border-radius: 8px;

    background: $darkgray900;

    &_messages {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;

        max-height: 60vh;
        padding: 8px;
        border-radius: 8px;

        background: $darkgray1000;
    }

    &_state {
        padding: 16px;
        color: $lightgray400;
        text-align: center;
    }

    &_message {
        display: flex;
        flex-direction: column;
        gap: 8px;

        max-width: 80%;
        padding: 12px;
        border-radius: 8px;

        background: $darkgray800;

        &--own {
            align-self: flex-end;
            background: $primary700;
        }

        &--system {
            align-self: center;
            max-width: 100%;
            border: 1px solid $lightgray400;
            background: $darkgray700;
        }

        &-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: $lightgray400;
        }

        &-content {
            word-break: break-word;
            white-space: pre-wrap;
        }
    }

    &_input {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
}
</style>
