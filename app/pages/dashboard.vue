<template>
    <common-page title="Dashboard">
        <div class="dashboard">
            <!-- ── Staff / Admin ── -->
            <template v-if="isStaff">
                <!-- Queue tile with inline request list -->
                <div class="dash-tile">
                    <div class="dash-tile-header">
                        <div class="dash-tile-header-left">
                            <h2 class="dash-tile-title">Warteschlange</h2>
                            <div
                                aria-live="polite"
                                class="dash-badges"
                            >
                                <template v-if="!pending">
                                    <span
                                        v-if="waitingCount > 0"
                                        class="dash-badge dash-badge--urgent"
                                    >{{ waitingCount }} auf Prüfung</span>
                                    <span
                                        v-if="inProgressCount > 0"
                                        class="dash-badge"
                                    >{{ inProgressCount }} aktiv</span>
                                    <span
                                        v-if="waitingCount === 0 && inProgressCount === 0"
                                        class="dash-muted"
                                    >Keine offenen Anfragen</span>
                                </template>
                            </div>
                        </div>
                        <ui-button
                            size="S"
                            to="/staff/request"
                            type="secondary-black"
                        >
                            Alle Anfragen
                        </ui-button>
                    </div>

                    <div
                        v-if="pending"
                        aria-busy="true"
                        class="dash-req-list"
                    >
                        <div
                            v-for="i in 3"
                            :key="i"
                            class="dash-req-row dash-req-row--skeleton"
                        >
                            <div class="dash-req-body">
                                <div class="skel skel--subject"/>
                                <div class="skel skel--meta"/>
                            </div>
                            <div class="skel skel--chip"/>
                        </div>
                    </div>

                    <div
                        v-else-if="priorityRequests.length > 0"
                        class="dash-req-list"
                    >
                        <nuxt-link
                            v-for="r in priorityRequests"
                            :key="r.id"
                            :aria-label="`Anfrage öffnen: ${ r.subject }`"
                            class="dash-req-row"
                            :to="`/staff/request/${ r.id }`"
                        >
                            <div class="dash-req-body">
                                <span class="dash-req-subject">{{ r.subject }}</span>
                                <span
                                    v-if="r.customer?.username"
                                    class="dash-req-meta"
                                >{{ r.customer.username }}</span>
                            </div>
                            <ui-status :status="resolveDisplayStatus(r)"/>
                        </nuxt-link>
                    </div>
                </div>

                <!-- Stats tile -->
                <div class="dash-tile">
                    <div class="dash-tile-header">
                        <h2 class="dash-tile-title">Statistiken</h2>
                    </div>

                    <div
                        v-if="statsPending"
                        class="dash-stats-body"
                    >
                        <div class="dash-stats-grid">
                            <div
                                v-for="col in 2"
                                :key="col"
                                class="dash-stats-col"
                            >
                                <div class="skel skel--col-title"/>
                                <div
                                    v-for="i in 4"
                                    :key="i"
                                    class="dash-stat-item dash-stat-item--skeleton"
                                >
                                    <div class="skel skel--stat-name"/>
                                    <div class="skel skel--stat-bar"/>
                                    <div class="skel skel--stat-count"/>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-else-if="stats"
                        class="dash-stats-body"
                    >
                        <div class="dash-stats-grid">
                            <div
                                v-if="stats.topDevices.length > 0"
                                class="dash-stats-col"
                            >
                                <h3 class="dash-stats-col-title">Geräte</h3>
                                <div
                                    v-for="item in stats.topDevices"
                                    :key="item.name"
                                    class="dash-stat-item"
                                >
                                    <span class="dash-stat-name">{{ item.name }}</span>
                                    <div class="dash-stat-track">
                                        <div
                                            class="dash-stat-fill"
                                            :style="{ '--stat-pct': statPct(item.count, stats.topDevices) }"
                                        />
                                    </div>
                                    <span class="dash-stat-count">{{ item.count }}</span>
                                </div>
                            </div>

                            <div
                                v-if="stats.topDefects.length > 0"
                                class="dash-stats-col"
                            >
                                <h3 class="dash-stats-col-title">Häufige Defekte</h3>
                                <div
                                    v-for="item in stats.topDefects"
                                    :key="item.name"
                                    class="dash-stat-item"
                                >
                                    <span class="dash-stat-name">{{ item.name }}</span>
                                    <div class="dash-stat-track">
                                        <div
                                            class="dash-stat-fill"
                                            :style="{ '--stat-pct': statPct(item.count, stats.topDefects) }"
                                        />
                                    </div>
                                    <span class="dash-stat-count">{{ item.count }}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="stats.topParts.length > 0"
                            class="dash-team"
                        >
                            <h3 class="dash-team-title">Meistgenutzte Teile</h3>
                            <div class="dash-stat-list">
                                <div
                                    v-for="item in stats.topParts"
                                    :key="item.name"
                                    class="dash-stat-item"
                                >
                                    <span class="dash-stat-name">{{ item.name }}</span>
                                    <div class="dash-stat-track">
                                        <div
                                            class="dash-stat-fill"
                                            :style="{ '--stat-pct': statPct(item.count, stats.topParts) }"
                                        />
                                    </div>
                                    <span class="dash-stat-count">{{ item.count }}</span>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="stats.teamLoad.length > 1"
                            class="dash-team"
                        >
                            <h3 class="dash-team-title">Team</h3>
                            <div class="dash-team-list">
                                <div
                                    v-for="member in stats.teamLoad"
                                    :key="member.username"
                                    class="dash-team-row"
                                >
                                    <span class="dash-team-name">{{ member.displayName ?? member.username }}</span>
                                    <div class="dash-team-counts">
                                        <span
                                            v-if="member.active > 0"
                                            class="dash-badge"
                                        >{{ member.active }} aktiv</span>
                                        <span
                                            v-if="member.completed > 0"
                                            class="dash-muted"
                                        >{{ member.completed }} erledigt</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Admin catalog quick-links -->
                <div
                    v-if="isAdmin"
                    class="dash-tile"
                >
                    <div class="dash-tile-header">
                        <h2 class="dash-tile-title">Administration</h2>
                    </div>
                    <div class="dash-admin-grid">
                        <nuxt-link
                            v-for="link in adminLinks"
                            :key="link.to"
                            class="dash-admin-item"
                            :to="link.to"
                        >
                            <Icon
                                class="dash-admin-icon"
                                :name="link.icon"
                            />
                            <span class="dash-admin-label">{{ link.label }}</span>
                        </nuxt-link>
                    </div>
                </div>

                <!-- Staff quick-nav -->
                <nav
                    aria-label="Schnellzugriff"
                    class="dash-nav"
                >
                    <nuxt-link
                        class="dash-nav-item"
                        to="/staff/history"
                    >
                        <Icon
                            class="dash-nav-icon"
                            name="material-symbols:history-rounded"
                        />
                        <span class="dash-nav-label">Verlauf</span>
                        <Icon
                            class="dash-nav-arrow"
                            name="material-symbols:chevron-right-rounded"
                        />
                    </nuxt-link>
                </nav>
            </template>

            <!-- ── Customer ── -->
            <template v-else>
                <div class="dash-tile">
                    <div class="dash-tile-header">
                        <h2 class="dash-tile-title">Meine Anfragen</h2>
                        <ui-button
                            href="/request/new"
                            size="S"
                        >
                            Neue Anfrage
                        </ui-button>
                    </div>

                    <div
                        v-if="pending"
                        aria-busy="true"
                        class="dash-req-list"
                    >
                        <div
                            v-for="i in 3"
                            :key="i"
                            class="dash-req-row dash-req-row--skeleton"
                        >
                            <div class="dash-req-body">
                                <div class="skel skel--subject"/>
                                <div class="skel skel--meta"/>
                            </div>
                            <div class="skel skel--chip"/>
                        </div>
                    </div>

                    <div
                        v-else-if="customerRequests.length > 0"
                        class="dash-req-list"
                    >
                        <nuxt-link
                            v-for="r in customerRequests"
                            :key="r.id"
                            :aria-label="`Anfrage öffnen: ${ r.subject }`"
                            class="dash-req-row"
                            :to="`/request/${ r.id }`"
                        >
                            <div class="dash-req-body">
                                <span class="dash-req-subject">{{ r.subject }}</span>
                                <span
                                    v-if="r.deviceName || r.deviceBrand"
                                    class="dash-req-meta"
                                >{{ [r.deviceName, r.deviceBrand].filter(Boolean).join(' · ') }}</span>
                            </div>
                            <ui-status :status="resolveDisplayStatus(r)"/>
                        </nuxt-link>
                    </div>

                    <div
                        v-else-if="!pending"
                        class="dash-empty"
                    >
                        <p class="dash-empty-msg">
                            Noch keine Anfragen. Erstelle deinen ersten Reparaturauftrag.
                        </p>
                        <ui-button href="/request/new">
                            Erste Anfrage erstellen
                        </ui-button>
                    </div>
                </div>

                <nav
                    v-if="!pending && customerRequests.length > 0"
                    aria-label="Schnellzugriff"
                    class="dash-nav"
                >
                    <nuxt-link
                        class="dash-nav-item"
                        to="/request"
                    >
                        <Icon
                            class="dash-nav-icon"
                            name="material-symbols:list-alt-rounded"
                        />
                        <span class="dash-nav-label">Alle Anfragen</span>
                        <Icon
                            class="dash-nav-arrow"
                            name="material-symbols:chevron-right-rounded"
                        />
                    </nuxt-link>
                </nav>
            </template>
        </div>
    </common-page>
