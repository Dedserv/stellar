<template>
  <section class="tension-zones">
    <h2 class="tension-zones__title">Зоны напряжения</h2>
    <p class="tension-zones__subtitle">
      Где карта создаёт вызовы и что с этим делать.
    </p>

    <template v-if="!hasAnyTensionData">
      <p class="tension-zones__placeholder">
        Карта не демонстрирует ярко выражённых напряжений. В целом баланс гармоничных и
        напряжённых аспектов сбалансирован.
      </p>
    </template>
    <template v-else>
      <!-- 1. Общий уровень -->
      <div class="tension-zones__card tension-zones__level-card">
        <div class="tension-zones__level-row">
          <div class="tension-zones__level-indicator">
            <div
              class="tension-zones__progress-ring"
              :class="`tension-zones__progress-ring--${qualitativeLevel}`"
            >
              <span class="tension-zones__progress-value">{{ Math.round(normalizedTension * 100) }}%</span>
            </div>
          </div>
          <div class="tension-zones__level-text">
            <h3 class="tension-zones__level-label">
              Уровень напряжения карты: {{ tensionLevelLabel }}
            </h3>
            <p class="tension-zones__level-desc">{{ tensionLevelDescription }}</p>
          </div>
        </div>
        <div class="tension-zones__progress-bar-wrap">
          <div
            class="tension-zones__progress-bar-fill"
            :class="`tension-zones__progress-bar-fill--${qualitativeLevel}`"
            :style="{ width: `${Math.min(100, normalizedTension * 100)}%` }"
          />
        </div>
      </div>

      <!-- 2. Ключевые напряжённые связи -->
      <template v-if="keyTenseAspects.length > 0">
        <h3 class="tension-zones__block-title">Ключевые напряжённые связи</h3>
        <div class="tension-zones__aspects-grid">
          <article
            v-for="item in keyTenseAspects"
            :key="item.id"
            class="tension-zones__aspect-card"
            @click="onAspectClick(item)"
          >
            <div class="tension-zones__aspect-header">
              <span class="tension-zones__aspect-planets">
                {{ item.label1 }} {{ item.typeLabel }} {{ item.label2 }}
              </span>
              <span v-if="item.isStrong" class="tension-zones__aspect-strong">ключевой</span>
            </div>
            <p class="tension-zones__aspect-short">
              {{ item.short ?? 'Описание появится позже.' }}
            </p>
            <p class="tension-zones__aspect-meta">
              Орб: {{ item.orb.toFixed(1) }}°
            </p>
          </article>
        </div>
      </template>

      <!-- 3. Баланс стихий -->
      <template v-if="elementPercentages && Object.keys(elementPercentages).length > 0">
        <h3 class="tension-zones__block-title">Баланс стихий</h3>
        <div class="tension-zones__elements-card">
          <div
            v-for="el in elementOrder"
            :key="el"
            class="tension-zones__element-row"
          >
            <span class="tension-zones__element-label">{{ ELEMENT_LABELS[el] }}</span>
            <div class="tension-zones__element-bar">
              <div
                class="tension-zones__element-fill"
                :style="{ width: `${elementPercentages[el] ?? 0}%` }"
              />
            </div>
            <span class="tension-zones__element-pct">{{ Math.round(elementPercentages[el] ?? 0) }}%</span>
          </div>
          <p class="tension-zones__element-comment">{{ elementComment }}</p>
        </div>
      </template>

      <!-- 4. Темы, требующие внимания -->
      <template v-if="tensionZones.length > 0">
        <h3 class="tension-zones__block-title">Темы, требующие внимания</h3>
        <div class="tension-zones__zones-grid">
          <article
            v-for="zone in tensionZones"
            :key="zone.id"
            class="tension-zones__zone-card"
            :class="{ 'tension-zones__zone-card--clickable': !!zone.lifeAreaKey }"
            @click="zone.lifeAreaKey ? onZoneClick(zone) : undefined"
          >
            <h4 class="tension-zones__zone-title">{{ zone.title }}</h4>
            <p class="tension-zones__zone-summary">{{ zone.summary }}</p>
            <div v-if="zone.relatedAspects.length > 0" class="tension-zones__zone-chips">
              <button
                v-for="asp in zone.relatedAspects"
                :key="asp.id"
                type="button"
                class="tension-zones__chip"
                @click.stop="onAspectChipClick(asp)"
              >
                {{ asp.label }}
              </button>
            </div>
          </article>
        </div>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { AstroApiResponse, Aspect, StrongAspect } from '~/types/natal';
