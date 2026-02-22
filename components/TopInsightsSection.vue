<template>
  <section class="insights">
    <h2 class="insights__title">Топ инсайты</h2>
    <p class="insights__subtitle">Самые важные акценты вашей натальной карты</p>

    <template v-if="topInsights.length === 0">
      <p class="insights__placeholder">Инсайты появятся позже</p>
    </template>
    <div v-else class="insights__grid">
      <article
        v-for="insight in topInsights"
        :key="insight.id"
        class="insight-card"
      >
        <div class="insight-card__head">
          <div class="insight-card__meta">
            <span v-if="insight.badge" class="insight-card__badge">{{ insight.badge }}</span>
            <span class="insight-card__score">{{ scoreDisplay(insight.score) }}</span>
          </div>
          <h3 class="insight-card__title">{{ insight.title }}</h3>
        </div>
        <p class="insight-card__summary">{{ insight.summary }}</p>
        <button
          type="button"
          class="insight-card__btn"
          @click="toggleExpanded(insight.id)"
        >
          {{ expandedIds.has(insight.id) ? 'Свернуть' : 'Подробнее' }}
        </button>
        <div
          class="insight-card__expand"
          :class="{ 'insight-card__expand--open': expandedIds.has(insight.id) }"
        >
          <p class="insight-card__full">{{ expandedContent(insight) }}</p>
          <div v-if="insight.evidence.length > 0" class="insight-card__evidence">
            <button
              v-for="(ev, idx) in insight.evidence"
              :key="idx"
              type="button"
              class="insight-card__chip"
              @click="emit('select-evidence', ev)"
            >
              {{ ev.label }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ChartResponse, Insight, InsightEvidence, NestedDescription } from '~/types/natal';
import { canShowFullDescription } from '~/types/natal';

const props = defineProps<{
  data: ChartResponse;
}>();

const emit = defineEmits<{
  (e: 'select-evidence', payload: InsightEvidence): void;
}>();

