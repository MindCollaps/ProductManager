<template>
    <article
        class="home-image-placeholder"
        :class="{ 'home-image-placeholder--featured': featured }"
    >
        <div class="home-image-placeholder_frame">
            <img
                v-if="image"
                :alt="title"
                class="home-image-placeholder_img"
                :src="image"
            >
            <div
                v-else
                class="home-image-placeholder_visual"
            >
                <div class="home-image-placeholder_visual-line"/>
                <div class="home-image-placeholder_visual-line home-image-placeholder_visual-line--short"/>
                <div class="home-image-placeholder_visual-block"/>
                <div class="home-image-placeholder_visual-line"/>
            </div>
        </div>
        <p class="home-image-placeholder_label">{{ label }}</p>
        <h4 class="home-image-placeholder_title">{{ title }}</h4>
        <p class="home-image-placeholder_caption">{{ caption }}</p>
    </article>
</template>

<script setup lang="ts">
defineProps<{
    label: string;
    title: string;
    caption: string;
    image?: string;
    featured?: boolean;
}>();
</script>

<style scoped lang="scss">
.home-image-placeholder {
    display: flex;
    flex-direction: column;
    gap: 10px;

    &--featured {
        height: 100%;

        .home-image-placeholder_frame {
            flex: 1;
            min-height: 300px;
        }
    }

    &_frame {
        position: relative;

        overflow: hidden;

        min-height: 180px;
        border-radius: 14px;

        background: $darkgray875;
        box-shadow: 0 0 0 1px varToRgba(info400, 0.15);

        &::after {
            pointer-events: none;
            content: '';

            position: absolute;
            z-index: 3;
            inset: 0;

            border-radius: inherit;

            opacity: 0.25;
            background: radial-gradient(160px 32px at 7% 0%, varToRgba(info300, 0.8), transparent 72%);
        }
    }

    &_img {
        position: absolute;
        z-index: 1;
        inset: 0;

        width: 100%;
        height: 100%;

        object-fit: cover;
        object-position: top;
    }

    &_visual {
        position: relative;
        z-index: 1;

        display: grid;
        grid-template-columns: 1fr;
        gap: 8px;

        padding: 14px;
        padding-top: 20px;
    }

    &_visual-line {
        height: 10px;
        border-radius: 6px;
        background: varToRgba(lightgray200, 0.26);

        &--short {
            width: 72%;
        }
    }

    &_visual-block {
        height: 55px;
        border-radius: 10px;
        background: linear-gradient(130deg, varToRgba(primary500, 0.3), varToRgba(info400, 0.28));
        box-shadow: inset 0 0 0 1px varToRgba(lightgray125, 0.35);
    }

    &_label {
        margin: 0;

        font-size: 11px;
        font-weight: 600;
        color: $info400;
        text-transform: uppercase;
        letter-spacing: 0.08em;
    }

    &_title {
        margin: 0;
        font-size: 17px;
        color: $lightgray0;
    }

    &_caption {
        margin: 0;
        line-height: 1.45;
        color: $lightgray300;
    }
}
</style>