import { ELEMENT_LABELS_RU } from '~/types/natal';

type TensionZone = {
  id: string;
  title: string;
  summary: string;
  relatedAspects: Array<{
    id: string;
    planet1: string;
    planet2: string;
    type: string;
    typeLabel: string;
    label: string;
  }>;
  lifeAreaKey?: string;
};

const PLANET_LABELS: Record<string, string> = {
  sun: 'Солнце',
  moon: 'Луна',
  mercury: 'Меркурий',
  venus: 'Венера',
  mars: 'Марс',
  jupiter: 'Юпитер',
  saturn: 'Сатурн',
  uranus: 'Уран',
  neptune: 'Нептун',
  pluto: 'Плутон',
  ascendant: 'Асцендент',
};

const ASPECT_TYPE_LABELS: Record<string, string> = {
  square: 'Квадрат',
  opposition: 'Оппозиция',
};

const ELEMENT_LABELS = ELEMENT_LABELS_RU;

const BASE_WEIGHTS: Record<string, number> = {
  opposition: 0.9,
  square: 0.85,
};

const ORB_DIVISOR = 8;

const elementOrder = ['fire', 'earth', 'air', 'water'] as const;

const ZONE_RULES: Array<{
  id: string;
  title: string;
  planets: string[];
  summaryTemplates: Record<string, string>;
  lifeAreaKey?: string;
}> = [
  {
    id: 'emotional',
    title: 'Эмоциональная нагрузка / ответственность',
    planets: ['moon', 'neptune'],
    lifeAreaKey: 'health',
    summaryTemplates: {
      moon: 'Напряжённые аспекты с Луной указывают на возможную эмоциональную чувствительность и потребность в устойчивой опоре.',
      neptune: 'Нептун в напряжённых связях усиливает интуицию, но может создавать размытость границ.',
    },
  },
  {
    id: 'relationships',
    title: 'Напряжение в отношениях',
    planets: ['venus', 'mars', 'pluto'],
    lifeAreaKey: 'relationships',
    summaryTemplates: {
      venus: 'Венера в напряжённых аспектах может создавать интенсивность в партнёрстве.',
      mars: 'Марс добавляет энергию и возможную конфликтность в отношения.',
      pluto: 'Плутон усиливает глубину и потребность в трансформации связей.',
    },
  },
  {
    id: 'career',
    title: 'Напряжение в карьере и ожиданиях',
    planets: ['sun', 'saturn', 'jupiter'],
    lifeAreaKey: 'career',
    summaryTemplates: {
      sun: 'Солнце в напряжённых аспектах — внимание к балансу между амбициями и реалистичностью.',
      saturn: 'Сатурн добавляет ответственность и возможные ограничения.',
      jupiter: 'Юпитер расширяет ожидания, что может создавать внутренний конфликт.',
    },
  },
];

const props = defineProps<{
  data: AstroApiResponse;
}>();

const emit = defineEmits<{
  (e: 'select-aspect', payload: { id: string; planet1: string; planet2: string; type: string }): void;
  (e: 'select-life-area', payload: { key: string; title: string }): void;
}>();

const metrics = computed(() => props.data?.highlights?.metrics ?? ({} as Record<string, unknown>));
const aspects = computed(() => props.data?.aspects ?? []);
const strongAspects = computed(() => (metrics.value?.strongAspects as StrongAspect[]) ?? []);

const normalizedTension = computed(() => {
  const score = (metrics.value?.tensionScore as number) ?? 0;
  return Math.min(1, Math.max(0, score / 100));
});

const harmoniousRatio = computed(() => (metrics.value?.harmonious_ratio as number) ?? 0);
const hasHighHarmony = computed(() => harmoniousRatio.value >= 60);

