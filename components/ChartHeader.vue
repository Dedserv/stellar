<template>
  <header class="chart-header">
    <template v-if="showEmpty">
      <p class="chart-header__empty">
        Пройдите короткий тест, чтобы получить персональную натальную карту.
      </p>
      <VButton
        class="chart-header__cta"
        type="bordered"
        color="secondary"
        rounded
        @click="openQuestionnaire"
      >
        Пройти тест
      </VButton>
    </template>
    <template v-else-if="data">
      <h1 v-if="metaLine" class="chart-header__meta">{{ metaLine }}</h1>
      <ChartShareButton class="chart-header__share" />
    </template>
  </header>
</template>

<script setup lang="ts">
import type { AstroApiResponse } from '~/types/natal';
import { modalStore } from '@/stores/modal';

const props = defineProps<{
  data?: AstroApiResponse | null;
  city?: string;
  showEmpty?: boolean;
}>();

const { lock } = useBodyScrollLock();
const modal = modalStore();

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

const metaLine = computed(() => {
  const chart = props.data?.chart;
  if (!chart?.date) return '';

  const d = chart.date;
  const monthLabel = MONTHS_RU[Math.max(0, d.month - 1)] ?? '';
  const day = String(d.day).padStart(2, '0');
  const hour = String(Math.floor(d.hour)).padStart(2, '0');
  const minute = String(d.minute).padStart(2, '0');
  const dateTime = `Родились ${day} ${monthLabel} ${d.year} в ${hour}:${minute}`;

  const cityName = props.city || chart.location?.city;
  return cityName ? `${dateTime} · ${cityName}` : dateTime;
});

function openQuestionnaire() {
  lock();
  modal.openModal();
}
</script>

<style scoped>
@import '~/assets/css/variables.css';

.chart-header {
  margin-bottom: 1.6rem;
}

.chart-header__meta {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 400;
  color: $gray;
  text-align: center;
}

.chart-header__share {
  margin-top: 1.2rem;
}

.chart-header__empty {
  margin: 0 0 1.6rem;
  font-size: 1.5rem;
  color: $gray;
  text-align: center;
}

.chart-header__cta {
  display: flex;
  margin: 0 auto;
}
</style>
