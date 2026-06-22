<template>
    <div class="req-page">
        <div class="req-filters">
            <ui-input-text v-model="deviceTypeFilter">
                Device type
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
                Reset filters
            </ui-button>
        </div>

        <div class="req-list">
            <div
                v-for="r in filteredRequests"
                :key="r.id"
                class="req"
            >
                <h2>{{ r.subject }} {{ r.queuePosition ? `(${ r.queuePosition })` : '' }}</h2>
                <ui-status :status="resolveDisplayStatus(r)"/>
                <div class="req-details">
                    {{ r.deviceName }} / {{ r.deviceModel }} / {{ r.deviceBrand }}
                </div>
                <ui-labeled-text :value="r.suspectedIssue">Suspected issue</ui-labeled-text>
                <ui-button :href="`/staff/request/${ r.id }`">Details</ui-button>
            </div>
            <common-box v-if="req?.length === 0">
                <h2>Bisher keine Anfragen</h2>
            </common-box>
            <common-box v-else-if="req && filteredRequests.length === 0">
                <h2>No requests match the selected filters</h2>
            </common-box>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';

import type { RepairRequestWithRelationsType } from '~~/types/req';

const { data: req } = useFetch<RepairRequestWithRelationsType[]>('/api/v1/staff/request');
const statusFilter = ref<'ALL' | RepairRequestStatus>('ALL');
const deviceTypeFilter = ref('');

const statusFilterOptions = [
    { label: 'All statuses', value: 'ALL' },
    { label: 'Waiting for review', value: RepairRequestStatus.WAITING_FOR_REVIEW },
    { label: 'Waiting for response', value: RepairRequestStatus.WAITING_FOR_RESPONSE },
    { label: 'Accepted', value: RepairRequestStatus.ACCEPTED },
    { label: 'Rejected', value: RepairRequestStatus.REJECTED },
    { label: 'Cancelled', value: RepairRequestStatus.CANCELLED },
    { label: 'Completed', value: RepairRequestStatus.COMPLETED },
] as const;

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
    padding: 16px;
}

.req-filters {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 240px auto;
    gap: 16px;
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
        width: 100%;
        height: 48px;
        padding: 0 14px;
        border: 1px solid $lightgray150;
        border-radius: 8px;

        font-family: $defaultFont;
        font-size: 13px;
        color: $lightgray150;

        background: $darkgray900;
        outline: none;

        &:focus {
            border-color: $primary500;
            box-shadow: 0 0 0 3px rgb(0 0 0 / 18%);
        }
    }
}

.req {
    display: flex;
    flex-direction: column;
    gap: 16px;

    padding: 16px;
    border-radius: 8px;

    background: $darkgray900;

    &-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
}
</style>
