import type { ChartWheelHighlightTarget, ChartWheelLegendGroupId } from '~/types/chartWheel';

const SCROLL_OFFSET_PX = 134;

export function useChartWheelLegend() {
  const isOpen = ref(false);
  const hoverHighlight = ref<ChartWheelHighlightTarget | null>(null);

  function toggleOpen() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
      nextTick(() => scrollToLegend());
    }
  }

  function scrollToLegend() {
    if (!import.meta.client) return;
    const el = document.getElementById('chart-wheel-legend');
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET_PX;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }

  function setHoverHighlight(target: ChartWheelHighlightTarget | null) {
    hoverHighlight.value = target;
  }

  function clearHoverHighlight() {
    hoverHighlight.value = null;
  }

  return {
    isOpen,
    hoverHighlight,
    toggleOpen,
    scrollToLegend,
    setHoverHighlight,
    clearHoverHighlight,
  };
}

export type { ChartWheelLegendGroupId };
