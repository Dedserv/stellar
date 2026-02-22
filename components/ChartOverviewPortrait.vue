<template>
  <div class="portrait">
    <div class="portrait__grid">
      <section class="portrait__asc card card--wide">
        <h2 class="card__title">
          Асцендент
          <span class="card__sign">{{ ascendantSignLabel }}</span>
        </h2>
        <div class="card__blocks">
          <div class="card__block">
            <p class="card__label">По знаку</p>
            <template v-if="!canShowFullDescription(ascendant?.description?.sign)">
              <p class="card__placeholder">Описание появится позже</p>
            </template>
            <template v-else>
              <p class="card__short">{{ ascendant?.description?.sign?.description?.short }}</p>
              <div
                v-if="ascendant?.description?.sign?.description?.full"
                class="card__expand"
                :class="{ 'card__expand--open': expandedId === 'asc-sign' }"
              >
                <p class="card__full">{{ ascendant?.description?.sign?.description?.full }}</p>
              </div>
              <button
                v-if="ascendant?.description?.sign?.description?.full"
                type="button"
                class="card__btn"
                @click="toggleExpanded('asc-sign')"
              >
                {{ expandedId === 'asc-sign' ? 'Свернуть' : 'Подробнее' }}
              </button>
            </template>
          </div>
          <div class="card__block">
            <p class="card__label">По дому</p>
            <template v-if="!canShowFullDescription(ascendant?.description?.house)">
              <p class="card__placeholder">Описание появится позже</p>
            </template>
            <template v-else>
              <p class="card__short">{{ ascendant?.description?.house?.description?.short }}</p>
              <div
                v-if="ascendant?.description?.house?.description?.full"
                class="card__expand"
                :class="{ 'card__expand--open': expandedId === 'asc-house' }"
              >
                <p class="card__full">{{ ascendant?.description?.house?.description?.full }}</p>
              </div>
              <button
                v-if="ascendant?.description?.house?.description?.full"
                type="button"
                class="card__btn"
                @click="toggleExpanded('asc-house')"
              >
                {{ expandedId === 'asc-house' ? 'Свернуть' : 'Подробнее' }}
              </button>
            </template>
          </div>
        </div>
      </section>
      <section class="portrait__tone card card--narrow">
        <h3 class="card__title card__title--small">Тон карты</h3>
        <p class="card__value">{{ chartTone.label }}</p>
        <p class="card__hint">
          Гармоничных: {{ chartTone.harmonious }}, напряжённых: {{ chartTone.tense }}
        </p>
      </section>
      <section class="portrait__element card card--narrow">
        <h3 class="card__title card__title--small">Преобладающая стихия</h3>
        <p class="card__value">{{ dominantElement.labelRu }}</p>
        <p class="card__hint">{{ dominantElement.count }} из {{ dominantElement.total }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AstroApiResponse } from '~/types/natal';
import {
  canShowFullDescription,
  SIGN_ELEMENT,
  ELEMENT_LABELS_RU,
} from '~/types/natal';

const props = defineProps<{
  data: AstroApiResponse;
}>();

const expandedId = ref<string | null>(null);

const ascendant = computed(() => props.data?.ascendant);
const ascendantSignLabel = computed(() => {
  const sign = ascendant.value?.sign;
  if (!sign) return '';
  return sign.charAt(0).toUpperCase() + sign.slice(1);
});

function toggleExpanded(id: string) {
  expandedId.value = expandedId.value === id ? null : id;
}

const HARMONIOUS_TYPES = ['trine', 'sextile'];
const TENSE_TYPES = ['opposition', 'square'];

const chartTone = computed(() => {
  const metrics = props.data?.highlights?.metrics;
  const counts = metrics?.aspect_counts;
  let harmonious = 0;
  let tense = 0;
  if (counts && typeof counts.harmonious === 'number' && typeof counts.tense === 'number') {
    harmonious = counts.harmonious;
    tense = counts.tense;
  } else {
    const aspects = props.data?.aspects ?? [];
    for (const a of aspects) {
      if (HARMONIOUS_TYPES.includes(a.type)) harmonious += 1;
      else if (TENSE_TYPES.includes(a.type)) tense += 1;
    }
  }
  const total = harmonious + tense;
  const ratio = total > 0 ? harmonious / total : 0.5;
  let label: 'Гармоничная' | 'Напряжённая' | 'Смешанная' = 'Смешанная';
  if (ratio >= 0.6) label = 'Гармоничная';
  else if (ratio <= 0.4) label = 'Напряжённая';
  return { label, harmonious, tense };
});

