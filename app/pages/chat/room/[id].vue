<template>
    <div class="chat-room">
        <div class="chat-room_context">
            <ui-button
                class="chat-room_back"
                size="S"
                :to="`/staff/request/${ requestId }`"
                type="link"
            >
                <template #icon>
                    <Icon name="material-symbols:arrow-back-rounded"/>
                </template>
                Zurück
            </ui-button>
            <div class="chat-room_context-info">
                <span class="chat-room_context-subject">{{ repairReq?.subject ?? '…' }}</span>
                <template v-if="customerName">
                    <span class="chat-room_context-sep">·</span>
                    <span class="chat-room_context-customer">{{ customerName }}</span>
                </template>
            </div>
        </div>

        <div
            ref="scrollContainer"
            aria-label="Chat-Nachrichten"
            class="chat-room_messages"
            role="log"
        >
            <div
                v-if="isJoining"
                class="chat-room_state"
            >
                Verbinde mit dem Chat…
            </div>

            <div
                v-else-if="messages.length === 0"
                class="chat-room_state"
            >
                Noch keine Nachrichten
            </div>

            <template v-else>
                <div
                    aria-hidden="true"
                    class="chat-room_messages-spacer"
                />

                <div
                    v-for="(message, index) in messages"
                    :key="message.id"
                    class="chat-room_message"
                    :class="{
                        'chat-room_message--own': isOwnMessage(message),
                        'chat-room_message--system': isSystemMessage(message),
                        'chat-room_message--grouped': isGrouped(index),
                    }"
                >
                    <div
                        v-if="!isGrouped(index)"
                        class="chat-room_message-meta"
                    >
                        <span class="chat-room_message-meta-author">{{ messageAuthor(message) }}</span>
                        <span class="chat-room_message-meta-time">{{ formatTimestamp(message.createdAt) }}</span>
                    </div>
                    <div class="chat-room_message-content">
                        {{ message.content }}
                    </div>
                </div>
            </template>
        </div>

        <div class="chat-room_input">
            <ui-text-area
                v-model="newMessage"
                :disabled="isJoining || isSending"
                :input-attrs="textareaAttrs"
                :input-length-check="showCharCount"
                :max-input-length="2000"
                placeholder="Nachricht schreiben…"
            />
            <div class="chat-room_input-footer">
                <span class="chat-room_input-hint">Ctrl + Enter zum Senden</span>
                <ui-button
                    :disabled="!canSend"
                    @click="sendMessage()"
                >
                    {{ isSending ? 'Senden…' : 'Senden' }}
                </ui-button>
            </div>
        </div>
    </div>
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
const scrollContainer = ref<HTMLElement | null>(null);

const customerName = computed(() => repairReq.value?.customer?.displayName ??
    repairReq.value?.customer?.username ??
    null);

useHead({
    title: computed(() => repairReq.value?.subject ? `Chat · ${ repairReq.value.subject }` : 'Chat'),
});

const showCharCount = computed(() => newMessage.value.length > 1500);

const canSend = computed(() => !isJoining.value &&
    !isSending.value &&
    newMessage.value.trim().length > 0 &&
    newMessage.value.trim().length <= 2000);

const textareaAttrs = {
    rows: 3,
    onKeydown: (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    },
};

function isOwnMessage(message: ChatMessage): boolean {
    return message.sender?.id === store.me?.id;
}

function isSystemMessage(message: ChatMessage): boolean {
    return message.isInternal && !message.sender;
}

function messageAuthor(message: ChatMessage): string {
    if (isSystemMessage(message)) return 'System';
    return message.sender?.username ?? 'Unbekannt';
}

function isGrouped(index: number): boolean {
    if (index === 0) return false;
    const prev = messages.value[index - 1];
    const curr = messages.value[index];
    if (!prev || !curr) return false;
    if (isSystemMessage(curr) || isSystemMessage(prev)) return false;
    if (prev.sender?.id !== curr.sender?.id) return false;
    return new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime() < 5 * 60 * 1000;
}

function scrollToBottom(behavior?: ScrollBehavior): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior: ScrollBehavior = behavior ?? (reducedMotion ? 'instant' : 'smooth');
    void nextTick(() => {
        if (scrollContainer.value) {
            scrollContainer.value.scrollTo({ top: scrollContainer.value.scrollHeight, behavior: scrollBehavior });
        }
    });
}

