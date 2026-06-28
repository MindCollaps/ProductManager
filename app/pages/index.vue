<template>
    <common-page title="ProductManager">
        <div
            ref="landingRoot"
            class="landing"
        >
            <div class="landing_background">
                <div class="landing_orb landing_orb--one neon-orb"/>
                <div class="landing_orb landing_orb--two neon-orb"/>
                <div class="landing_orb landing_orb--three neon-orb"/>
            </div>

            <common-neon-runner-container
                as="section"
                class="landing_hero"
                tone="info"
            >
                <span
                    class="landing_badge"
                    data-hero-item
                >Reparatur, Kommunikation, Fortschritt</span>
                <h2
                    class="landing_title"
                    data-hero-item
                >
                    Alles zu deinem Serviceauftrag in einer klaren Ansicht.
                </h2>
                <p
                    class="landing_subtitle"
                    data-hero-item
                >
                    ProductManager verbindet Kundenkommunikation, Reparaturverlauf und Benachrichtigungen in einem einzigen Ablauf —
                    so sehen Mitarbeiter und Kunden sofort, was als Nächstes dran ist.
                </p>
                <div
                    class="landing_actions"
                    data-hero-item
                >
                    <ui-button
                        v-if="!store.me?.loggedIn"
                        to="/signup"
                    >
                        Konto erstellen
                    </ui-button>
                    <ui-button
                        v-else-if="!store.me.isAdmin && !store.me.isStaff"
                        to="/request/new"
                    >
                        Auftrag anlegen
                    </ui-button>
                    <ui-button
                        v-if="store.me?.loggedIn && !store.me.isAdmin && !store.me.isStaff"
                        to="/request"
                        type="secondary"
                    >
                        Meine Anfragen
                    </ui-button>
                    <ui-button
                        v-if="store.me?.loggedIn && (store.me.isAdmin || store.me?.isStaff)"
                        to="/staff/request"
                        type="primary"
                    >
                        Anfragen
                    </ui-button>
                </div>
            </common-neon-runner-container>

            <common-neon-runner-container
                as="section"
                class="landing_section landing_section--features"
                data-reveal
                tone="primary"
            >
                <h3 class="landing_section-title">Funktionen auf einen Blick</h3>
                <p class="landing_section-subtitle">
                    Klare Statuswechsel, direkte Kommunikation und eine lückenlose Verlaufshistorie — alles an einem Ort.
                </p>
                <div class="landing_feature-grid">
                    <home-feature-card
                        v-for="feature in features"
                        :key="feature.title"
                        :description="feature.description"
                        :icon="feature.icon"
                        :points="feature.points"
                        :title="feature.title"
                    />
                </div>
            </common-neon-runner-container>

            <common-neon-runner-container
                as="section"
                class="landing_section"
                data-reveal
                tone="secondary"
            >
                <h3 class="landing_section-title">Das Tool in Aktion</h3>

                <div class="landing_preview-grid">
                    <home-image-placeholder
                        v-for="preview in previews"
                        :key="preview.label"
                        :caption="preview.caption"
                        :image="preview.image"
                        :label="preview.label"
                        :title="preview.title"
                    />
                </div>
            </common-neon-runner-container>

            <common-neon-runner-container
                as="section"
                class="landing_section landing_section--cta"
                data-reveal
                tone="warning"
            >
                <h3 class="landing_section-title">Bereit loszulegen?</h3>
                <p class="landing_section-subtitle">
                    Lege eine neue Anfrage an oder schau direkt in deine laufenden Aufträge.
                </p>
                <div class="landing_actions landing_actions--center">
                    <ui-button to="/request/new">Neue Anfrage starten</ui-button>
                    <ui-button
                        to="/staff/request"
                        type="secondary"
                    >
                        Team-Übersicht
                    </ui-button>
                </div>
            </common-neon-runner-container>
        </div>
    </common-page>
</template>

<script setup lang="ts">
import { animate, stagger } from 'animejs';
import HomeFeatureCard from '~/components/view/home/HomeFeatureCard.vue';
import HomeImagePlaceholder from '~/components/view/home/HomeImagePlaceholder.vue';
import { useStore } from '~/store';

const store = useStore();
const landingRoot = ref<HTMLElement | null>(null);

