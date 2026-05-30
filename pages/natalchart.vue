<template>
  <div class="natalchart page">
    <div class="container layout-upper">
      <h1 class="title">Натальная карта</h1>

      <ChartHeader :data="data" :city="cityLabel" :show-empty="!hasParams" />

      <p v-if="!hasParams" class="natalchart__empty">
        Укажите параметры карты в адресной строке или пройдите тест выше.
      </p>

      <template v-else-if="data">
        <ChartOverviewPortrait :data="data" />
        <TopInsightsSection :data="data" @select-evidence="onSelectEvidence" />
        <PlanetsSection id="planets" :data="data" @select-planet="onSelectPlanet" />
        <AspectsSection
          id="aspects"
          :data="data"
          @select-planet="onSelectPlanet"
          @select-aspect="onSelectAspect"
        />
      </template>

      <p v-else-if="error" class="natalchart__error">
        Не удалось загрузить данные карты. Проверьте параметры запроса.
      </p>
      <p v-else-if="pending" class="natalchart__empty">Загрузка…</p>
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
  });

  function scrollToSection(id: string) {
    if (!import.meta.client) return;
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
