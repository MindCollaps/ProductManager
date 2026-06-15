<template>
    <div class="req-list">
        <div
            v-for="r in req"
            :key="r.id"
            class="req"
        >
            <h2>{{ r.subject }} {{ r.queuePosition ? `(${ r.queuePosition })` : '' }}</h2>
            <ui-status :status="r.status"/>
            <div class="req-details">
                {{ r.deviceName }} / {{ r.deviceModel }} / {{ r.deviceBrand }}
            </div>
            <ui-labeled-text :value="r.suspectedIssue">Suspected issue</ui-labeled-text>
            <ui-button :href="`/staff/request/${ r.id }`">Details</ui-button>
        </div>
        <common-box v-if="req?.length === 0">
            <h2>Bisher keine Anfragen</h2>
        </common-box>
    </div>
</template>

<script lang="ts" setup>
import type { RepairRequestWithRelationsType } from '~~/types/req';

const { data: req } = useFetch<RepairRequestWithRelationsType[]>('/api/v1/staff/request');
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
        padding: 16px;
        gap: 16px;
    }
}
</style>
