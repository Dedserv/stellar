import type { Ref } from 'vue';

const DEFAULT_SELECTOR = '.archetype-hero, .result-section, .paywall-block, .share-section';
const PAID_SELECTOR =
  '#strengths, #growth, #love, #career, #self, #conflicts, #friendship, #decisions';

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
  let observer: IntersectionObserver | null = null;

  function cleanup() {
    observer?.disconnect();
    observer = null;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function animateIn(el: Element) {
    $gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: 'auto',
    });
  }

  function observeTargets(targets: Element[]) {
    if (!targets.length) return;

    if (prefersReducedMotion()) {
      $gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    $gsap.set(targets, { opacity: 0, y: 20 });

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            animateIn(entry.target);
            observer?.unobserve(entry.target);
          }
        },
        { threshold: 0.15 }
      );
    }

    for (const el of targets) {
      observer.observe(el);
    }
  }

  function revealSections(customSelector?: string) {
    if (!import.meta.client || !containerRef.value) return;

    const targets = [
      ...containerRef.value.querySelectorAll(customSelector ?? selector),
    ];
    observeTargets(targets);
  }

  function resetAndRevealAll() {
    if (!import.meta.client || !containerRef.value) return;
    cleanup();
    revealSections();
  }

  watch(
    isReady,
    (ready) => {
      if (!ready) return;
      nextTick(() => resetAndRevealAll());
    },
    { immediate: true }
  );

  for (const triggerRef of options?.watchRefs ?? []) {
    watch(triggerRef, (active) => {
      if (!active || !isReady.value) return;
      nextTick(() => {
        if (!containerRef.value) return;
        const targets = [...containerRef.value.querySelectorAll(PAID_SELECTOR)];
        observeTargets(targets);
      });
    });
  }

  onBeforeUnmount(() => {
    cleanup();
  });
}
