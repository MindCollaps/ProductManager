<template>
    <article
        class="home-feature-card"
        :class="{ 'home-feature-card--large': large }"
    >
        <div class="home-feature-card_icon-wrap">
            <div class="home-feature-card_icon">
                <Icon :name="icon"/>
            </div>
        </div>
        <h4 class="home-feature-card_title">{{ title }}</h4>
        <p class="home-feature-card_description">{{ description }}</p>
        <ul class="home-feature-card_list">
            <li
                v-for="point in points"
                :key="point"
                class="home-feature-card_list-item"
            >
                {{ point }}
            </li>
        </ul>
    </article>
</template>

<script setup lang="ts">
defineProps<{
    title: string;
    description: string;
    points: readonly string[];
    icon: string;
    large?: boolean;
}>();
</script>

<style scoped lang="scss">
.home-feature-card {
    position: relative;

    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 10px;

    min-height: 240px;
    padding: 20px;
    border-radius: 14px;

    background: linear-gradient(160deg, varToRgba(darkgray875, 0.95), varToRgba(darkgray950, 0.95));
    box-shadow: 0 18px 30px -22px varToRgba(info500, 0.55);

    @include pc {
        transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease-out;
    }

    &::before {
        content: none;
    }

    &::after {
        pointer-events: none;
        content: '';

        position: absolute;
        inset: 0;

        border-radius: inherit;

        opacity: 0.8;
        background:
            radial-gradient(130px 26px at 6% 0%, varToRgba(info300, 0.36), transparent 72%),
            radial-gradient(120px 24px at 93% 100%, varToRgba(primary300, 0.28), transparent 72%);
    }

    > * {
        position: relative;
        z-index: 1;
    }

    @include hover {
        transform: translateY(-2px);
        box-shadow: 0 0 0 1px varToRgba(info300, 0.24), 0 28px 40px -30px varToRgba(info500, 0.7);
    }

    &--large {
        gap: 14px;

        .home-feature-card_icon-wrap {
            padding: 10px;
        }

        .home-feature-card_icon {
            width: 34px;
            height: 34px;
            font-size: 26px;
        }

        .home-feature-card_title {
            font-size: 21px;
        }

        .home-feature-card_description {
            font-size: 15px;
            line-height: 1.6;
        }
    }

    &_icon-wrap {
        width: fit-content;
        padding: 8px;
        border-radius: 10px;
        background: varToRgba(info500, 0.1);
    }

    &_icon {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 28px;
        height: 28px;

        font-size: 22px;
        color: $info300;
    }

    &_title {
        margin: 0;
        font-size: 19px;
        color: $lightgray0;
    }

    &_description {
        margin: 0;
        line-height: 1.5;
        color: $lightgray200;
    }

    &_list {
        display: flex;
        flex-direction: column;
        gap: 6px;

        margin: 4px 0 0;
        padding-left: 18px;

        color: $lightgray300;
    }

    &_list-item {
        line-height: 1.4;
    }
}
</style>
