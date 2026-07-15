<template>
  <section class="archetype-hero">
    <div class="archetype-hero__glow" aria-hidden="true" />
    <HoroCircle compact />
    <div class="archetype-hero__content">
      <p class="archetype-hero__eyebrow">Ваш архетип</p>
      <h1 class="archetype-hero__title">{{ result.archetype }}</h1>
      <p class="archetype-hero__meta">
        <template v-if="formattedBirthDate">
          {{ result.zodiacSign }} · {{ formattedBirthDate }}
        </template>
        <template v-else>{{ result.zodiacSign }}</template>
      </p>
      <div class="archetype-hero__badges">
        <span class="archetype-hero__badge archetype-hero__badge--element">
          {{ result.element.name }}
        </span>
        <span class="archetype-hero__badge">{{ result.modality }}</span>
      </div>
      <div class="archetype-hero__share-wrap">
        <ChartShareButton
          :label="shareLabel"
          :live-message="shareLiveMessage"
          @share="$emit('share')"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { PersonalityTestResponse } from '~/types/personality';

  defineProps<{
    result: PersonalityTestResponse;
    formattedBirthDate: string;
    shareLabel?: string;
    shareLiveMessage?: string;
  }>();

  defineEmits<{ share: [] }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .archetype-hero {
    position: relative;
    overflow: hidden;
    margin: 6.4rem 0 2.4rem;
    padding: 3.2rem 1.6rem 2.4rem;
    border-radius: 0.8rem;
    background: linear-gradient(180deg, rgba(20, 21, 32, 0.92), rgba(33, 36, 41, 0.5));
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 0 40px rgba(233, 168, 124, 0.08);

    @mixin desktop {
      margin: 7rem 0 2.4rem;
    }
  }

  .archetype-hero__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(ellipse 70% 50% at 50% 0%, rgba(233, 168, 124, 0.12), transparent),
      radial-gradient(ellipse 60% 40% at 50% 100%, rgba(179, 136, 255, 0.05), transparent);
  }

  .archetype-hero__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    text-align: center;
  }

  .archetype-hero__eyebrow {
    margin: 0;
    font-size: 1.2rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: $softOrange;
  }

  .archetype-hero__title {
    margin: 0;
    font-size: 3.6rem;
    line-height: 1.1;
    font-weight: 400;
    letter-spacing: 0.02em;
    background: linear-gradient(135deg, $primaryWhite 0%, $lightGrayOrange 45%, $softOrange 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: titleShimmer 3s ease-in-out infinite alternate;

    @mixin desktop {
      font-size: 4.4rem;
    }
  }

  @keyframes titleShimmer {
    from {
      filter: brightness(1);
    }
    to {
      filter: brightness(1.15);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .archetype-hero__title {
      animation: none;
    }
  }

  .archetype-hero__meta {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 300;
    font-style: italic;
    color: $gray;
  }

  .archetype-hero__badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
  }

  .archetype-hero__badge {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: $lightGrayOrange;
    font-size: 1.2rem;

    &--element {
      border-color: $softOrangeTrans;
      background: rgba(233, 168, 124, 0.1);
      color: $softOrange;
    }
  }

  .archetype-hero__share-wrap :deep(.button) {
    border-color: rgba(233, 168, 124, 0.35);
    background: rgba(233, 168, 124, 0.06);
    color: $softOrange;
    transition:
      background 0.3s ease,
      border-color 0.3s ease;
  }

  .archetype-hero__share-wrap :deep(.button:hover) {
    border-color: $softOrangeTrans;
    background: rgba(233, 168, 124, 0.14);
  }
</style>
