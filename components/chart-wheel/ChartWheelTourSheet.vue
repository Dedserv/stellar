<template>
  <div
    v-if="open"
    class="chart-wheel-tour-sheet"
    role="dialog"
    aria-modal="false"
    aria-labelledby="chart-wheel-tour-title"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="chart-wheel-tour-sheet__handle" aria-hidden="true" />
    <ChartWheelTourStep
      :title="title"
      :body="body"
      :current-step="currentStep"
      :step-count="stepCount"
    />
    <div class="chart-wheel-tour-sheet__actions">
      <button type="button" class="chart-wheel-tour-sheet__skip" @click="$emit('skip')">
        Пропустить
      </button>
      <VButton type="bordered" color="secondary" rounded @click="$emit('next')">
        {{ isLastStep ? 'Понятно ✨' : 'Далее' }}
      </VButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    open: boolean;
    title: string;
    body: string;
    currentStep: number;
    stepCount: number;
    isLastStep: boolean;
  }>();

  const emit = defineEmits<{
    next: [];
    prev: [];
    skip: [];
  }>();

  let touchStartX = 0;

  function onTouchStart(event: TouchEvent) {
    touchStartX = event.changedTouches[0]?.clientX ?? 0;
  }

  function onTouchEnd(event: TouchEvent) {
    const endX = event.changedTouches[0]?.clientX ?? 0;
    const delta = endX - touchStartX;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) emit('next');
    else emit('prev');
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-tour-sheet {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    padding: 0.8rem 1.6rem calc(1.6rem + env(safe-area-inset-bottom, 0px));
    background: $darkGrayBlue;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1.2rem 1.2rem 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.35);
  }

  .chart-wheel-tour-sheet__handle {
    width: 3.2rem;
    height: 0.4rem;
    margin: 0 auto 1.2rem;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 0.2rem;
  }

  .chart-wheel-tour-sheet__actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
  }

  .chart-wheel-tour-sheet__skip {
    padding: 0.4rem 0;
    font-size: 1.2rem;
    color: $gray;
    cursor: pointer;
    background: none;
    border: none;

    &:hover {
      color: $softOrange;
      text-decoration: underline;
    }
  }
</style>
