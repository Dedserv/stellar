<template>
  <article class="strength-card">
    <h4 class="strength-card__title">{{ item.title }}</h4>
    <p class="strength-card__description">{{ item.description }}</p>

    <ResultSubheading title="Как проявляется" />
    <p class="strength-card__text">{{ item.manifestation }}</p>

    <ResultCallout variant="tip" :text="item.howToAmplify" />
  </article>
</template>

<script setup lang="ts">
  import type { ArchetypeStrength } from '~/types/personality';

  defineProps<{
    item: ArchetypeStrength;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .strength-card + .strength-card {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .strength-card__title {
    margin: 0 0 0.6rem;
    font-size: 1.4rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .strength-card__description,
  .strength-card__text {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.55;
    color: $primaryWhite;
  }

  .strength-card__text {
    margin-top: 0.4rem;
  }
</style>
