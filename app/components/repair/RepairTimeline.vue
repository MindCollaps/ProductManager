<template>
    <div class="repair-timeline">
        <h3 class="repair-timeline-title">Reparaturverlauf</h3>
        <div
            v-if="sortedHistory.length === 0"
            class="repair-timeline-empty"
        >
            Noch kein Verlauf vorhanden
        </div>
        <div
            v-else
            class="repair-timeline-gantt"
        >
            <div class="repair-timeline-rows">
                <div
                    v-for="entry in sortedHistory"
                    :key="entry.id"
                    class="repair-timeline-row"
                >
                    <div class="repair-timeline-row-label">
                        {{ STATUS_LABELS[entry.status] ?? entry.status }}
                    </div>
                    <div class="repair-timeline-row-track">
                        <div
                            class="repair-timeline-bar"
                            :class="[`repair-timeline-bar--${ entry.status }`, { 'repair-timeline-bar--active': !entry.endedAt }]"
                            :style="barStyle(entry)"
                        >
                            <span class="repair-timeline-bar-text">{{ barDurationLabel(entry) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="repair-timeline-footer">
                <span class="repair-timeline-footer-start">{{ formatDate(rangeStart) }}</span>
                <span class="repair-timeline-footer-total">Gesamt: {{ totalDurationLabel }}</span>
                <span class="repair-timeline-footer-end">{{ formatDate(rangeEnd) }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RepairStatus } from '@prisma/client';

type StatusHistoryEntry = {
    id: string;
    status: RepairStatus;
    startedAt: string | Date;
    endedAt: string | Date | null;
    durationMinutes: number | null;
    note: string | null;
    createdBy: { displayName: string | null; username: string | null } | null;
};

const props = defineProps<{
    history: StatusHistoryEntry[];
}>();

const STATUS_LABELS: Record<RepairStatus, string> = {
    [RepairStatus.RECEIVED]: 'Empfangen',
    [RepairStatus.IN_DIAGNOSIS]: 'Diagnose',
    [RepairStatus.WAITING_FOR_PARTS]: 'Warte auf Teile',
    [RepairStatus.IN_REPAIR]: 'In Reparatur',
    [RepairStatus.IN_QA]: 'Qualitätsprüfung',
    [RepairStatus.IN_OUTGOING]: 'Im Ausgang',
    [RepairStatus.ON_THE_WAY_TO_CUSTOMER]: 'Unterwegs',
    [RepairStatus.DELIVERED]: 'Zugestellt',
    [RepairStatus.ARCHIVED]: 'Archiviert',
    [RepairStatus.ON_THE_WAY_TO_SHOP]: 'Anfahrt',
};

const sortedHistory = computed(() => [...props.history]
    .filter(e => e.status !== RepairStatus.ARCHIVED)
    .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime()));

const now = ref(new Date());
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
    timer = setInterval(() => {
        now.value = new Date();
    }, 60000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

const rangeStart = computed(() => sortedHistory.value.length > 0 ? new Date(sortedHistory.value[0]!.startedAt) : new Date());

const rangeEnd = computed(() => {
    if (sortedHistory.value.length === 0) return new Date();
    const last = sortedHistory.value[sortedHistory.value.length - 1]!;
    return last.endedAt ? new Date(last.endedAt) : now.value;
});

const totalRangeMs = computed(() => Math.max(1, rangeEnd.value.getTime() - rangeStart.value.getTime()));

const totalDurationLabel = computed(() => {
    const totalMinutes = Math.round(totalRangeMs.value / 60000);
    return formatDuration(totalMinutes);
});

function effectiveEnd(entry: StatusHistoryEntry): Date {
    return entry.endedAt ? new Date(entry.endedAt) : now.value;
}

function barStyle(entry: StatusHistoryEntry) {
    const start = new Date(entry.startedAt).getTime();
    const end = effectiveEnd(entry).getTime();
    const rangeStartMs = rangeStart.value.getTime();

    const leftPct = Math.max(0, ((start - rangeStartMs) / totalRangeMs.value) * 100);
    const rawWidthPct = ((end - start) / totalRangeMs.value) * 100;
    const widthPct = Math.max(0.5, Math.min(rawWidthPct, 100 - leftPct));

    return {
        left: `${ leftPct.toFixed(2) }%`,
        width: `${ widthPct.toFixed(2) }%`,
    };
}

function barDurationLabel(entry: StatusHistoryEntry): string {
    const start = new Date(entry.startedAt).getTime();
    const end = effectiveEnd(entry).getTime();
    const minutes = Math.round((end - start) / 60000);
    return formatDuration(minutes);
}

function formatDuration(minutes: number): string {
    if (minutes < 1) return '< 1 Min';
    if (minutes < 60) return `${ minutes } Min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const days = Math.floor(h / 24);
    const remH = h % 24;
    if (days > 0) return m > 0 ? `${ days }T ${ remH }Std ${ m }Min` : `${ days }T ${ remH }Std`;
    return m > 0 ? `${ h }Std ${ m }Min` : `${ h }Std`;
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}
</script>

<style lang="scss" scoped>
.repair-timeline {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;

    &-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: $lightgray200;
    }

    &-empty {
        font-size: 13px;
        color: $lightgray400;
    }

    &-gantt {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    &-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    &-row {
        display: grid;
        grid-template-columns: 140px 1fr;
        gap: 12px;
        align-items: center;

        &-label {
            overflow: hidden;

            font-size: 12px;
            font-weight: 500;
            color: $lightgray300;
            text-align: right;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        &-track {
            position: relative;
            height: 28px;
            border-radius: 4px;
            background: $darkgray700;
        }
    }

    &-bar {
        position: absolute;
        top: 2px;

        overflow: hidden;
        display: flex;
        align-items: center;

        min-width: 4px;
        height: 24px;
        border-radius: 3px;

        transition: opacity 0.2s;

        &--active {
            &::after {
                content: '';

                position: absolute;
                top: 0;
                right: 0;
                bottom: 0;

                width: 3px;

                background: rgb(255, 255, 255, 0.5);

                animation: pulse-edge 1.5s ease-in-out infinite;
            }
        }

        &-text {
            pointer-events: none;

            overflow: hidden;

            padding: 0 8px;

            font-size: 11px;
            font-weight: 600;
            color: rgb(255, 255, 255, 0.9);
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        // Status colors — darkened to ensure white text ≥ 4.5:1 at 11px
        &--ON_THE_WAY_TO_SHOP     { background: #475569; }
        &--RECEIVED               { background: #1d4ed8; }
        &--IN_DIAGNOSIS           { background: #b45309; }
        &--WAITING_FOR_PARTS      { background: #dc2626; }
        &--IN_REPAIR              { background: #7c3aed; }
        &--IN_QA                  { background: #0e7490; }
        &--IN_OUTGOING            { background: #0f766e; }
        &--ON_THE_WAY_TO_CUSTOMER { background: #15803d; }
        &--DELIVERED              { background: #166534; }
    }

    &-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;

        margin-top: 4px;
        padding-left: 152px;

        &-start,
        &-end {
            font-size: 11px;
            color: $lightgray400;
        }

        &-total {
            font-size: 12px;
            font-weight: 600;
            color: $lightgray300;
        }
    }
}

@keyframes pulse-edge {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .repair-timeline-bar--active::after {
        opacity: 0.7;
        animation: none;
    }
}
</style>
