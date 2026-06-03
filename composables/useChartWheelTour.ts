import type { AstroApiResponse } from '~/types/natal';
import type { ChartWheelHighlightTarget, ChartWheelTourStepId } from '~/types/chartWheel';
import {
  WHEEL_TOUR_AUTO_DELAY_MS,
  WHEEL_TOUR_STEP_COPY,
  WHEEL_TOUR_STEP_IDS,
  WHEEL_TOUR_STORAGE_KEY,
  WHEEL_TOUR_TITLE_FALLBACK,
} from '~/constants/chartWheelTourSteps';
import { signLabelRu, signSymbolByIndex } from '~/constants/chartWheelSymbols';

const SCROLL_OFFSET_PX = 134;

export function useChartWheelTour(data: Ref<AstroApiResponse | null | undefined>) {
  const isActive = ref(false);
  const currentStep = ref(0);
  const showCompleteToast = ref(false);

  const stepCount = WHEEL_TOUR_STEP_IDS.length;

  const highlightTarget = computed<ChartWheelHighlightTarget | null>(() => {
    if (!isActive.value) return null;
    return WHEEL_TOUR_STEP_IDS[currentStep.value] ?? null;
  });

  const currentStepCopy = computed(() => WHEEL_TOUR_STEP_COPY[currentStep.value]);

  const currentTitle = computed(() => {
    const stepId = WHEEL_TOUR_STEP_IDS[currentStep.value];
    const chart = data.value;
    if (!stepId || !chart) return WHEEL_TOUR_TITLE_FALLBACK.wheel;

    if (stepId === 'wheel') return WHEEL_TOUR_TITLE_FALLBACK.wheel;

    if (stepId === 'sun') {
      const sun = chart.planets?.find((p) => p.name === 'sun');
      if (!sun?.sign) return WHEEL_TOUR_TITLE_FALLBACK.sun;
      const sym = signSymbolByIndex(sun.signIndex);
      const label = signLabelRu(sun.sign);
      return sym && label ? `Солнце в ${sym} ${label}` : WHEEL_TOUR_TITLE_FALLBACK.sun;
    }

    if (stepId === 'moon') {
      const moon = chart.planets?.find((p) => p.name === 'moon');
      if (!moon?.sign) return WHEEL_TOUR_TITLE_FALLBACK.moon;
      const sym = signSymbolByIndex(moon.signIndex);
      const label = signLabelRu(moon.sign);
      return sym && label ? `Луна в ${sym} ${label}` : WHEEL_TOUR_TITLE_FALLBACK.moon;
    }

    const asc = chart.ascendant;
    if (!asc?.sign) return WHEEL_TOUR_TITLE_FALLBACK.ascendant;
    const sym = signSymbolByIndex(asc.signIndex);
    const label = signLabelRu(asc.sign);
    return sym && label ? `Асцендент в ${sym} ${label}` : WHEEL_TOUR_TITLE_FALLBACK.ascendant;
  });

  const isLastStep = computed(() => currentStep.value >= stepCount - 1);
  const isFirstStep = computed(() => currentStep.value <= 0);

  function readCompleted(): boolean {
    if (!import.meta.client) return false;
    try {
      const raw = localStorage.getItem(WHEEL_TOUR_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as { completed?: boolean };
      return Boolean(parsed.completed);
    } catch {
      return false;
    }
  }

  function markCompleted() {
    if (!import.meta.client) return;
    try {
      localStorage.setItem(
        WHEEL_TOUR_STORAGE_KEY,
        JSON.stringify({ completed: true, completedAt: new Date().toISOString() })
      );
    } catch {
      /* ignore quota */
    }
  }

  function scrollToLegend() {
    if (!import.meta.client) return;
    const el = document.getElementById('chart-wheel-legend');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function startTour() {
    currentStep.value = 0;
    isActive.value = true;
    showCompleteToast.value = false;
  }

  function closeTour(options: { completed?: boolean; showToast?: boolean } = {}) {
    isActive.value = false;
    if (options.completed) {
      markCompleted();
      if (options.showToast) {
        showCompleteToast.value = true;
        window.setTimeout(() => {
          showCompleteToast.value = false;
        }, 3000);
      }
      scrollToLegend();
    }
  }

  function next() {
    if (isLastStep.value) {
      closeTour({ completed: true, showToast: true });
      return;
    }
    currentStep.value += 1;
  }

  function prev() {
    if (!isFirstStep.value) currentStep.value -= 1;
  }

  function skip() {
    closeTour({ completed: true, showToast: false });
  }

  let autoTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleAutoStart() {
    if (!import.meta.client || readCompleted()) return;
    if (autoTimer) clearTimeout(autoTimer);
    autoTimer = setTimeout(() => {
      if (!readCompleted() && data.value) startTour();
    }, WHEEL_TOUR_AUTO_DELAY_MS);
  }

  watch(
    () => data.value,
    (chart) => {
      if (chart) scheduleAutoStart();
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (autoTimer) clearTimeout(autoTimer);
  });

  return {
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
    closeTour,
    scrollToLegend,
  };
}
