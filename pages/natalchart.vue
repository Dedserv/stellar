<template>
  <div class="natalchart page">
    <div class="container layout-upper">
      <h1 class="title">Натальная карта</h1>
      <p v-if="chartSubtitle" class="natalchart__subtitle">
        {{ chartSubtitle }}
      </p>
      <p v-if="!hasParams" class="natalchart__empty">
        Укажите параметры карты (дата, время, координаты) в адресной строке или перейдите к форме
        составления карты.
      </p>
      <template v-else-if="data">
        <ChartOverviewPortrait :data="data" />
        <TopInsightsSection :data="data" @select-evidence="onSelectEvidence" />
        <StrengthsSection
          :data="data"
          @select-planet="onSelectPlanet"
          @select-life-area="onSelectLifeArea"
          @select-aspect="onSelectAspect"
        />
        <LifeAreasSection :data="data" @select-life-area="onSelectLifeArea" />
        <TensionZonesSection
          :data="data"
          @select-aspect="onSelectAspect"
          @select-life-area="onSelectLifeArea"
        />
        <PlanetsSection :data="data" @select-planet="onSelectPlanet" />
        <AspectsSection
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
  import type { AstroApiResponse, InsightEvidence, SelectedLifeAreaPayload } from '~/types/natal';

  const route = useRoute();

  function onSelectEvidence(_ev: InsightEvidence) {
    // TODO: подсветить планету/аспект на карте
  }

  function onSelectLifeArea(_payload: SelectedLifeAreaPayload) {
    // TODO: подсветить сферу жизни при необходимости
  }

  function onSelectPlanet(_payload: { name: string; label: string }) {
    // TODO: подсветить планету на карте
  }

  function onSelectAspect(
    _payload: { id?: string; planet1?: string; planet2?: string; type?: string; ref?: string }
  ) {
    // TODO: подсветить аспект на карте
  }

  const MONTHS_RU = [
    'января',
    'февраля',
    'марта',
    'апреля',
    'мая',
    'июня',
    'июля',
    'августа',
    'сентября',
    'октября',
    'ноября',
    'декабря',
  ];

  const hasParams = computed(() => {
    const q = route.query;
    return q.year && q.month && q.day && q.latitude != null && q.longitude != null;
  });

  const { data, pending, error } = await useFetch<AstroApiResponse>('/api/astro', {
    query: {
      year: route.query.year,
      month: route.query.month,
      day: route.query.day,
      hour: route.query.hour,
      minute: route.query.minute,
      latitude: route.query.latitude,
      longitude: route.query.longitude,
      timezone: route.query.timezone,
    },
  });

  const chartSubtitle = computed(() => {
    const chart = data.value?.chart;
    if (!chart?.date || !chart?.location) return '';
    const d = chart.date;
    const monthLabel = MONTHS_RU[Math.max(0, d.month - 1)] ?? '';
    const day = String(d.day).padStart(2, '0');
    const hour = String(Math.floor(d.hour)).padStart(2, '0');
    const minute = String(d.minute).padStart(2, '0');
    const dateTime = `Родились ${day} ${monthLabel} ${d.year} в ${hour}:${minute}`;
    const loc = chart.location;
    const locationLabel = `Координаты: ${loc.latitude}, ${loc.longitude}`;
    return `${dateTime} · ${locationLabel}`;
  });

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
  .natalchart__subtitle {
    margin: -1rem 0 2rem;
    font-size: 1.4rem;
    color: var(--color-gray, #bebec9);
    text-align: center;
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
