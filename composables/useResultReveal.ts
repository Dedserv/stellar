import type { Ref } from 'vue';

const DEFAULT_SELECTOR = '.archetype-hero, .result-section, .paywall';

export function useResultReveal(
  containerRef: Ref<HTMLElement | null>,
  isReady: Ref<boolean>,
  options?: {
    selector?: string;
    watchRefs?: Ref<boolean>[];
  }
) {
  const { $gsap } = useNuxtApp();
  const selector = options?.selector ?? DEFAULT_SELECTOR;

  function revealSections(customSelector?: string) {
    if (!import.meta.client || !containerRef.value) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = containerRef.value.querySelectorAll(customSelector ?? selector);

    if (!targets.length) return;

    if (prefersReducedMotion) {
      $gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    $gsap.fromTo(
      targets,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        stagger: 0.07,
        ease: 'power2.out',
      }
    );
  }

  watch(
    isReady,
    (ready) => {
      if (!ready) return;
      nextTick(() => revealSections());
    },
    { immediate: true }
  );

  for (const triggerRef of options?.watchRefs ?? []) {
    watch(triggerRef, (active) => {
      if (!active || !isReady.value) return;
      nextTick(() =>
        revealSections(
          '#strengths, #growth, #love, #career, #self, #conflicts, #friendship, #decisions'
        )
      );
    });
  }
}
