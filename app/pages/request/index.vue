<template>
    <div class="req-list">
        <div
            v-for="r in req"
            :key="r.id"
            class="req"
        >
            <h2>{{ r.subject }} {{ r.queuePosition ? `(${ r.queuePosition })` : '' }}</h2>
            <ui-status :status="resolveDisplayStatus(r)"/>
            <div class="req-details">
                {{ r.deviceName }} / {{ r.deviceModel }} / {{ r.deviceBrand }}
            </div>
            <ui-labeled-text :value="r.suspectedIssue">Suspected issue</ui-labeled-text>
            <ui-button :href="`/request/${ r.id }`">Details</ui-button>
        </div>
        <common-box v-if="req?.length === 0">
            <h2>Bisher keine Anfragen erstellt</h2>
            <ui-button @click="router.push('/request/new')">Anfrage Erstellen</ui-button>
        </common-box>
        <ui-button v-else @click="router.push('/request/new')">Neue Anfrage Erstellen</ui-button>
    </div>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';

import type { RepairRequestWithRelationsType } from '~~/types/req';

const router = useRouter();

const { data: req } = useFetch<RepairRequestWithRelationsType[]>('/api/v1/user/request');

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
        padding: 16px;
    }
}
</style>