const PLANET_NAMES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

const dominantElement = computed(() => {
  const metrics = props.data?.highlights?.metrics;
  const elementCounts = metrics?.elementCounts;
  if (elementCounts && typeof elementCounts === 'object') {
    const entries = Object.entries(elementCounts) as [keyof typeof ELEMENT_LABELS_RU, number][];
    const total = entries.reduce((s, [, v]) => s + (typeof v === 'number' ? v : 0), 0);
    if (total > 0) {
      const [elementKey, count] = entries.reduce<[string, number]>(
        (best, [k, v]) => ((v as number) > best[1] ? [k, v as number] : best),
        ['earth', 0]
      );
      return {
        elementKey: elementKey as keyof typeof ELEMENT_LABELS_RU,
        labelRu: ELEMENT_LABELS_RU[elementKey as keyof typeof ELEMENT_LABELS_RU] ?? elementKey,
        count: Math.round((count as number) * 10) / 10,
        total: Math.round(total * 10) / 10,
      };
    }
  }
  const planets = props.data?.planets ?? [];
  const counts: Record<string, number> = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const p of planets) {
    if (!PLANET_NAMES.includes(p.name)) continue;
    const el = SIGN_ELEMENT[p.sign?.toLowerCase()];
    if (el) counts[el] = (counts[el] ?? 0) + 1;
  }
  const total = PLANET_NAMES.length;
  const elementKey = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'earth') as keyof typeof ELEMENT_LABELS_RU;
  const count = counts[elementKey] ?? 0;
  return {
    elementKey,
    labelRu: ELEMENT_LABELS_RU[elementKey] ?? elementKey,
    count,
    total,
  };
});
</script>

<style scoped lang="scss">
$darkGrayBlue: #212429;
$lightGrayOrange: #e0d9d4;
$whiteOrange: #e7dace;
$primaryWhite: #fafafa;
$gray: #bebec9;
$softOrange: #e9a87c;
$softOrangeTrans: rgba(233, 168, 124, 0.8);

.portrait {
  width: 100%;
}

.portrait__grid {
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr;
  @media (min-width: 1024px) {
    grid-template-columns: 1.5fr 1fr;
    grid-template-rows: auto auto;
    gap: 1.6rem;
  }
}

.portrait__asc {
  @media (min-width: 1024px) {
    grid-column: 1;
    grid-row: 1 / -1;
  }
}

.portrait__tone,
.portrait__element {
  @media (min-width: 1024px) {
    grid-column: 2;
  }
}

.card {
  background: $darkGrayBlue;
  border-radius: 0.8rem;
  padding: 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.card--wide {
  min-width: 0;
}

.card--narrow {
  min-width: 0;
}

.card__title {
  margin: 0 0 1.2rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.4rem;
}

.card__title--small {
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
}

.card__sign {
  font-weight: 400;
  color: $whiteOrange;
  font-size: 1.6rem;
}

.card__label {
  margin: 0 0 0.4rem;
  font-size: 1.2rem;
  color: $gray;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.card__short,
.card__full {
  margin: 0 0 0.8rem;
  font-size: 1.4rem;
  line-height: 1.5;
  color: $primaryWhite;
}

.card__placeholder {
  margin: 0 0 0.8rem;
  font-size: 1.4rem;
  color: $gray;
  font-style: italic;
}

.card__blocks {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
}

.card__block {
  margin: 0;
}

.card__expand {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease-out;
}

.card__expand--open {
  max-height: 80vh;
  transition: max-height 0.4s ease-in;
}

.card__expand .card__full {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card__btn {
  margin: 0;
  padding: 0.4rem 0.8rem;
  font-size: 1.3rem;
  color: $softOrange;
  background: transparent;
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
}

.card__btn:hover {
  opacity: 0.9;
  background: rgba(233, 168, 124, 0.1);
}

.card__value {
  margin: 0 0 0.4rem;
  font-size: 1.6rem;
  font-weight: 500;
  color: $primaryWhite;
}

.card__hint {
  margin: 0;
  font-size: 1.2rem;
  color: $gray;
}
</style>