</template>

<script lang="ts" setup>
import { RepairRequestStatus } from '@prisma/client';
import { useStore } from '~/store';
import type { RepairRequestWithRelationsType } from '~~/types/req';
import type { DashboardStats } from '~~/types/stats';

const store = useStore();

const isStaff = computed(() => !!(store.me?.isStaff || store.me?.isAdmin));
const isAdmin = computed(() => !!store.me?.isAdmin);

const endpoint = computed(() => isStaff.value ? '/api/v1/staff/request' : '/api/v1/user/request');

const { data: requests, pending } = useFetch<RepairRequestWithRelationsType[]>(endpoint);

const waitingCount = computed(() => requests.value?.filter(r => r.status === RepairRequestStatus.WAITING_FOR_REVIEW).length ?? 0);

const inProgressCount = computed(() => requests.value?.filter(r => r.status === RepairRequestStatus.ACCEPTED ||
    r.status === RepairRequestStatus.WAITING_FOR_RESPONSE).length ?? 0);

const priorityRequests = computed(() => {
    if (!requests.value) return [];
    return [...requests.value]
        .sort((a, b) => {
            const aWeight = a.status === RepairRequestStatus.WAITING_FOR_REVIEW ? 0 : 1;
            const bWeight = b.status === RepairRequestStatus.WAITING_FOR_REVIEW ? 0 : 1;
            return aWeight - bWeight;
        })
        .slice(0, 5);
});

