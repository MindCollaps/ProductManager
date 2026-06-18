<template>
	<div class="logout-page">Signing out...</div>
</template>

<script setup lang="ts">
onMounted(() => {
	window.location.replace('/logout');
});
</script>
