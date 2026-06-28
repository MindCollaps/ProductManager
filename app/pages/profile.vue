<template>
    <common-page title="Profil">
        <div class="profile-page">
            <settings-section title="Konto">
                <settings-row label="Benutzername">
                    <span class="profile-value">{{ store.me?.username }}</span>
                </settings-row>
                <settings-row label="Rolle">
                    <span class="profile-value">{{ roleLabel }}</span>
                </settings-row>
            </settings-section>

            <div class="profile-actions">
                <ui-button
                    type="destructive"
                    @click="navigateTo('/logout')"
                >
                    Abmelden
                </ui-button>
            </div>
        </div>
    </common-page>
</template>

<script lang="ts" setup>
import { useStore } from '~/store';

const store = useStore();

const roleLabel = computed(() => {
    if (store.me?.isAdmin) return 'Administrator';
    if (store.me?.isStaff) return 'Mitarbeiter';
    return 'Kunde';
});
</script>

<style lang="scss" scoped>
.profile-page {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: min(640px, 100%);

    &-actions {
        display: flex;
        justify-content: flex-end;
    }
}

.profile-value {
    font-size: 13px;
    font-weight: 600;
    color: $lightgray200;
}
</style>
