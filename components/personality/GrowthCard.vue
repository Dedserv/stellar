<template>
  <article class="growth-card">
    <h4 class="growth-card__title">{{ item.title }}</h4>
    <p class="growth-card__description">{{ item.description }}</p>

    <ResultCallout variant="action" :text="item.actionStep" />

    <ResultSubheading title="Что изменится" />
    <p class="growth-card__outcome">{{ item.expectedOutcome }}</p>
  </article>
</template>

<script setup lang="ts">
  import type { ArchetypeGrowth } from '~/types/personality';

  defineProps<{
    item: ArchetypeGrowth;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .growth-card + .growth-card {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .growth-card__title {
    margin: 0 0 0.6rem;
    font-size: 1.4rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .growth-card__description,
  .growth-card__outcome {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.55;
    color: $primaryWhite;
  }

  .growth-card__outcome {
    margin-top: 0.4rem;
    font-style: italic;
    color: $whiteOrange;
  }
</style>
