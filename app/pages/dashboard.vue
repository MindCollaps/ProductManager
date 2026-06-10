<template>
    WIP
    {{ store.me?.isAdmin }}
</template>
<script lang="ts" setup>
import { useStore } from '~/store';

const store = useStore();
</script>