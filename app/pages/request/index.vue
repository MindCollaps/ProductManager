<template>
    <div class="req-page">
        <div class="req-page-header">
            <h1 class="req-page-title">Meine Anfragen</h1>
            <ui-button
                href="/request/new"
                size="S"
                type="secondary"
            >
                Neue Anfrage
            </ui-button>
        </div>

        <div
            v-if="pending"
            aria-busy="true"
            aria-label="Anfragen werden geladen"
            class="req-list"
        >
            <div
                v-for="i in 3"
                :key="i"
                class="req req--skeleton"
            >
                <div class="req-body">
                    <div class="skel skel--subject"/>
                    <div class="skel skel--meta"/>
                </div>
                <div class="skel skel--chip"/>
                <div class="skel skel--btn"/>
            </div>
        </div>

        <common-box
            v-else-if="error"
            class="req-error-box"
        >
            <p class="req-error-msg">Anfragen konnten nicht geladen werden.</p>
            <ui-button
                type="secondary"
                @click="refresh()"
            >
                Erneut versuchen
            </ui-button>
        </common-box>

        <common-box
            v-else-if="req?.length === 0"
            class="req-empty"
        >
            <p class="req-empty-msg">Noch keine Anfragen erstellt.</p>
            <ui-button href="/request/new">
                Erste Anfrage erstellen
            </ui-button>
        </common-box>

        <div
            v-else
            class="req-list"
        >
            <div
                v-for="r in req"
                :key="r.id"
                class="req"
            >
                <div class="req-body">
                    <h3 class="req-subject">{{ r.subject }}</h3>
                    <div
                        v-if="deviceMeta(r)"
                        class="req-meta"
                    >
                        {{ deviceMeta(r) }}
                    </div>
                    <div
                        v-if="r.suspectedIssue"
                        class="req-issue"
                    >
                        {{ r.suspectedIssue }}
                    </div>
                </div>

                <ui-status :status="resolveDisplayStatus(r)"/>

                <ui-button
                    :aria-label="`Details: ${ r.subject }`"
                    :href="`/request/${ r.id }`"
                    size="S"
                    type="secondary-black"
                >
                    Details
                </ui-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';

import type { RepairRequestWithRelationsType } from '~~/types/req';

const { data: req, pending, error, refresh } = useFetch<RepairRequestWithRelationsType[]>('/api/v1/user/request');

function deviceMeta(r: RepairRequestWithRelationsType) {
    return [r.deviceName, r.deviceBrand].filter(Boolean).join(' · ');
}

function resolveDisplayStatus(request: RepairRequestWithRelationsType) {
    const firstWorkItem = [...(request.workItems ?? [])].sort((left, right) => left.orderIndex - right.orderIndex)[0];
    const firstWorkItemCompleted = firstWorkItem?.status === 'DONE';

    if (request.status === RepairRequestStatus.ACCEPTED && firstWorkItemCompleted) {
        return request.statusHistory?.[0]?.status ?? request.status;
    }

    return request.status;
}
</script>

<style lang="scss" scoped>
.req-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
}

.req-page-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.req-page-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: $lightgray150;
}

.req-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.req {
    display: flex;
    gap: 16px;
    align-items: center;

    padding: 12px 16px;
    border-radius: 8px;

    background: $darkgray900;

    @include pc {
        transition: background 0.15s;
    }

    @include hover {
        &:hover {
            background: $darkgray875;
        }
    }
}

.req-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;

    min-width: 0;
}

.req-subject {
    overflow: hidden;

    margin: 0;

    font-size: 14px;
    font-weight: 600;
    color: $lightgray150;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.req-meta {
    overflow: hidden;

    font-size: 11px;
    color: $lightgray400;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.req-issue {
    overflow: hidden;

    font-size: 11px;
    font-style: italic;
    color: $lightgray400;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.req--skeleton {
    pointer-events: none;
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
        max-width: 60%;
        height: 14px;
    }

    &--meta {
        max-width: 40%;
        height: 11px;
    }

    &--chip {
        flex-shrink: 0;
        width: 90px;
        height: 22px;
        border-radius: 8px;
    }

    &--btn {
        flex-shrink: 0;
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

.req-error-box,
.req-empty {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
}

.req-error-msg,
.req-empty-msg {
    margin: 0;
    font-size: 13px;
    color: $lightgray300;
}
</style>
