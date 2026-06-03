<template>
  <aside
    v-if="open"
    class="chart-wheel-tour-panel"
    role="dialog"
    aria-modal="false"
    aria-labelledby="chart-wheel-tour-title"
  >
    <button type="button" class="chart-wheel-tour-panel__skip" @click="$emit('skip')">
      <UseIcon name="close" :width="1.4" :height="1.4" />
    </button>
    <ChartWheelTourStep
      :title="title"
      :body="body"
      :current-step="currentStep"
      :step-count="stepCount"
    />
    <div class="chart-wheel-tour-panel__actions">
      <div class="chart-wheel-tour-panel__nav">
        <VButton
          v-if="!isFirstStep"
          type="bordered"
          color="secondary"
          rounded
          size="s"
          @click="$emit('prev')"
        >
          Назад
        </VButton>
        <VButton
          class="chart-wheel-tour-panel__next"
          type="bordered"
          color="secondary"
          size="s"
          rounded
          @click="$emit('next')"
        >
          {{ isLastStep ? 'Понятно ✨' : 'Далее →' }}
        </VButton>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
  defineProps<{
    open: boolean;
    title: string;
    body: string;
    currentStep: number;
    stepCount: number;
    isLastStep: boolean;
    isFirstStep: boolean;
  }>();

  defineEmits<{
    next: [];
    prev: [];
    skip: [];
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-tour-panel {
    display: none;
    padding: 1.6rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.8rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

    @mixin desktop {
      display: block;
      position: absolute;
      top: 50%;
      left: calc(100% + 1.6rem);
      z-index: 3;
      width: 22rem;
      max-width: min(22rem, 36vw);
      transform: translateY(-50%);
    }
  }

  .chart-wheel-tour-panel__actions {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .chart-wheel-tour-panel__skip {
    position: absolute;
    top: 1.6rem;
    right: 1.6rem;
    padding: 0;
    color: $gray;
    cursor: pointer;
    background: transparent;
    border: none;

    &:hover {
      color: $softOrange;
      text-decoration: underline;
    }
  }

  .chart-wheel-tour-panel__nav {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 2rem;
  }

  .chart-wheel-tour-panel__next {
    margin-left: auto;
  }
</style>