const qualitativeLevel = computed<'low' | 'medium' | 'high'>(() => {
  const t = normalizedTension.value;
  if (t <= 0.3) return 'low';
  if (t <= 0.7) return 'medium';
  return 'high';
});

const tensionLevelLabel = computed(() => {
  const level = qualitativeLevel.value;
  const labels = {
    low: 'низкий',
    medium: 'средний',
    high: 'повышенный',
  };
  let label = labels[level];
  if (hasHighHarmony.value && level !== 'high') {
    label += ', с тенденцией к гармонии';
  }
  return label;
});

const tensionLevelDescription = computed(() => {
  const level = qualitativeLevel.value;
  if (level === 'low') {
    return 'Напряжённые аспекты не доминируют в карте. Гармоничные связи в целом смягчают возможные конфликты.';
  }
  if (level === 'medium') {
    return 'Есть заметные напряжённые аспекты, но они уравновешиваются гармоничными. Осознание этих зон поможет находить конструктивные решения.';
  }
  return 'Карта содержит несколько сильных напряжённых аспектов. Важно обращать внимание на указанные зоны и использовать их энергию осознанно.';
});

function findStrongAspect(a: Aspect, list: StrongAspect[]): StrongAspect | undefined {
  return list.find(
    (sa) =>
      sa.type === a.type &&
      ((sa.planet1 === a.planet1 && sa.planet2 === a.planet2) ||
        (sa.planet1 === a.planet2 && sa.planet2 === a.planet1)) &&
      Math.abs((sa.orb ?? 0) - (a.orb ?? 0)) <= 1
  );
}

function getAspectWeight(a: Aspect, sa?: StrongAspect): number {
  if (sa?.weight != null) return sa.weight;
  const base = BASE_WEIGHTS[a.type] ?? 0.8;
  const orbFactor = Math.max(0, Math.min(1, 1 - (a.orb ?? 0) / ORB_DIVISOR));
  return base * orbFactor;
}

function canUseShort(a: Aspect): boolean {
  const nested = a.description;
  const desc = nested?.description;
  if (!desc) return false;
  if (nested.type === 'fallback') return false;
  if (desc.needs_review || desc.lang !== 'ru') return false;
  return nested.type === 'sign_combo' || nested.type === 'aspect';
}

type TenseAspectVm = {
  id: string;
  planet1: string;
  planet2: string;
  label1: string;
  label2: string;
  type: string;
  typeLabel: string;
  short?: string;
  orb: number;
  weight: number;
  isStrong: boolean;
};

const keyTenseAspects = computed<TenseAspectVm[]>(() => {
  const tenseTypes = ['square', 'opposition'];
  const list = aspects.value.filter((a) => tenseTypes.includes(a.type)) as Aspect[];
  const strong = strongAspects.value;

  const enriched = list.map((a) => {
    const id = `${a.planet1}_${a.planet2}_${a.type}`;
    const sa = findStrongAspect(a, strong);
    const weight = getAspectWeight(a, sa);
    const short = canUseShort(a) ? a.description?.description?.short : undefined;
    return {
      id,
      planet1: a.planet1,
      planet2: a.planet2,
      label1: PLANET_LABELS[a.planet1] ?? a.planet1,
      label2: PLANET_LABELS[a.planet2] ?? a.planet2,
      type: a.type,
      typeLabel: ASPECT_TYPE_LABELS[a.type] ?? a.type,
      short,
      orb: a.orb ?? 0,
      weight,
      isStrong: !!sa || weight >= 0.7,
    };
  });

  return enriched.sort((x, y) => y.weight - x.weight).slice(0, 5);
});

const elementCounts = computed(() => (metrics.value?.elementCounts as Record<string, number>) ?? {});

const elementPercentages = computed(() => {
  const counts = elementCounts.value;
  const total =
    (counts.fire ?? 0) + (counts.earth ?? 0) + (counts.air ?? 0) + (counts.water ?? 0) || 1;
  return Object.fromEntries(
    elementOrder.map((e) => [e, ((counts[e] ?? 0) / total) * 100])
  ) as Record<string, number>;
});

