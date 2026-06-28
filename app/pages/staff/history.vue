<template>
    <div class="hist-page">
        <div class="hist-header">
            <h1 class="hist-title">Verlauf</h1>
            <span
                v-if="req && !pending && !error"
                aria-atomic="true"
                aria-live="polite"
                class="hist-count"
            >
                {{ req.length }} {{ req.length === 1 ? 'Anfrage' : 'Anfragen' }}
            </span>
        </div>

        <div
            v-if="pending"
            aria-busy="true"
            aria-label="Verlauf wird geladen"
            class="hist-list"
        >
            <div
                v-for="i in 3"
                :key="i"
                class="hist-card hist-card--skeleton"
            >
                <div class="hist-card-header">
                    <div class="skel skel--subject"/>
                    <div class="skel skel--date"/>
                </div>
                <div class="skel skel--chip"/>
                <div class="skel skel--meta"/>
                <div class="skel skel--btn"/>
            </div>
        </div>

        <common-box
            v-else-if="error"
            class="hist-error-box"
        >
            <p class="hist-error-msg">Verlauf konnte nicht geladen werden.</p>
            <ui-button
                type="secondary"
                @click="refresh()"
            >
                Erneut versuchen
            </ui-button>
        </common-box>

        <div
            v-else-if="req && req.length > 0"
            class="hist-list"
        >
            <div
                v-for="r in req"
                :key="r.id"
                class="hist-card"
            >
                <div class="hist-card-header">
                    <h2 class="hist-subject">{{ r.subject }}</h2>
                    <time
                        class="hist-date"
                        :datetime="new Date(`${ r.createdAt }`).toISOString()"
                    >{{ formatDate(r.createdAt) }}</time>
                </div>
                <ui-status :status="resolveDisplayStatus(r)"/>
                <div
                    v-if="r.deviceName || r.deviceBrand || r.deviceModel"
                    class="hist-meta"
                >
                    {{ [r.deviceName, r.deviceModel, r.deviceBrand].filter(Boolean).join(' · ') }}
                </div>
                <div
                    v-if="r.suspectedIssue"
                    class="hist-issue"
                >
                    <span class="hist-issue-label">Fehlerbeschreibung</span>
                    <span class="hist-issue-text">{{ r.suspectedIssue }}</span>
                </div>
                <ui-button
                    :aria-label="`Details: ${ r.subject }`"
                    :href="`/staff/request/${ r.id }`"
                    size="S"
                    type="secondary-black"
                >
                    Details
                </ui-button>
            </div>
        </div>

        <common-box v-else>
            <h2>Keine historischen Anfragen</h2>
        </common-box>
    </div>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';

import type { RepairRequestWithRelationsType } from '~~/types/req';

const { data: req, pending, error, refresh } = useFetch<RepairRequestWithRelationsType[]>('/api/v1/staff/request/history');

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(`${ date }`));
}

function resolveDisplayStatus(request: RepairRequestWithRelationsType) {
    if (request.status === RepairRequestStatus.COMPLETED) {
        return request.statusHistory?.[0]?.status ?? request.status;
    }

    const firstWorkItem = [...(request.workItems ?? [])].sort((left, right) => left.orderIndex - right.orderIndex)[0];
    const firstWorkItemCompleted = firstWorkItem?.status === 'DONE';

    if (request.status === RepairRequestStatus.ACCEPTED && firstWorkItemCompleted) {
        return request.statusHistory?.[0]?.status ?? request.status;
    }

    return request.status;
}
</script>

<style lang="scss" scoped>
.hist-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
}

.hist-header {
    display: flex;
    gap: 12px;
    align-items: center;
}

.hist-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $lightgray150;
}

.hist-count {
    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
}

.hist-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hist-card {
    display: flex;
    flex-direction: column;
    gap: 10px;

    padding: 16px;
    border-radius: 8px;

    background: $darkgray900;

    &--skeleton {
        pointer-events: none;
    }
}

.hist-card-header {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;

    min-width: 0;
}

.hist-subject {
    overflow: hidden;
    flex: 1;

    margin: 0;

    font-size: 14px;
    font-weight: 600;
    color: $lightgray150;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hist-date {
    flex-shrink: 0;

    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
    white-space: nowrap;
}

.hist-meta {
    overflow: hidden;

    font-size: 11px;
    color: $lightgray400;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.hist-issue {
    display: flex;
    flex-direction: column;
    gap: 3px;

    &-label {
        font-size: 11px;
        font-weight: 600;
        color: $lightgray400;
    }

    &-text {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;

        font-size: 12px;
        font-style: italic;
        color: $lightgray300;
    }
}

.hist-error-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
}

.hist-error-msg {
    margin: 0;
    font-size: 13px;
    color: $lightgray300;
}

.skel {
    border-radius: 4px;
    background: linear-gradient(
        90deg,
        $darkgray875 25%,
        $darkgray850 50%,
        $darkgray875 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;

    &--subject {
        flex: 1;
        max-width: 60%;
        height: 14px;
    }

    &--date {
        flex-shrink: 0;
        width: 64px;
        height: 11px;
        margin-top: 2px;
    }

    &--chip {
        width: 90px;
        height: 22px;
        border-radius: 8px;
    }

    &--meta {
        max-width: 50%;
        height: 11px;
    }

    &--btn {
        flex-shrink: 0;
        align-self: flex-start;

        width: 72px;
        height: 30px;
        border-radius: 8px;
    }

    @media (prefers-reduced-motion: reduce) {
        background: $darkgray875;
        animation: none;
    }
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>