watch(() => messages.value.length, () => scrollToBottom());

onMounted(async () => {
    if (!socket) {
        showToast({ mode: ToastMode.Error, message: 'Websocket connection unavailable' });
        await navigateTo('/request');
        return;
    }

    socket.on('chat:message', onChatMessage);

    socket.emit('chat:join', { requestId }, async response => {
        if (!response.ok) {
            showToast({ mode: ToastMode.Error, message: response.error ?? 'Unable to join chat room' });
            await navigateTo('/request');
            return;
        }

        messages.value = response.messages ?? [];
        isJoining.value = false;
        scrollToBottom('instant');
    });
});

onBeforeUnmount(() => {
    if (!socket) return;
    socket.emit('chat:leave', { requestId });
    socket.off('chat:message', onChatMessage);
});

function sendMessage(): void {
    if (!socket || !canSend.value) return;

    const content = newMessage.value.trim();

    isSending.value = true;
    socket.emit('chat:send', { requestId, content }, response => {
        if (!response.ok) {
            showToast({ mode: ToastMode.Error, message: response.error ?? 'Message could not be sent' });
        }
        else {
            newMessage.value = '';
        }
        isSending.value = false;
    });
}

function onChatMessage(payload: { requestId: string; message: ChatMessage }): void {
    if (payload.requestId !== requestId) return;
    messages.value.push(payload.message);
}

function formatTimestamp(value: string): string {
    const date = new Date(value);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}
</script>

<style scoped lang="scss">
.chat-room {
    display: flex;
    flex-direction: column;
    height: calc(100dvh - 58px);

    &_context {
        display: flex;
        flex-shrink: 0;
        align-items: center;

        padding: 0 16px;
        border-bottom: 1px solid $darkgray800;

        background: $darkgray900;
    }

    &_back {
        flex-shrink: 0;
        padding: 10px 0;
    }

    &_context-info {
        overflow: hidden;
        display: flex;
        gap: 8px;
        align-items: center;

        margin-left: 16px;
        padding: 10px 0 10px 16px;
        border-left: 1px solid $darkgray800;
    }

    &_context-subject {
        overflow: hidden;

        font-size: 13px;
        font-weight: 600;
        color: $lightgray0;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &_context-sep {
        flex-shrink: 0;
        color: $darkgray700;
    }

    &_context-customer {
        flex-shrink: 0;
        font-size: 13px;
        color: $lightgray400;

        @include mobile {
            display: none;
        }
    }

    &_messages {
        overflow-y: auto;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 2px;

        min-height: 0;
        padding: 16px;

        background: $darkgray1000;
    }

    &_messages-spacer {
        flex: 1;
    }

    &_state {
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;

        padding: 32px;

        font-size: 13px;
        color: $lightgray400;
        text-align: center;
    }

    &_message {
        display: flex;
        flex-direction: column;
        gap: 4px;

        max-width: 75%;
        padding: 8px 12px;
        border-radius: 8px;

        background: $darkgray875;

        & + &:not(&--grouped) {
            margin-top: 12px;
        }

        &--own {
            align-self: flex-end;
            background: $primary700;

            .chat-room_message-meta {
                color: varToRgba(lightgray0, 0.65);
            }
        }

        &--system {
            align-self: center;
            max-width: 90%;
            background: varToRgba(lightgray400, 0.07);

            .chat-room_message-content {
                font-size: 12px;
                color: $lightgray400;
                text-align: center;
            }
        }

        &-meta {
            display: flex;
            gap: 8px;
            justify-content: space-between;

            font-size: 11px;
            color: $lightgray400;

            &-author {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            &-time {
                flex-shrink: 0;
            }
        }

        &-content {
            font-size: 13px;
            line-height: 1.5;
            overflow-wrap: break-word;
            white-space: pre-wrap;
        }

        @include mobile {
            max-width: 90%;
        }
    }

    &_input {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: 8px;

        padding: 14px 16px;
        border-top: 1px solid $darkgray800;

        background: $darkgray900;
    }

    &_input-footer {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: space-between;
    }

    &_input-hint {
        font-size: 11px;
        color: $lightgray400;

        @include mobile {
            display: none;
        }
    }
}
</style>
