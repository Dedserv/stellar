<template>
  <section :id="id" class="result-section">
    <h3 class="result-section__title">{{ title }}</h3>
    <div class="result-section__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    id?: string;
    title: string;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .result-section {
    margin-bottom: 2.4rem;
    padding: 1.6rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .result-section__title {
    margin: 0 0 1.2rem;
    font-size: 1.5rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .result-section__body {
    color: $primaryWhite;
    font-size: 1.4rem;
    line-height: 1.55;
  }
</style>
