<template>
    <common-page
        v-if="repairReq"
        :title="`Repair Flow · ${ repairReq?.customer.displayName }`"
    >
        <div class="graph-page">
            <repair-step-graph
                :editable="store.me?.isAdmin || store.me?.isStaff"
                :request="repairReq"
            />
        </div>
    </common-page>
    <common-box v-else>
        <h2>Loading...</h2>
    </common-box>
</template>

<script setup lang="ts">
import { useStore } from '~/store';
import type { RepairRequestWithRelationsType } from '~~/types/req';

const route = useRoute();
const id = route.params.id as string;
const store = useStore();

const { data: repairReq } = useFetch<RepairRequestWithRelationsType>(`/api/v1/user/request/${ id }`);
</script>

<style scoped lang="scss">
.graph-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
}
</style>
