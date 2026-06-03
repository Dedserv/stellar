<template>
  <div class="chart-wheel-tour-step">
    <h3 class="chart-wheel-tour-step__title">{{ title }}</h3>
    <p class="chart-wheel-tour-step__body">{{ body }}</p>
    <div class="chart-wheel-tour-step__dots" role="tablist" aria-label="Шаги тура">
      <span
        v-for="index in stepCount"
        :key="index"
        class="chart-wheel-tour-step__dot"
        :class="{ 'chart-wheel-tour-step__dot--active': index - 1 === currentStep }"
        role="presentation"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    body: string;
    currentStep: number;
    stepCount: number;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-tour-step__title {
    margin: 0 0 0.8rem;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.35;
    color: $lightGrayOrange;
  }

  .chart-wheel-tour-step__body {
    margin: 0 0 1.6rem;
    font-size: 1.3rem;
    line-height: 1.5;
    color: $gray;
  }

  .chart-wheel-tour-step__dots {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
  }

  .chart-wheel-tour-step__dot {
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
  }

  .chart-wheel-tour-step__dot--active {
    background: $softOrange;
  }
</style>