const features = [
    {
        title: 'Durchgängiger Reparaturablauf',
        description: 'Von der Anfrage bis zur Auslieferung bleibt jeder Schritt dokumentiert und nachvollziehbar.',
        icon: 'material-symbols:route',
        points: [
            'Statusverlauf mit genauen Zeitangaben',
            'Arbeitsschritte mit klaren Phasen',
            'Archiv für abgeschlossene Aufträge',
        ],
    },
    {
        title: 'Direkte Kommunikation',
        description: 'Kunden und Mitarbeiter kommunizieren über einen dedizierten Chatraum pro Auftrag — der Gesprächsverlauf geht nie verloren.',
        icon: 'material-symbols:forum-rounded',
        points: [
            'Echtzeit-Nachrichten ohne Seitenaktualisierung',
            'Automatische Einträge bei Statuswechseln',
            'Nur Beteiligte sehen den Chat zum jeweiligen Auftrag',
        ],
    },
    {
        title: 'Benachrichtigungen mit Kontext',
        description: 'Neue Ereignisse erscheinen sofort als Benachrichtigung und führen direkt zum zugehörigen Auftrag oder Chat.',
        icon: 'material-symbols:notifications-active-rounded',
        points: [
            'Sofortige Benachrichtigungen bei neuen Ereignissen',
            'Alle Benachrichtigungen auf einmal als gelesen markieren',
            'Direktlink zur betroffenen Anfrage oder Chat',
        ],
    },
] as const;

const previews = [
    {
        label: 'Team',
        title: 'Team-Cockpit',
        caption: 'Offene Aufträge, Prioritäten und aktueller Stand — auf einen Blick.',
        image: '/docs/repair-request.png',
    },
    {
        label: 'Kommunikation',
        title: 'Direkte Kommunikation',
        caption: 'Status, Chat und Verlauf klar strukturiert auf einer Seite.',
        image: '/docs/chat.png',
    },
    {
        label: 'Workflow',
        title: 'Reparaturschritte',
        caption: 'Diagnose, Reparatur und QA inklusive Phasenfortschritt.',
        image: '/docs/graph.png',
    },
] as const;

let cleanupPointerMove: (() => void) | null = null;

onMounted(() => {
    const root = landingRoot.value;
    if (!root) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroItems = root.querySelectorAll<HTMLElement>('[data-hero-item]');
    const revealSections = root.querySelectorAll<HTMLElement>('[data-reveal]');
    const orbs = root.querySelectorAll<HTMLElement>('.neon-orb');
    const featureGrid = root.querySelector<HTMLElement>('.landing_feature-grid');
    const previewGrid = root.querySelector<HTMLElement>('.landing_preview-grid');

    // Ambient orb float
    orbs.forEach((orb, index) => {
        animate(orb, {
            translateX: index % 2 === 0 ? 28 : -24,
            translateY: index === 1 ? -20 : 22,
            scale: index === 2 ? 1.16 : 1.08,
            duration: 4400,
            delay: index * 280,
            loop: true,
            alternate: true,
            ease: 'inOutSine',
        });
    });

    // Cursor-driven parallax layer — uses `translate` CSS individual property
    // which composes with animejs's `transform` without conflict
    const handlePointerMove = (e: PointerEvent) => {
        const cx = (e.clientX / window.innerWidth) - 0.5;
        const cy = (e.clientY / window.innerHeight) - 0.5;
        orbs.forEach((orb, i) => {
            const depth = (i + 1) * 14;
            orb.style.setProperty('--px', `${ cx * depth }px`);
            orb.style.setProperty('--py', `${ cy * depth * 0.65 }px`);
        });
    };
    root.addEventListener('pointermove', handlePointerMove, { passive: true });
    cleanupPointerMove = () => root.removeEventListener('pointermove', handlePointerMove);

    // Hero entrance
    animate(heroItems, {
        opacity: [0, 1],
        translateY: [26, 0],
        duration: 820,
        delay: stagger(120, { start: 120 }),
        ease: 'outExpo',
    });

    // Section-level reveals
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animate(entry.target as HTMLElement, {
                opacity: [0, 1],
                translateY: [34, 0],
                duration: 760,
                ease: 'outExpo',
            });
            sectionObserver.unobserve(entry.target);
        });
    }, { threshold: 0.15 });
    revealSections.forEach(target => sectionObserver.observe(target));

    // Feature card stagger — fires when grid enters viewport, staggers children
    if (featureGrid) {
        const cards = featureGrid.querySelectorAll<HTMLElement>('.home-feature-card');
        const cardObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animate(cards, {
                    opacity: [0, 1],
                    translateY: [18, 0],
                    duration: 640,
                    delay: stagger(100, { start: 200 }),
                    ease: 'outExpo',
                });
                cardObserver.disconnect();
            });
        }, { threshold: 0.1 });
        cardObserver.observe(featureGrid);
    }

    // Preview item stagger — scale + translate for distinct choreography
    if (previewGrid) {
        const previewEls = previewGrid.querySelectorAll<HTMLElement>('.home-image-placeholder');
        const previewObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                animate(previewEls, {
                    opacity: [0, 1],
                    translateY: [22, 0],
                    scale: [0.96, 1],
                    duration: 680,
                    delay: stagger(110, { start: 180 }),
                    ease: 'outExpo',
                });
                previewObserver.disconnect();
            });
        }, { threshold: 0.1 });
        previewObserver.observe(previewGrid);
    }
});

