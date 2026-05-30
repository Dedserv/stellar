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
      <div v-if="metaLine" class="chart-header__meta">{{ metaLine }}</div>
      <div class="chart-header__big-three">
        <article
          v-for="item in bigThree"
          :key="item.key"
          class="chart-header__card"
        >
          <h2 class="chart-header__label">{{ item.label }}</h2>
          <p class="chart-header__sign">{{ item.signLabel }}</p>
          <p v-if="item.short" class="chart-header__short">{{ item.short }}</p>
          <p v-else class="chart-header__placeholder">Описание появится позже</p>
        </article>
      </div>
    </template>
  </header>
</template>

<script setup lang="ts">
import type { AstroApiResponse, NestedDescription } from '~/types/natal';
import { canShowFullDescription } from '~/types/natal';
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

const SIGN_LABELS_RU: Record<string, string> = {
  aries: 'Овен',
  taurus: 'Телец',
  gemini: 'Близнецы',
  cancer: 'Рак',
  leo: 'Лев',
  virgo: 'Дева',
  libra: 'Весы',
  scorpio: 'Скорпион',
  sagittarius: 'Стрелец',
  capricorn: 'Козерог',
  aquarius: 'Водолей',
  pisces: 'Рыбы',
};

function signLabel(sign?: string) {
  if (!sign) return '';
  return SIGN_LABELS_RU[sign.toLowerCase()] ?? sign;
}

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

const bigThree = computed(() => {
  const data = props.data;
  if (!data) return [];

  const sun = data.planets?.find((p) => p.name === 'sun');
  const moon = data.planets?.find((p) => p.name === 'moon');
  const asc = data.ascendant;

  function buildItem(
    key: string,
    label: string,
    sign?: string,
    description?: { sign?: NestedDescription | null; house?: NestedDescription | null } | null
  ) {
    const signNested = description?.sign;
    const short =
      signNested && canShowFullDescription(signNested)
        ? signNested.description?.short
        : undefined;

    return {
      key,
      label,
      signLabel: signLabel(sign),
      short,
    };
  }

  return [
    buildItem('sun', 'Солнце', sun?.sign, sun?.description),
    buildItem('moon', 'Луна', moon?.sign, moon?.description),
    buildItem('asc', 'Асцендент', asc?.sign, asc?.description),
  ];
});

function openQuestionnaire() {
  lock();
  modal.openModal();
}
</script>

<style scoped lang="scss">
$lightGrayOrange: #e0d9d4;
$gray: #bebec9;
$softOrange: #e9a87c;

.chart-header {
  margin-bottom: 2.4rem;
}

.chart-header__meta {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
  text-align: center;
}

.chart-header__big-three {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.chart-header__card {
  padding: 1.6rem;
  border-radius: 1.2rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.chart-header__label {
  margin: 0 0 0.4rem;
  font-size: 1.3rem;
  font-weight: 500;
  color: $softOrange;
}

.chart-header__sign {
  margin: 0 0 0.8rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.chart-header__short,
.chart-header__placeholder {
  margin: 0;
  font-size: 1.4rem;
  line-height: 1.5;
}

.chart-header__short {
  color: $lightGrayOrange;
}

.chart-header__placeholder {
  color: $gray;
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
