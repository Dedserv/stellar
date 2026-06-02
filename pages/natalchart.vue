<template>
  <div class="natalchart page">
    <div class="layout-upper">
      <h1 v-if="!navEnabled" class="title">Натальная карта</h1>
      <NavChips
        v-if="navEnabled"
        :active-section="activeId ?? 'portrait'"
        @navigate="scrollToSection"
      />

      <ChartHeader v-if="!hasParams" :show-empty="true" />

      <p v-if="!hasParams" class="natalchart__empty">
        Укажите параметры карты в адресной строке или пройдите тест выше.
      </p>

      <ChartSkeleton v-else-if="pending" :progress="loadingProgress" />

      <template v-else-if="data">
        <ChartAtmosphericHero class="natalchart__hero">
          <ChartHeader :data="data" :city="cityLabel" />
          <ChartWheel :data="data" @select-planet="onSelectPlanet" />
          <ChartBigThree :data="data" />
        </ChartAtmosphericHero>
        <div>
          <ChartOverviewPortrait id="portrait" :data="data" />
          <TopInsightsSection id="insights" :data="data" @select-evidence="onSelectEvidence" />
          <PlanetsSection id="planets" :data="data" @select-planet="onSelectPlanet" />
          <AspectsSection
            id="aspects"
            :data="data"
            @select-planet="onSelectPlanet"
            @select-aspect="onSelectAspect"
          />
        </div>
      </template>

      <p v-else-if="error" class="natalchart__error">
        Не удалось загрузить данные карты. Проверьте параметры запроса.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { AstroApiResponse, InsightEvidence } from '~/types/natal';

  const route = useRoute();

  const chartQuery = computed(() => ({
    year: route.query.year,
    month: route.query.month,
    day: route.query.day,
    hour: route.query.hour,
    minute: route.query.minute,
    latitude: route.query.latitude,
    longitude: route.query.longitude,
    timezone: route.query.timezone,
  }));

  const hasParams = computed(() => {
    const q = route.query;
    return q.year && q.month && q.day && q.latitude != null && q.longitude != null;
  });

  const cityLabel = computed(() => {
    const city = route.query.city;
    return typeof city === 'string' ? city : '';
  });

  const { data, pending, error } = await useFetch<AstroApiResponse>('/api/astro', {
    query: chartQuery,
    watch: [chartQuery],
    lazy: true,
  });

  const SECTION_ITEMS = [
    { id: 'portrait', label: 'Обзор' },
    { id: 'insights', label: 'Инсайты' },
    { id: 'planets', label: 'Планеты' },
    { id: 'aspects', label: 'Аспекты' },
  ];

  const navEnabled = computed(() => Boolean(data.value) && !pending.value);

  const loadingProgress = ref(0);
  let loadingTimer: ReturnType<typeof setInterval> | null = null;

  watch(
    pending,
    (isPending) => {
      if (loadingTimer) {
        clearInterval(loadingTimer);
        loadingTimer = null;
      }
      if (!isPending) {
        loadingProgress.value = 100;
        return;
      }
      loadingProgress.value = 12;
      loadingTimer = setInterval(() => {
        if (loadingProgress.value < 88) {
          loadingProgress.value += 4 + Math.random() * 6;
        }
      }, 400);
    },
    { immediate: true }
  );

  onUnmounted(() => {
    if (loadingTimer) clearInterval(loadingTimer);
  });

  const { activeId = 'portrait', scrollToSection } = useSectionNav(SECTION_ITEMS, {
    enabled: navEnabled,
  });

  function onSelectEvidence(ev: InsightEvidence) {
    if (ev.type === 'aspect') {
      scrollToSection('aspects');
      return;
    }
    scrollToSection('planets');
  }

  function onSelectPlanet(_payload: { name: string; label: string }) {
    scrollToSection('planets');
  }

  function onSelectAspect(_payload: {
    id?: string;
    planet1?: string;
    planet2?: string;
    type?: string;
    ref?: string;
  }) {
    scrollToSection('aspects');
  }

  useHead({
    title: 'Натальная карта | Stellara',
    meta: [
      {
        name: 'description',
        content: 'Общий портрет натальной карты — асцендент, тон карты, преобладающая стихия.',
      },
    ],
  });

  onMounted(async () => {
    nextTick(() => {
      const page = document.querySelector('.page');
      page?.classList.remove('scroll-lock');
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .natalchart .container {
    box-sizing: border-box;
    width: 100%;
    padding-inline: 1.6rem;
    overflow-x: clip;

    @mixin tablet {
      padding-inline: 1.6rem;
    }
  }

  .natalchart__hero {
    padding: 8.2rem 0 4rem;
  }

  .natalchart__empty,
  .natalchart__error {
    margin: 2rem 0;
    font-size: 1.5rem;
    color: var(--color-gray, #bebec9);
    text-align: center;
  }

  .natalchart__error {
    color: var(--color-soft-orange, #e9a87c);
  }
</style>