onUnmounted(() => {
    cleanupPointerMove?.();
});
</script>

<style scoped lang="scss">
.landing {
    isolation: isolate;
    position: relative;

    display: flex;
    flex-direction: column;
    gap: 38px;

    width: 100%;
    max-width: 90vw;
    margin: 0 auto;

    &_background {
        pointer-events: none;
        position: absolute;
        z-index: -1;
        inset: 0;
    }

    &_orb {
        position: absolute;
        translate: var(--px, 0) var(--py, 0);
        border-radius: 50%;
        filter: blur(18px);

        &--one {
            top: -40px;
            left: -20px;

            width: 260px;
            height: 260px;

            background: radial-gradient(circle at 30% 30%, varToRgba(info500, 0.46), varToRgba(info500, 0));
        }

        &--two {
            top: 320px;
            right: -40px;

            width: 210px;
            height: 210px;

            background: radial-gradient(circle at 30% 30%, varToRgba(primary500, 0.4), varToRgba(primary500, 0));
        }

        &--three {
            right: 26%;
            bottom: -120px;

            width: 280px;
            height: 280px;

            background: radial-gradient(circle at 30% 30%, varToRgba(secondary400, 0.32), varToRgba(secondary400, 0));
        }

        @media (pointer: fine) {
            transition: translate 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }
    }

    &_hero,
    &_section {
        width: 100%;
    }

    &_hero {
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    &_badge {
        width: fit-content;
        padding: 4px 12px;
        border: 1px solid varToRgba(info500, 0.6);
        border-radius: 999px;

        font-size: 12px;
        color: $lightgray0;
        letter-spacing: 0.04em;

        background: linear-gradient(140deg, varToRgba(info700, 0.5), varToRgba(primary500, 0.3));
    }

    &_title {
        margin: 0;

        font-size: 42px;
        line-height: 1.1;
        color: $lightgray0;
        text-wrap: balance;
    }

    &_subtitle {
        max-width: 780px;
        margin: 0;

        font-size: 16px;
        line-height: 1.6;
        color: $lightgray200;
        text-wrap: pretty;
    }

    &_actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;

        &--center {
            justify-content: center;
        }
    }

    &_section {
        display: flex;
        flex-direction: column;
        gap: 14px;

        &--features {
            margin-top: 8px;
        }

        &--cta {
            text-align: center;
        }
    }

    &_section-title {
        margin: 0;
        font-size: 28px;
        color: $lightgray0;
        text-wrap: balance;
    }

    &_section-subtitle {
        margin: 0;
        line-height: 1.55;
        color: $lightgray300;
        text-wrap: pretty;
    }

    &_feature-grid,
    &_preview-grid {
        display: grid;
        gap: 14px;
    }

    &_feature-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    &_preview-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (prefers-reduced-motion: no-preference) {
        &_section {
            opacity: 0;
        }

        &_badge,
        &_title,
        &_subtitle,
        &_actions {
            opacity: 0;
        }

        &_feature-grid :deep(.home-feature-card),
        &_preview-grid :deep(.home-image-placeholder) {
            opacity: 0;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        &_orb {
            translate: none;
            transition: none;
        }
    }

    @include mobile {
        gap: 24px;

        &_hero,
        &_section {
            padding: 20px;
        }

        &_title {
            font-size: 32px;
        }

        &_feature-grid,
        &_preview-grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>

