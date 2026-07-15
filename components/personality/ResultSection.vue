<template>
  <section :id="id" class="result-section">
    <div class="result-section__header">
      <div v-if="icon" class="result-section__icon" aria-hidden="true">
        <ResultSectionIcon :name="icon" />
      </div>
      <div class="result-section__heading">
        <h2 class="result-section__title">{{ title }}</h2>
        <p v-if="subtitle" class="result-section__subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="result-section__body" :class="{ 'result-section__body--card': carded }">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ResultIconName } from '~/components/personality/ResultSectionIcon.vue';

  withDefaults(
    defineProps<{
      id?: string;
      title: string;
      subtitle?: string;
      icon?: ResultIconName;
      carded?: boolean;
    }>(),
    {
      subtitle: '',
      carded: false,
    }
  );
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .result-section {
    margin-bottom: 2.4rem;
  }

  .result-section__header {
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin-bottom: 1.6rem;
  }

  .result-section__icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    background: rgba(233, 168, 124, 0.08);
    border: 1px solid rgba(233, 168, 124, 0.35);
    color: $softOrange;
  }

  .result-section__heading {
    min-width: 0;
  }

  .result-section__title {
    margin: 0;
    font-size: 2.4rem;
    font-weight: 400;
    line-height: 1.2;
    color: $lightGrayOrange;
  }

  .result-section__subtitle {
    margin: 0.4rem 0 0;
    font-size: 1.2rem;
    color: $gray;
  }

  .result-section__body {
    color: $primaryWhite;
    font-size: 1.4rem;
    line-height: 1.55;
  }

  .result-section__body--card {
    padding: 1.6rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    color: $lightGrayOrange;
    font-size: 1.6rem;
    line-height: 1.5;
  }

  .result-section__body--card :deep(p) {
    margin: 0;
  }

  .result-section__body--card :deep(p + p) {
    margin-top: 1.2rem;
  }
</style>