const elementComment = computed(() => {
  const pct = elementPercentages.value;
  if (!pct || Object.keys(pct).length === 0) return '';

  const entries = elementOrder.map((e) => [e, pct[e] ?? 0] as const);
  const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
  const deficient = entries.filter(([, v]) => v < 15).map(([k]) => k);

  const parts: string[] = [];
  parts.push(`Доминирует ${ELEMENT_LABELS[dominant].toLowerCase()}`);
  if (deficient.length > 0) {
    const labels = deficient.map((d) => ELEMENT_LABELS[d].toLowerCase()).join(', ');
    parts.push(`почти нет ${labels}`);
  }
  const hint: Record<string, string> = {
    fire: 'фокус на активности и инициативе',
    earth: 'фокус на стабильности и практичности',
    air: 'фокус на общении и гибкости',
    water: 'фокус на эмоциях и интуиции',
  };
  const defHint = deficient.map((d) => hint[d]).filter(Boolean);
  if (defHint.length > 0) {
    parts.push(`— может не хватать ${defHint.join(' и ')}.`);
  } else {
    parts.push('.');
  }
  return parts.join(', ');
});

const tensionZones = computed<TensionZone[]>(() => {
  const tenseItems = keyTenseAspects.value;
  if (tenseItems.length === 0) return [];

  const zones: TensionZone[] = [];

  for (const rule of ZONE_RULES) {
    const related = tenseItems.filter(
      (a) =>
        rule.planets.includes(a.planet1) || rule.planets.includes(a.planet2)
    );
    if (related.length === 0) continue;

    const summaries: string[] = [];
    const planetSet = new Set<string>();
    for (const a of related) {
      if (rule.planets.includes(a.planet1)) planetSet.add(a.planet1);
      if (rule.planets.includes(a.planet2)) planetSet.add(a.planet2);
    }
    for (const p of planetSet) {
      const tpl = rule.summaryTemplates[p];
      if (tpl) summaries.push(tpl);
    }
    const summary =
      summaries.length > 0
        ? summaries.slice(0, 2).join(' ')
        : `Напряжённые аспекты в этой зоне требуют внимания к балансу и осознанному выбору.`;

    zones.push({
      id: rule.id,
      title: rule.title,
      summary,
      relatedAspects: related.map((a) => ({
        id: a.id,
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type,
        typeLabel: a.typeLabel,
        label: `${a.label1}–${a.label2}`,
      })),
      lifeAreaKey: rule.lifeAreaKey,
    });
  }

  return zones.slice(0, 3);
});

const hasAnyTensionData = computed(() => {
  const hasScore = (metrics.value?.tensionScore as number) != null;
  const hasTense = keyTenseAspects.value.length > 0;
  const hasElements =
    elementCounts.value &&
    Object.values(elementCounts.value).some((v) => v != null && v > 0);
  return hasScore || hasTense || hasElements;
});

function onAspectClick(item: TenseAspectVm) {
  emit('select-aspect', {
    id: item.id,
    planet1: item.planet1,
    planet2: item.planet2,
    type: item.type,
  });
}

function onAspectChipClick(asp: {
  id: string;
  planet1: string;
  planet2: string;
  type: string;
}) {
  emit('select-aspect', {
    id: asp.id,
    planet1: asp.planet1,
    planet2: asp.planet2,
    type: asp.type,
  });
}

function onZoneClick(zone: TensionZone) {
  if (zone.lifeAreaKey) {
    emit('select-life-area', { key: zone.lifeAreaKey, title: zone.title });
  }
}
</script>

<style scoped lang="scss">
$darkGrayBlue: #212429;
$lightGrayOrange: #e0d9d4;
$primaryWhite: #fafafa;
$gray: #bebec9;
$softOrange: #e9a87c;
$softOrangeTrans: rgba(233, 168, 124, 0.8);

