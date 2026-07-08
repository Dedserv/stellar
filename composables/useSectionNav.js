export function useSectionNav(itemsSource, options = {}) {
  const offset = options.offset ?? 134;
  const items = computed(() => toValue(itemsSource));
  const activeId = ref(items.value[0]?.id ?? '');

  let observer = null;

  function scrollToSection(id) {
    const element = document.getElementById(id);
    if (!element) return;

    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
    activeId.value = id;
  }

  function setupObserver() {
    if (!import.meta.client) return;

    observer?.disconnect();

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          activeId.value = visible.target.id;
        }
      },
      { rootMargin: `-${offset}px 0px -55% 0px`, threshold: [0.2, 0.5, 0.8] }
    );

    for (const item of items.value) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
  }

  watch(items, () => {
    if (!items.value.some((item) => item.id === activeId.value)) {
      activeId.value = items.value[0]?.id ?? '';
    }
    nextTick(() => setupObserver());
  });

  if (options.ready) {
    watch(
      () => toValue(options.ready),
      (ready) => {
        if (ready) nextTick(() => setupObserver());
      },
      { immediate: true }
    );
  }

  onMounted(() => {
    setupObserver();
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { activeId, scrollToSection };
}
