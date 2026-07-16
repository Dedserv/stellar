<template>
  <article
    class="strength-card"
    :class="{ 'strength-card--gift': variant === 'gift' }"
  >
    <div v-if="variant === 'gift' && icon" class="strength-card__icon" aria-hidden="true">
      <ResultSectionIcon :name="icon" />
    </div>

    <div class="strength-card__body">
      <h4 class="strength-card__title">{{ item.title }}</h4>
      <p class="strength-card__description">{{ item.description }}</p>

      <template v-if="variant === 'full'">
        <ResultSubheading title="Как проявляется" />
        <p class="strength-card__text">{{ item.manifestation }}</p>
        <ResultCallout variant="tip" :text="item.howToAmplify" />
      </template>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type { ArchetypeStrength } from '~/types/personality';
  import type { ResultIconName } from '~/components/personality/ResultSectionIcon.vue';

  withDefaults(
    defineProps<{
      item: ArchetypeStrength;
      variant?: 'full' | 'gift';
      icon?: ResultIconName | '';
    }>(),
    {
      variant: 'full',
      icon: '',
    }
  );
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .strength-card + .strength-card {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .strength-card--gift {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    margin-top: 0;
    padding: 2rem 1.6rem;
    border-top: none;
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    text-align: center;

    @mixin desktop {
      flex-direction: row;
      align-items: flex-start;
      text-align: left;
    }
  }

  .strength-card--gift + .strength-card--gift {
    margin-top: 1.6rem;
    padding-top: 2rem;
  }

  .strength-card__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    background: rgba(233, 168, 124, 0.12);
    color: $softOrange;
    animation: strength-icon-pulse 0.4s ease-out;
  }

  .strength-card__icon :deep(.result-icon) {
    width: 2rem;
    height: 2rem;
  }

  @keyframes strength-icon-pulse {
    0% {
      transform: scale(0.9);
    }
    60% {
      transform: scale(1.06);
    }
    100% {
      transform: scale(1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .strength-card__icon {
      animation: none;
    }
  }

  .strength-card__body {
    min-width: 0;
    flex: 1;
  }

  .strength-card__title {
    margin: 0 0 0.6rem;
    font-size: 1.4rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .strength-card--gift .strength-card__title {
    font-size: 1.8rem;
    color: $softOrange;
  }

  .strength-card__description,
  .strength-card__text {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.55;
    color: $primaryWhite;
  }

  .strength-card--gift .strength-card__description {
    font-size: 1.5rem;
    line-height: 1.5;
    color: rgba(240, 236, 228, 0.85);

    @mixin mobile {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .strength-card__text {
    margin-top: 0.4rem;
  }
</style>
