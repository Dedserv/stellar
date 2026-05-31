const HEADER_OFFSET_PX = 82;

const NAV_OFFSET_PX = 52;

const PROGRAMMATIC_SCROLL_LOCK_MS = 900;

export function useSectionNav(items, options = {}) {
  const activeId = ref('');

  const headerOffset = options.headerOffset ?? HEADER_OFFSET_PX;

  const navOffset = options.navOffset ?? NAV_OFFSET_PX;

  const scrollOffset = headerOffset + navOffset;

  let observer = null;

  let scrollRaf = null;

  let suppressObserverUntil = 0;

  let scrollEndTimer = null;

  function resolveActiveSection() {
    if (!import.meta.client) return;

    const marker = window.scrollY + scrollOffset + 2;

    let current = items[0]?.id || '';

    for (const item of items) {
      const el = document.getElementById(item.id);

      if (!el) continue;

      const top = el.getBoundingClientRect().top + window.scrollY;

      if (top <= marker) {
        current = item.id;
      }
    }

    activeId.value = current;
  }

  function onScroll() {
    if (scrollRaf) return;

    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;

      if (Date.now() < suppressObserverUntil) return;

      resolveActiveSection();
    });
  }

  function finishProgrammaticScroll() {
    suppressObserverUntil = 0;

    resolveActiveSection();
  }

  function scrollToSection(id) {
    if (!import.meta.client) return;

    const el = document.getElementById(id);

    if (!el) return;

    activeId.value = id;

    suppressObserverUntil = Date.now() + PROGRAMMATIC_SCROLL_LOCK_MS;

    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer);

      scrollEndTimer = null;
    }

    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;

    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

    const onScrollEnd = () => {
      window.removeEventListener('scrollend', onScrollEnd);

      finishProgrammaticScroll();
    };

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', onScrollEnd, { once: true });
    }

    scrollEndTimer = setTimeout(finishProgrammaticScroll, PROGRAMMATIC_SCROLL_LOCK_MS);
  }

  function disconnectObserver() {
    observer?.disconnect();

    observer = null;
  }

  function setupObserver() {
    if (!activeId.value) {
      activeId.value = items[0]?.id || '';
    }

    if (!import.meta.client) return;

    disconnectObserver();

    window.removeEventListener('scroll', onScroll);

    window.addEventListener('scroll', onScroll, { passive: true });

    const elements = items.map((item) => document.getElementById(item.id)).filter(Boolean);

    if (elements.length === 0) return;

    resolveActiveSection();

    observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < suppressObserverUntil) return;

        const visible = entries

          .filter((entry) => entry.isIntersecting)

          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          activeId.value = visible[0].target.id;

          return;
        }

        resolveActiveSection();
      },

      {
        rootMargin: `-${scrollOffset}px 0px -55% 0px`,

        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  if (options.enabled) {
    watch(
      options.enabled,

      (isEnabled) => {
        if (isEnabled) {
          nextTick(() => setupObserver());

          return;
        }

        disconnectObserver();

        window.removeEventListener('scroll', onScroll);

        activeId.value = '';
      },

      { immediate: true }
    );
  } else {
    onMounted(() => {
      nextTick(() => setupObserver());
    });
  }

  onUnmounted(() => {
    disconnectObserver();

    window.removeEventListener('scroll', onScroll);

    if (scrollRaf) cancelAnimationFrame(scrollRaf);

    if (scrollEndTimer) clearTimeout(scrollEndTimer);
  });

  return {
    activeId,

    scrollToSection,

    scrollOffset,
  };
}