const customerRequests = computed(() => requests.value?.slice(0, 5) ?? []);

const stats = ref<DashboardStats | null>(null);
const statsPending = ref(false);

watch(
    isStaff,
    async val => {
        if (!val) return;
        statsPending.value = true;
        try {
            stats.value = await $fetch<DashboardStats>('/api/v1/staff/stats');
        }
        catch {
            stats.value = null;
        }
        finally {
            statsPending.value = false;
        }
    },
    { immediate: true },
);

function statPct(count: number, items: { count: number }[]): number {
    const max = items[0]?.count ?? 1;
    return Math.round((count / max) * 100);
}

const adminLinks = [
    { label: 'Geräte', to: '/admin/device', icon: 'material-symbols:devices-rounded' },
    { label: 'Kategorien', to: '/admin/category', icon: 'material-symbols:category-rounded' },
    { label: 'Marken', to: '/admin/brand', icon: 'material-symbols:label-rounded' },
    { label: 'Schritttypen', to: '/admin/work-item-type', icon: 'material-symbols:checklist-rounded' },
    { label: 'Ersatzteile', to: '/admin/parts', icon: 'material-symbols:build-circle' },
    { label: 'Konfiguration', to: '/admin/config', icon: 'material-symbols:settings-rounded' },
] as const;

function resolveDisplayStatus(request: RepairRequestWithRelationsType) {
    const firstWorkItem = [...(request.workItems ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)[0];
    const firstWorkItemCompleted = firstWorkItem?.status === 'DONE';
    if (request.status === RepairRequestStatus.ACCEPTED && firstWorkItemCompleted) {
        return request.statusHistory?.[0]?.status ?? request.status;
    }
    return request.status;
}
</script>

<style lang="scss" scoped>
.dashboard {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: min(720px, 100%);
}

// Tile container

.dash-tile {
    overflow: hidden;
    border-radius: 8px;
    background: $darkgray875;

    &-header {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
        justify-content: space-between;

        padding: 18px 20px;

        &-left {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
    }

    &-title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: $lightgray150;
    }
}

// Badges

.dash-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
}

.dash-badge {
    padding: 3px 8px;
    border-radius: 4px;

    font-size: 11px;
    font-weight: 600;
    color: $lightgray200;

    background: $darkgray800;

    &--urgent {
        color: $warning500;
        background: rgb(187 157 88 / 15%);
    }
}

.dash-muted {
    font-size: 12px;
    color: $lightgray400;
}

// Request rows

.dash-req-list {
    border-top: 1px solid $darkgray800;
}

.dash-req-row {
    display: flex;
    gap: 16px;
    align-items: center;

    padding: 11px 20px;

    color: $lightgray150;
    text-decoration: none;

    & + & {
        border-top: 1px solid $darkgray800;
    }

    @include pc {
        transition: background 0.15s;
    }

    @include hover {
        &:hover {
            background: $darkgray850;
        }
    }

    &:focus-visible {
        outline: 2px solid $primary500;
        outline-offset: -2px;
    }

    &--skeleton {
        pointer-events: none;
    }
}

.dash-req-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
}