const PLANET_LABELS_RU: Record<string, string> = {
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

const SIGN_LABELS_RU: Record<string, string> = {
  aries: 'Овне',
  taurus: 'Тельце',
  gemini: 'Близнецах',
  cancer: 'Раке',
  leo: 'Льве',
  virgo: 'Деве',
  libra: 'Весах',
  scorpio: 'Скорпионе',
  sagittarius: 'Стрельце',
  capricorn: 'Козероге',
  aquarius: 'Водолее',
  pisces: 'Рыбах',
};

const ASPECT_TYPE_LABELS_RU: Record<string, string> = {
  conjunction: 'соединение',
  opposition: 'оппозиция',
  trine: 'трин',
  sextile: 'секстиль',
  square: 'квадрат',
};

const ASPECT_BASE_WEIGHTS: Record<string, number> = {
  conjunction: 1.0,
  opposition: 0.9,
  trine: 0.8,
  sextile: 0.7,
  square: 0.65,
};

const expandedIds = ref<Set<string>>(new Set());

function normalizeScore(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function canUseDescription(nested: NestedDescription | null | undefined): boolean {
  return canShowFullDescription(nested);
}

function buildCoreInsights(data: ChartResponse): Insight[] {
  const insights: Insight[] = [];
  const planets = data.planets ?? [];
  const ascendant = data.ascendant;

  const corePlanets = planets.filter((p) => p.name === 'sun' || p.name === 'moon');
  const scores: Record<string, number> = {
    sun: 0.9,
    moon: 0.85,
    ascendant: 0.8,
  };

  for (const p of corePlanets) {
    const signN = p.description?.sign;
    const houseN = p.description?.house;
    if (!canUseDescription(signN) && !canUseDescription(houseN)) continue;

    const signLabel = SIGN_LABELS_RU[p.sign?.toLowerCase() ?? ''] ?? p.sign;
    const planetLabel = PLANET_LABELS_RU[p.name] ?? p.name;
    const houseNum = p.house ?? 1;
    const houseWord = houseNum === 1 ? '1 доме' : `${houseNum} доме`;
    const title = `${planetLabel} в ${signLabel} в ${houseWord}`;

    const signShort = signN?.description?.short ?? '';
    const houseShort = houseN?.description?.short ?? '';
    const summary = [signShort, houseShort].filter(Boolean).join(' ');

    const signFull = signN?.description?.full ?? '';
    const houseFull = houseN?.description?.full ?? '';
    const full = [signFull, houseFull].filter(Boolean).join('\n\n');

    insights.push({
      id: `core:${p.name}`,
      title,
      summary,
      full: full || undefined,
      score: scores[p.name] ?? 0.8,
      category: 'core',
      badge: 'Основное',
      evidence: [{ type: 'planet', label: planetLabel, ref: `planet:${p.name}` }],
    });
  }

  if (ascendant && (canUseDescription(ascendant.description?.sign) || canUseDescription(ascendant.description?.house))) {
    const signLabel = SIGN_LABELS_RU[ascendant.sign?.toLowerCase() ?? ''] ?? ascendant.sign;
    const title = `Асцендент в ${signLabel} в 1 доме`;
    const signShort = ascendant.description?.sign?.description?.short ?? '';
    const houseShort = ascendant.description?.house?.description?.short ?? '';
    const summary = [signShort, houseShort].filter(Boolean).join(' ');
    const signFull = ascendant.description?.sign?.description?.full ?? '';
    const houseFull = ascendant.description?.house?.description?.full ?? '';
    const full = [signFull, houseFull].filter(Boolean).join('\n\n');

    insights.push({
      id: 'core:ascendant',
      title,
      summary,
      full: full || undefined,
      score: scores.ascendant,
      category: 'core',
      badge: 'Основное',
      evidence: [{ type: 'planet', label: 'Асцендент', ref: 'planet:ascendant' }],
    });
  }

  return insights;
}

function buildAspectInsights(data: ChartResponse): Insight[] {
  const aspects = data.aspects ?? [];
  const insights: Insight[] = [];

  for (const a of aspects) {
    const desc = a.description;
    const type = desc?.type;
    if (type !== 'aspect' && type !== 'sign_combo') continue;

    const block = desc?.description;
    if (!block || block.lang !== 'ru' || block.needs_review) continue;

    const base = ASPECT_BASE_WEIGHTS[a.type] ?? 0.5;
    const orbFactor = Math.max(0, 1 - (a.orb ?? 0) / 8);
    const score = normalizeScore(base * orbFactor);

    const p1Label = PLANET_LABELS_RU[a.planet1] ?? a.planet1;
    const p2Label = PLANET_LABELS_RU[a.planet2] ?? a.planet2;
    const aspectLabel = ASPECT_TYPE_LABELS_RU[a.type] ?? a.type;
    const id = `aspect:${a.planet1}_${a.planet2}_${a.type}`;

    let badge: string | undefined;
    if (a.type === 'conjunction') badge = 'Ключевой узел';
    else if (a.type === 'opposition') badge = 'Напряжение';
    else if (a.type === 'trine' || a.type === 'sextile') badge = 'Поддержка';

    insights.push({
      id,
      title: `${p1Label} — ${p2Label}, ${aspectLabel}`,
      summary: block.short ?? '',
      full: block.full,
      score,
      category: 'aspect',
      badge,
      evidence: [
        {
          type: 'aspect',
          label: `${p1Label} ↔ ${p2Label}`,
          ref: `aspect:${a.planet1}_${a.planet2}_${a.type}`,
        },
      ],
    });
  }

  return insights;
}

const topInsights = computed<Insight[]>(() => {
  if (!props.data) return [];
  const core = buildCoreInsights(props.data);
  const aspects = buildAspectInsights(props.data);
  const all = [...core, ...aspects].sort((a, b) => b.score - a.score);
  return all.slice(0, 6);
});

function toggleExpanded(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function scoreDisplay(score: number): number {
  return Math.round(score * 10);
}

function expandedContent(insight: Insight): string {
  return insight.full || insight.summary || '';
}
</script>

<style scoped lang="scss">
$darkGrayBlue: #212429;
$lightGrayOrange: #e0d9d4;
$primaryWhite: #fafafa;
$gray: #bebec9;
$softOrange: #e9a87c;
$softOrangeTrans: rgba(233, 168, 124, 0.8);

.insights {
  width: 100%;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.insights__title {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.insights__subtitle {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
}

.insights__placeholder {
  margin: 0;
  padding: 2rem;
  font-size: 1.4rem;
  color: $gray;
  font-style: italic;
  text-align: center;
  background: $darkGrayBlue;
  border-radius: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.insights__grid {
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.insight-card {
  background: $darkGrayBlue;
  border-radius: 0.8rem;
  padding: 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.insight-card__head {
  flex-shrink: 0;
}

.insight-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.6rem;
}

.insight-card__badge {
  font-size: 1.1rem;
  padding: 0.2rem 0.6rem;
  background: rgba(233, 168, 124, 0.15);
  color: $softOrange;
  border-radius: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.insight-card__score {
  font-size: 1.2rem;
  font-weight: 600;
  color: $primaryWhite;
  width: 2.2rem;
  height: 2.2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  margin-left: auto;
}

.insight-card__title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: $lightGrayOrange;
  line-height: 1.35;
}

.insight-card__summary {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  line-height: 1.5;
  color: $primaryWhite;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.insight-card__btn {
  margin: 0;
  padding: 0.4rem 0.8rem;
  font-size: 1.3rem;
  color: $softOrange;
  background: transparent;
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
  align-self: flex-start;
}

.insight-card__btn:hover {
  opacity: 0.9;
  background: rgba(233, 168, 124, 0.1);
}

.insight-card__expand {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.35s ease-out, opacity 0.25s ease-out;
}

.insight-card__expand--open {
  max-height: 80vh;
  opacity: 1;
  transition: max-height 0.4s ease-in, opacity 0.3s ease-in;
}

.insight-card__full {
  margin: 1.2rem 0 0;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 1.4rem;
  line-height: 1.55;
  color: $primaryWhite;
}

.insight-card__evidence {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.insight-card__chip {
  margin: 0;
  padding: 0.35rem 0.7rem;
  font-size: 1.2rem;
  color: $softOrange;
  background: rgba(233, 168, 124, 0.1);
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.insight-card__chip:hover {
  background: rgba(233, 168, 124, 0.2);
  opacity: 0.95;
}
</style>
