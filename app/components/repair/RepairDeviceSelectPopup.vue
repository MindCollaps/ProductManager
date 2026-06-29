<template>
    <common-popup
        close-text="Abbrechen"
        :is-visible="isVisible"
        :submit-text="selectedDevice ? 'Zuordnen' : 'Gerät wählen'"
        @close="handleClose"
        @submit="handleSubmit"
    >
        <div class="device-select">
            <ui-input-text
                v-model="searchQuery"
                icon="material-symbols:search-rounded"
                placeholder="Gerät suchen…"
            />
            <div class="device-select-list">
                <p
                    v-if="filteredDevices.length === 0"
                    class="device-select-empty"
                >
                    Keine Geräte gefunden
                </p>
                <div
                    v-for="device in filteredDevices"
                    :key="device.id"
                    class="device-select-item"
                    :class="{ 'device-select-item--selected': selectedDevice?.id === device.id }"
                    @click="toggleDevice(device)"
                >
                    <span class="device-select-item__name">{{ device.name }}</span>
                    <ui-button @click.stop="toggleDevice(device)">
                        {{ selectedDevice?.id === device.id ? 'Abwählen' : 'Auswählen' }}
                    </ui-button>
                </div>
            </div>
        </div>
    </common-popup>
</template>

<script lang="ts" setup>
import type { Device } from '@prisma/client';
import { ToastMode } from '~~/types/toast';

const props = defineProps<{
    isVisible: boolean;
}>();

const emit = defineEmits<{
    close: [];
    select: [device: Device];
}>();

const { showToast } = useToastManager();
const { data: devices } = useFetch<Device[]>('/api/v1/staff/device');
const searchQuery = ref('');
const selectedDevice = ref<Device | null>(null);

const filteredDevices = computed(() => {
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) return devices.value ?? [];
    return (devices.value ?? []).filter(d => d.name.toLowerCase().includes(q));
});

function toggleDevice(device: Device) {
    selectedDevice.value = selectedDevice.value?.id === device.id ? null : device;
}

function handleClose() {
    emit('close');
}

function handleSubmit() {
    if (!selectedDevice.value) {
        showToast({ mode: ToastMode.Error, message: 'Bitte ein Gerät auswählen.' });
        return;
    }
    emit('select', selectedDevice.value);
}

function reset() {
    searchQuery.value = '';
    selectedDevice.value = null;
}

watch(() => props.isVisible, visible => {
    if (!visible) reset();
});
</script>

<style scoped lang="scss">
.device-select {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 480px;

    &-list {
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;

        max-height: 60vh;
    }

    &-empty {
        margin: 0;
        padding: 32px 16px;
        border-radius: 6px;

        font-size: 13px;
        color: $lightgray400;
        text-align: center;

        background: $darkgray900;
    }

    &-item {
        cursor: pointer;

        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;

        padding: 10px 14px;
        border: 1px solid transparent;
        border-radius: 6px;

        background: $darkgray900;

        transition: border-color 0.15s ease, background 0.15s ease;

        &:hover {
            background: $darkgray875;
        }

        &--selected {
            border-color: $primary500;
            background: $darkgray875;
        }

        &__name {
            font-size: 13px;
            font-weight: 600;
            color: $lightgray150;
        }

        @media (prefers-reduced-motion: reduce) {
            transition: none;
        }
    }
}
</style>