.dash-req-subject {
    overflow: hidden;

    font-size: 13px;
    font-weight: 600;
    color: $lightgray150;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dash-req-meta {
    overflow: hidden;

    font-size: 11px;
    color: $lightgray400;
    text-overflow: ellipsis;
    white-space: nowrap;
}

// Empty state

.dash-empty {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;

    padding: 20px;
    border-top: 1px solid $darkgray800;

    &-msg {
        margin: 0;
        font-size: 13px;
        line-height: 1.5;
        color: $lightgray400;
    }
}

// Admin quick-links grid

.dash-admin-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;

    border-top: 1px solid $darkgray800;

    background: $darkgray800;

    @include mobile {
        grid-template-columns: repeat(2, 1fr);
    }
}

.dash-admin-item {
    display: flex;
    gap: 10px;
    align-items: center;

    padding: 14px 16px;

    color: $lightgray200;
    text-decoration: none;

    background: $darkgray875;

    @include pc {
        transition: background 0.15s;
    }

    @include hover {
        &:hover {
            background: $darkgray850;
        }
    }

    &:focus-visible {
        outline: 2px solid $primary500;
        outline-offset: -2px;
    }
}

.dash-admin-icon {
    flex-shrink: 0;
    color: $lightgray400;
}

.dash-admin-label {
    font-size: 12px;
    font-weight: 600;
}

// Quick-nav links

.dash-nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.dash-nav-item {
    display: flex;
    gap: 12px;
    align-items: center;

    padding: 14px 16px;
    border-radius: 8px;

    color: $lightgray200;
    text-decoration: none;

    @include pc {
        transition: background 0.15s;
    }

    @include hover {
        &:hover {
            background: $darkgray875;
        }
    }

    &:focus-visible {
        outline: 2px solid $primary500;
        outline-offset: -2px;
    }
}

.dash-nav-icon {
    flex-shrink: 0;
    color: $lightgray400;
}

.dash-nav-label {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
}

.dash-nav-arrow {
    flex-shrink: 0;
    color: $lightgray400;
}

// Skeleton shimmer

.skel {
    border-radius: 4px;
    background: linear-gradient(
        90deg,
        $darkgray850 25%,
        $darkgray800 50%,
        $darkgray850 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;

    &--subject {
        max-width: 60%;
        height: 13px;
    }

    &--meta {
        max-width: 40%;
        height: 11px;
    }

    &--chip {
        flex-shrink: 0;
        width: 90px;
        height: 22px;
        border-radius: 8px;
    }

    @media (prefers-reduced-motion: reduce) {
        background: $darkgray850;
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

// Stats section

.dash-stats-body {
    padding: 16px 20px;
    border-top: 1px solid $darkgray800;
}

.dash-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @include mobile {
        grid-template-columns: 1fr;
        gap: 20px;
    }
}

.dash-stats-col-title {
    margin: 0 0 10px;

    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.dash-stat-item {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 5px 0;

    &--skeleton {
        pointer-events: none;
    }
}

.dash-stat-name {
    overflow: hidden;
    flex-shrink: 0;

    width: 100px;

    font-size: 12px;
    font-weight: 500;
    color: $lightgray200;
    text-overflow: ellipsis;
    white-space: nowrap;

    @include mobile {
        width: 80px;
    }
}

.dash-stat-track {
    overflow: hidden;
    flex: 1;

    height: 3px;
    border-radius: 4px;

    background: $darkgray800;
}

.dash-stat-fill {
    transform-origin: left;
    transform: scaleX(calc(var(--stat-pct, 0) / 100));

    width: 100%;
    height: 100%;
    border-radius: 4px;

    opacity: 0.6;
    background: $primary500;

    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
}

.dash-stat-count {
    flex-shrink: 0;

    width: 24px;

    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
    text-align: right;
}

// Team section

.dash-team {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid $darkgray800;
}

.dash-team-title {
    margin: 0 0 10px;

    font-size: 11px;
    font-weight: 600;
    color: $lightgray400;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.dash-team-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.dash-team-row {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;

    padding: 4px 0;
}

.dash-team-name {
    overflow: hidden;

    font-size: 12px;
    font-weight: 500;
    color: $lightgray200;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.dash-team-counts {
    display: flex;
    flex-shrink: 0;
    gap: 8px;
    align-items: center;
}

// Skeleton extras for stats

.skel--col-title {
    max-width: 80px;
    height: 10px;
    margin-bottom: 10px;
}

.skel--stat-name {
    flex-shrink: 0;
    width: 90px;
    height: 12px;
}

.skel--stat-bar {
    flex: 1;
    height: 3px;
    border-radius: 4px;
}

.skel--stat-count {
    flex-shrink: 0;
    width: 20px;
    height: 11px;
}
</style>
