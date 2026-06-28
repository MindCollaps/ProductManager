<template>
    <div class="req-page">
        <div class="req-filters">
            <ui-input-text v-model="deviceTypeFilter">
                Gerätetyp
            </ui-input-text>

            <div class="req-filter-select">
                <label
                    class="req-filter-label"
                    for="request-status-filter"
                >
                    Status
                </label>
                <select
                    id="request-status-filter"
                    v-model="statusFilter"
                    class="req-filter-select_input"
                >
                    <option
                        v-for="option in statusFilterOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <ui-button
                type="secondary"
                @click="resetFilters()"
            >
                Filter zurücksetzen
            </ui-button>
        </div>

        <div
            v-if="pending"
            aria-busy="true"
            aria-label="Anfragen werden geladen"
            class="req-list"
        >
            <div
                v-for="i in 4"
                :key="i"
                class="req req--skeleton"
            >
                <div class="req-body">
                    <div class="req-header">
                        <div class="skel skel--subject"/>
                    </div>
                    <div class="skel skel--meta"/>
                </div>
                <div class="req-badges">
                    <div class="skel skel--chip"/>
                </div>
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

        <template v-else>
            <div
                v-if="req"
                class="req-list-header"
            >
                <span
                    aria-atomic="true"
                    aria-live="polite"
                    class="req-list-count"
                >
                    <template v-if="isFiltered">
                        {{ filteredRequests.length }} von {{ req.length }} Anfragen
                    </template>
                    <template v-else>
                        {{ req.length }} {{ req.length === 1 ? 'Anfrage' : 'Anfragen' }}
                    </template>
                </span>
            </div>

            <div class="req-list">
                <div
                    v-for="r in filteredRequests"
                    :key="r.id"
                    class="req"
                >
                    <div class="req-body">
                        <div class="req-header">
                            <h3 class="req-subject">{{ r.subject }}</h3>
                            <span
                                v-if="r.queuePosition"
                                class="req-position"
                            >Pos.&nbsp;{{ r.queuePosition }}</span>
                        </div>

                        <div
                            v-if="r.deviceName || r.deviceBrand"
                            class="req-meta"
                        >
                            {{ [r.deviceName, r.deviceBrand].filter(Boolean).join(' · ') }}
                        </div>

                        <div
                            v-if="r.suspectedIssue"
                            class="req-issue"
                        >
                            {{ r.suspectedIssue }}
                        </div>
                    </div>

                    <div class="req-badges">
                        <ui-status :status="resolveDisplayStatus(r)"/>
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

                <common-box v-if="req?.length === 0">
                    <h2>Bisher keine Anfragen</h2>
                </common-box>
                <common-box v-else-if="req && filteredRequests.length === 0">
                    <h2>Keine Anfragen entsprechen den Filtern</h2>
                </common-box>
            </div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';

import type { RepairRequestWithRelationsType } from '~~/types/req';

const { data: req, pending, error, refresh } = useFetch<RepairRequestWithRelationsType[]>('/api/v1/staff/request');
const statusFilter = ref<'ALL' | RepairRequestStatus>('ALL');
const deviceTypeFilter = ref('');

const statusFilterOptions = [
    { label: 'Alle Status', value: 'ALL' },
    { label: 'Wartet auf Prüfung', value: RepairRequestStatus.WAITING_FOR_REVIEW },
    { label: 'Wartet auf Antwort', value: RepairRequestStatus.WAITING_FOR_RESPONSE },
    { label: 'Angenommen', value: RepairRequestStatus.ACCEPTED },
    { label: 'Abgelehnt', value: RepairRequestStatus.REJECTED },
    { label: 'Abgebrochen', value: RepairRequestStatus.CANCELLED },
    { label: 'Abgeschlossen', value: RepairRequestStatus.COMPLETED },
] as const;

const isFiltered = computed(() => statusFilter.value !== 'ALL' || deviceTypeFilter.value.trim().length > 0);

const filteredRequests = computed(() => {
    const requests = req.value ?? [];
    const deviceTypeQuery = deviceTypeFilter.value.trim().toLowerCase();

    return requests.filter(request => {
        const matchesStatus = statusFilter.value === 'ALL' || request.status === statusFilter.value;

        const deviceTypeHaystack = [
            request.deviceName,
            request.deviceBrand,
            request.deviceModel,
            request.device?.displayName,
            request.device?.serialNumber,
            request.device?.device?.name,
            request.device?.device?.deviceBrand.name,
        ]
            .filter((value): value is string => typeof value === 'string' && value.length > 0)
            .join(' ')
            .toLowerCase();
        const matchesDeviceType = deviceTypeQuery.length === 0 || deviceTypeHaystack.includes(deviceTypeQuery);

        return matchesStatus && matchesDeviceType;
    });
});

function resetFilters() {
    statusFilter.value = 'ALL';
    deviceTypeFilter.value = '';
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

.req-filters {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 220px auto;
    gap: 12px;
    align-items: end;

    @include mobile {
        grid-template-columns: 1fr;
    }
}

.req-filter-label {
    display: block;

    margin-bottom: 8px;

    font-size: 13px;
    font-weight: 600;
    color: $typographyPrimary;
}

.req-filter-select {
    &_input {
        cursor: pointer;

        width: 100%;
        height: 40px;
        padding: 0 36px 0 16px;
        border: 2px solid transparent;
        border-radius: 8px;

        font-family: $defaultFont;
        font-size: 13px;
        font-weight: 600;
        color: $lightgray150;

        /* stylelint-disable-next-line property-no-vendor-prefix */
        -webkit-appearance: none;
        appearance: none;
        color-scheme: dark;
        /* stylelint-disable-next-line function-url-quotes */
        background: $darkgray900 url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='16' height='16'%3E%3Cpath fill='%23aaaaac' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E") no-repeat right 10px center;
        outline: none;

        @include pc {
            transition: border-color 0.3s;
        }

        @include hover {
            &:hover {
                border-color: $darkgray800;
            }
        }

        &:focus {
            border-color: $primary500;
        }
    }
}

.req-list-header {
    padding: 0;
}

.req-list-count {
    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
}

.req-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
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

.req-header {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.req-subject {
    overflow: hidden;
    flex: 1;

    margin: 0;

    font-size: 14px;
    font-weight: 600;
    color: $lightgray150;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.req-badges {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
}

.req-position {
    padding: 2px 7px;
    border-radius: 4px;

    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
    white-space: nowrap;

    background: $darkgray875;
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
        flex: 1;
        max-width: 55%;
        height: 13px;
    }

    &--chip {
        width: 52px;
        height: 20px;
        border-radius: 8px;
    }

    &--meta {
        max-width: 38%;
        height: 11px;
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

.req-error-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
}

.req-error-msg {
    margin: 0;
    font-size: 13px;
    color: $lightgray300;
}
</style>
