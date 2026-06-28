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

            <!-- Hero: split layout — content left, screenshot right -->
            <common-neon-runner-container
                as="section"
                class="landing_hero"
                tone="info"
            >
                <div class="landing_hero-inner">
                    <div class="landing_hero-content">
                        <h1
                            class="landing_title"
                            data-hero-item
                        >
                            Alles zu deinem Serviceauftrag in einer klaren Ansicht.
                        </h1>
                        <p
                            class="landing_subtitle"
                            data-hero-item
                        >
                            ProductManager verbindet Kundenkommunikation, Reparaturverlauf und Benachrichtigungen in einem Ablauf. Mitarbeiter und Kunden sehen sofort, was als Nächstes ansteht.
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
                    </div>
                    <div
                        class="landing_hero-visual"
                        data-hero-item
                    >
                        <div class="landing_hero-frame">
                            <img
                                alt="Auftragsverwaltung"
                                class="landing_hero-img"
                                src="/docs/repair-request.png"
                            >
                            <div class="landing_hero-vignette"/>
                        </div>
                    </div>
                </div>
            </common-neon-runner-container>

            <!-- Features: bento-style — first card spans two rows -->
            <common-neon-runner-container
                as="section"
                class="landing_section landing_section--features"
                data-reveal
                tone="primary"
            >
                <h3 class="landing_section-title">Funktionen auf einen Blick</h3>
                <p class="landing_section-subtitle">
                    Klare Statuswechsel, direkte Kommunikation und eine lückenlose Verlaufshistorie. Alles an einem Ort.
                </p>
                <div class="landing_feature-grid">
                    <home-feature-card
                        v-for="(feature, index) in features"
                        :key="feature.title"
                        :description="feature.description"
                        :icon="feature.icon"
                        :large="index === 0"
                        :points="feature.points"
                        :title="feature.title"
                    />
                </div>
            </common-neon-runner-container>

            <!-- Previews: asymmetric — first item spans two rows -->
            <common-neon-runner-container
                as="section"
                class="landing_section"
                data-reveal
                tone="secondary"
            >
                <h3 class="landing_section-title">Das Tool in Aktion</h3>
                <div class="landing_preview-grid">
                    <home-image-placeholder
                        v-for="(preview, index) in previews"
                        :key="preview.label"
                        :caption="preview.caption"
                        :featured="index === 0"
                        :image="preview.image"
                        :label="preview.label"
                        :title="preview.title"
                    />
                </div>
            </common-neon-runner-container>

            <!-- CTA: centered -->
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
        description: 'Kunden und Mitarbeiter kommunizieren über einen dedizierten Chatraum pro Auftrag. Der Gesprächsverlauf bleibt immer erhalten.',
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
        caption: 'Offene Aufträge, Prioritäten und aktueller Stand. Auf einen Blick.',
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

    // Cursor-driven parallax — uses CSS `translate` individual property
    // which composes with animejs transforms without conflict
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

    // Hero entrance — title, subtitle, actions, then visual
    animate(heroItems, {
        opacity: [0, 1],
        translateY: [26, 0],
        duration: 820,
        delay: stagger(120, { start: 120 }),
        ease: 'outExpo',
    });

    // Section-level reveals on scroll
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

    // Feature card stagger — fires when grid enters viewport
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

    // Split hero layout
    &_hero {
        &-inner {
            display: grid;
            grid-template-columns: 3fr 2fr;
            gap: 40px;
            align-items: center;
        }

        &-content {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        &-frame {
            position: relative;

            overflow: hidden;

            border-radius: 14px;

            background: $darkgray875;
            box-shadow:
                0 0 0 1px varToRgba(info500, 0.22),
                0 28px 56px -20px varToRgba(info700, 0.3);
        }

        &-img {
            display: block;
            width: 100%;
            object-fit: cover;
            object-position: top;
        }

        &-vignette {
            pointer-events: none;
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, transparent 52%, varToRgba(darkgray900, 0.9) 100%);
        }
    }

    &_title {
        margin: 0;

        font-size: 44px;
        line-height: 1.1;
        color: $lightgray0;
        text-wrap: balance;
    }

    &_subtitle {
        max-width: 520px;
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

    // Bento feature grid: first card spans both rows
    &_feature-grid {
        display: grid;
        grid-template-columns: 1.6fr 1fr;
        grid-template-rows: auto auto;
        gap: 14px;

        > :first-child {
            grid-row: span 2;
        }
    }

    // Asymmetric preview grid: first item spans both rows
    &_preview-grid {
        display: grid;
        grid-template-columns: 1.7fr 1fr;
        grid-template-rows: auto auto;
        gap: 14px;

        > :first-child {
            grid-row: span 2;
        }
    }

    @media (prefers-reduced-motion: no-preference) {
        &_section {
            opacity: 0;
        }

        &_title,
        &_subtitle,
        &_actions,
        &_hero-visual {
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

        &_hero-inner {
            grid-template-columns: 1fr;
        }

        &_hero-visual {
            display: none;
        }

        &_hero,
        &_section {
            padding: 20px;
        }

        &_title {
            font-size: 32px;
        }

        &_subtitle {
            max-width: none;
        }

        &_feature-grid {
            grid-template-columns: 1fr;

            > :first-child {
                grid-row: span 1;
            }
        }

        &_preview-grid {
            grid-template-columns: 1fr;

            > :first-child {
                grid-row: span 1;
            }
        }
    }
}
</style>
