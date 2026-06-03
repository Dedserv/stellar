<template>
  <div class="chart-wheel-guide" :class="{ 'chart-wheel-guide--tour-active': isActive }">
    <div class="chart-wheel-guide__main">
      <div class="chart-wheel-guide__stage">
        <ChartWheel
          :data="data"
          :highlight-target="effectiveHighlight"
          :dimmed="isActive"
          @select-planet="$emit('select-planet', $event)"
        >
          <template #overlay>
            <ChartWheelHelpButton :disabled="isActive" @click="startTour()" />
            <ChartWheelTourPanel
              v-if="isDesktop"
              :open="isActive"
              :title="currentTitle"
              :body="currentStepCopy?.body ?? ''"
              :current-step="currentStep"
              :step-count="stepCount"
              :is-last-step="isLastStep"
              :is-first-step="isFirstStep"
              @next="next()"
              @prev="prev()"
              @skip="skip()"
            />
          </template>
        </ChartWheel>
      </div>
    </div>

    <ChartWheelLegend
      :is-open="isLegendOpen"
      :enable-hover="isDesktop && !isActive"
      @toggle="toggleLegendOpen()"
      @hover="setLegendHover($event)"
    />

    <ChartWheelTourSheet
      v-if="!isDesktop"
      :open="isActive"
      :title="currentTitle"
      :body="currentStepCopy?.body ?? ''"
      :current-step="currentStep"
      :step-count="stepCount"
      :is-last-step="isLastStep"
      @next="next()"
      @prev="prev()"
      @skip="skip()"
    />

    <ChartWheelTourToast :visible="showCompleteToast" />
  </div>
</template>

<script setup lang="ts">
  import type { AstroApiResponse } from '~/types/natal';
  import type { ChartWheelHighlightTarget } from '~/types/chartWheel';
  import { useMediaQuery, useEventListener } from '@vueuse/core';

  const props = defineProps<{
    data: AstroApiResponse;
  }>();

  defineEmits<{
    'select-planet': [payload: { name: string; label: string }];
  }>();

  const dataRef = toRef(props, 'data');

  const {
    isOpen: isLegendOpen,
    hoverHighlight: legendHoverHighlight,
    toggleOpen: toggleLegendOpen,
    setHoverHighlight: setLegendHover,
  } = useChartWheelLegend();

  const {
    isActive,
    currentStep,
    stepCount,
    highlightTarget,
    currentTitle,
    currentStepCopy,
    isLastStep,
    isFirstStep,
    showCompleteToast,
    startTour,
    next,
    prev,
    skip,
  } = useChartWheelTour(dataRef);

  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const effectiveHighlight = computed<ChartWheelHighlightTarget | null>(() => {
    if (isActive.value) return highlightTarget.value;
    return legendHoverHighlight.value;
  });

  useEventListener('keydown', (event: KeyboardEvent) => {
    if (!isActive.value || !isDesktop.value) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      next();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      prev();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      skip();
    }
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-guide {
    width: 100%;
  }

  .chart-wheel-guide__main {
    display: flex;
    justify-content: center;
    width: 100%;
    overflow: visible;
  }

  /* Обёртка = ровно размер колеса; panel absolute растёт вправо от неё */
  .chart-wheel-guide__stage {
    position: relative;
    flex-shrink: 0;
    max-width: 100%;
  }

  .chart-wheel-guide__stage :deep(.chart-wheel) {
    margin-bottom: 0;
  }
</style>