.tension-zones {
  width: 100%;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.tension-zones__title {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.tension-zones__subtitle {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
}

.tension-zones__placeholder {
  margin: 0;
  padding: 2rem;
  font-size: 1.4rem;
  color: $gray;
  font-style: italic;
  text-align: center;
  background: $darkGrayBlue;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tension-zones__block-title {
  margin: 2rem 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.tension-zones__level-card {
  padding: 1.6rem;
  background: rgba($darkGrayBlue, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tension-zones__level-row {
  display: flex;
  gap: 1.6rem;
  align-items: flex-start;
  margin-bottom: 1.2rem;
}

.tension-zones__level-indicator {
  flex-shrink: 0;
}

.tension-zones__progress-ring {
  width: 4.8rem;
  height: 4.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.15);
  background: rgba(0, 0, 0, 0.2);

  &--low {
    border-color: #7cb87c;
    color: #7cb87c;
  }

  &--medium {
    border-color: $softOrange;
    color: $softOrange;
  }

  &--high {
    border-color: #c87c7c;
    color: #c87c7c;
  }
}

.tension-zones__progress-value {
  font-size: 1.2rem;
  font-weight: 600;
}

.tension-zones__level-text {
  flex: 1;
  min-width: 0;
}

.tension-zones__level-label {
  margin: 0 0 0.4rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: $primaryWhite;
}

.tension-zones__level-desc {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.5;
  color: $gray;
}

.tension-zones__progress-bar-wrap {
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  overflow: hidden;
}

.tension-zones__progress-bar-fill {
  height: 100%;
  border-radius: 0.25rem;
  transition: width 0.3s;

  &--low {
    background: #7cb87c;
  }

  &--medium {
    background: $softOrange;
  }

  &--high {
    background: #c87c7c;
  }
}

.tension-zones__aspects-grid {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tension-zones__aspect-card {
  padding: 1.4rem;
  background: rgba($darkGrayBlue, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }
}

.tension-zones__aspect-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.tension-zones__aspect-planets {
  font-size: 1.35rem;
  font-weight: 600;
  color: $softOrange;
}

.tension-zones__aspect-strong {
  font-size: 1rem;
  padding: 0.2rem 0.5rem;
  color: #7cb87c;
  background: rgba(124, 184, 124, 0.15);
  border-radius: 0.4rem;
}

.tension-zones__aspect-short {
  margin: 0 0 0.6rem;
  font-size: 1.3rem;
  line-height: 1.5;
  color: $primaryWhite;
}

.tension-zones__aspect-meta {
  margin: 0;
  font-size: 1.2rem;
  color: $gray;
}

.tension-zones__elements-card {
  padding: 1.6rem;
  background: rgba($darkGrayBlue, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.tension-zones__element-row {
  display: grid;
  grid-template-columns: 6rem 1fr 3rem;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.8rem;
}

.tension-zones__element-label {
  font-size: 1.3rem;
  color: $primaryWhite;
}

.tension-zones__element-bar {
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  overflow: hidden;
}

.tension-zones__element-fill {
  height: 100%;
  background: $softOrange;
  border-radius: 0.25rem;
  transition: width 0.3s;
}

.tension-zones__element-pct {
  font-size: 1.2rem;
  color: $gray;
  text-align: right;
}

.tension-zones__element-comment {
  margin: 1.2rem 0 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 1.3rem;
  line-height: 1.5;
  color: $gray;
}

.tension-zones__zones-grid {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.tension-zones__zone-card {
  padding: 1.6rem;
  background: rgba($darkGrayBlue, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);

  &--clickable {
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: rgba(255, 255, 255, 0.12);
    }
  }
}

.tension-zones__zone-title {
  margin: 0 0 0.8rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: $primaryWhite;
}

.tension-zones__zone-summary {
  margin: 0 0 1rem;
  font-size: 1.3rem;
  line-height: 1.55;
  color: $gray;
}

.tension-zones__zone-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tension-zones__chip {
  padding: 0.35rem 0.8rem;
  font-size: 1.2rem;
  color: $softOrange;
  background: transparent;
  border: 1px solid $softOrangeTrans;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;

  &:hover {
    opacity: 0.9;
    background: rgba(233, 168, 124, 0.1);
  }
}
</style>
