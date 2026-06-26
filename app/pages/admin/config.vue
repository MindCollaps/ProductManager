<template>
    <common-page title="Konfiguration">
        <div class="config-page">
            <settings-section
                description="Einstellungen für die Reparaturwert-Berechnung"
                title="Kosten & Abrechnung"
            >
                <settings-row
                    hint="Wird für die Berechnung der Arbeitskosten in der Savings-Tile verwendet."
                    label="Stundensatz (EUR / h)"
                    stacked
                >
                    <ui-input-number v-model="hourlyRate"/>
                </settings-row>
            </settings-section>

            <settings-section
                description="Was Kunden sehen können"
                title="Sichtbarkeit"
            >
                <settings-row
                    hint="Zeigt die Gantt-Timeline mit Reparaturphasen auch auf der Kunden-Anfragenseite an."
                    label="Reparaturverlauf für Kunden"
                >
                    <ui-checkbox v-model="showTimelineToCustomer"/>
                </settings-row>
            </settings-section>

            <settings-section
                description="Beispieldaten für Präsentationen"
                title="Demo-Modus"
            >
                <settings-row
                    hint="Erstellt einen Demo-User (demo / demo) mit 5 Beispiel-Aufträgen in verschiedenen Reparaturphasen. Beim Deaktivieren werden alle Demo-Daten und der User vollständig entfernt."
                    label="Demo aktivieren"
                >
                    <ui-checkbox
                        v-model="demoMode"
                        :disabled="demoSaving"
                    />
                </settings-row>
                <div
                    v-if="demoMode"
                    class="config-page-demo-hint"
                >
                    Demo aktiv – Login mit <strong>demo</strong> / <strong>demo</strong>
                </div>
            </settings-section>

            <div class="config-page-actions">
                <ui-button
                    :disabled="demoSaving"
                    @click="save"
                >
                    {{ demoSaving ? 'Demo wird vorbereitet…' : 'Speichern' }}
                </ui-button>
            </div>
        </div>
    </common-page>
</template>

<script setup lang="ts">
interface AdminConfigResponse {
    id: string;
    hourlyRate: number | string;
    showTimelineToCustomer: boolean;
    demoMode: boolean;
}

const { data: config, refresh } = useFetch<AdminConfigResponse>('/api/v1/admin/config');
const { showToast } = useToastManager();

const hourlyRate = ref(0);
const showTimelineToCustomer = ref(false);
const demoMode = ref(false);
const demoSaving = ref(false);

watch(config, nextConfig => {
    if (!nextConfig) return;
    hourlyRate.value = Number(nextConfig.hourlyRate);
    showTimelineToCustomer.value = nextConfig.showTimelineToCustomer;
    demoMode.value = nextConfig.demoMode;
}, { immediate: true });

async function save() {
    const demoModeChanged = demoMode.value !== config.value?.demoMode;
    demoSaving.value = demoModeChanged;

    try {
        await $fetch('/api/v1/admin/config', {
            method: 'PUT',
            body: {
                hourlyRate: Number(hourlyRate.value ?? 0),
                showTimelineToCustomer: showTimelineToCustomer.value,
                demoMode: demoMode.value,
            },
        });

        await refresh();
        showToast({ message: 'Konfiguration gespeichert' });
    }
    catch {
        showToast({ message: 'Fehler beim Speichern', mode: 'Error' });
    }
    finally {
        demoSaving.value = false;
    }
}
</script>

<style scoped lang="scss">
.config-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: min(640px, 100%);

    &-actions {
        display: flex;
        justify-content: flex-end;
    }

    &-demo-hint {
        margin-top: 6px;
        padding: 8px 12px;
        border-radius: 6px;

        font-size: 13px;
        color: $success600Orig;

        background: rgba($success500Orig, 0.12);
    }
}
</style>
