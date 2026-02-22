<template>
  <section class="strengths">
    <h2 class="strengths__title">Сильные стороны</h2>
    <p class="strengths__subtitle">То, на что вы можете опираться.</p>

    <template v-if="strengthItems.length === 0">
      <p class="strengths__placeholder">
        Сильные стороны будут добавлены в одном из следующих обновлений интерпретаций.
      </p>
    </template>
    <div v-else class="strengths__grid">
      <article
        v-for="item in strengthItems"
        :key="item.id"
        class="strength-card"
      >
        <div class="strength-card__head">
          <span class="strength-card__score">{{ scoreDisplay(item.score) }}</span>
          <h3 class="strength-card__title">{{ item.title }}</h3>
        </div>
        <p class="strength-card__summary">{{ item.summary }}</p>
        <div v-if="item.sources.length > 0" class="strength-card__chips">
          <button
            v-for="(ev, idx) in item.sources"
            :key="idx"
            type="button"
            class="strength-card__chip"
            @click="onChipClick(ev)"
          >
            {{ ev.label }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import type {
  ChartResponse,
  StrengthEvidence,
  StrengthItem,
  StrengthSourceType,
} from '~/types/natal';

const props = defineProps<{
  data: ChartResponse;
}>();

const emit = defineEmits<{
  (e: 'select-planet', payload: { name: string; label: string }): void;
  (e: 'select-life-area', payload: { key: string; title: string }): void;
  (e: 'select-aspect', payload: { ref: string }): void;
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

const ASPECT_TYPE_LABELS_RU: Record<string, string> = {
  trine: 'Трин',
  sextile: 'Секстиль',
};

const LIFE_AREA_LABELS: Record<string, { title: string }> = {
  relationships: { title: 'Отношения' },
  career: { title: 'Карьера' },
  finance: { title: 'Финансы' },
};

const TOP_N = 6;
const NORM_KEY_LEN = 60;

function canUseDescription(desc: { lang?: string; needs_review?: boolean } | null | undefined): boolean {
  if (!desc) return false;
  return (desc.lang === 'ru' || desc.lang === undefined) && desc.needs_review !== true;
}

function normKey(s: string): string {
  const first = s.split(/[.!?]/)[0].trim().toLowerCase();
  return first.slice(0, NORM_KEY_LEN);
}

function collectFromPlanets(data: ChartResponse): Array<{ title: string; summary: string; source: StrengthEvidence }> {
  const result: Array<{ title: string; summary: string; source: StrengthEvidence }> = [];
  const planets = data.planets ?? [];
  const ascendant = data.ascendant;

  function addFromNested(
    strengths: string[],
    label: string,
    ref: string,
    type: StrengthSourceType = 'planet'
  ) {
    for (const s of strengths) {
      const t = String(s).trim();
      if (t) {
        result.push({
          title: t,
          summary: t,
          source: { type, label, ref },
        });
      }
    }
  }

  for (const p of planets) {
    const houseNested = p.description?.house;
    const houseDesc = houseNested?.description;
    if (houseDesc?.strengths?.length && canUseDescription(houseDesc)) {
      const planetLabel = PLANET_LABELS_RU[p.name] ?? p.name;
      const houseNum = p.house ?? 1;
      const label = `${planetLabel} в ${houseNum} доме`;
      const ref = `planet:${p.name}`;
      addFromNested(houseDesc.strengths, label, ref);
    }

    const signNested = p.description?.sign;
    const signDesc = signNested?.description;
    if (signDesc?.strengths?.length && canUseDescription(signDesc)) {
      const planetLabel = PLANET_LABELS_RU[p.name] ?? p.name;
      const label = `${planetLabel} в знаке`;
      const ref = `planet:${p.name}`;
      addFromNested(signDesc.strengths, label, ref);
    }
  }

  if (ascendant) {
    const houseNested = ascendant.description?.house;
    const houseDesc = houseNested?.description;
    if (houseDesc?.strengths?.length && canUseDescription(houseDesc)) {
      const label = 'Асцендент в 1 доме';
      const ref = 'planet:ascendant';
      addFromNested(houseDesc.strengths, label, ref);
    }
  }

  return result;
}

function collectFromLifeAreas(data: ChartResponse): Array<{ title: string; summary: string; source: StrengthEvidence }> {
  const result: Array<{ title: string; summary: string; source: StrengthEvidence }> = [];
  const areas = data.life_areas ?? {};

  for (const [key, items] of Object.entries(areas)) {
    if (!Array.isArray(items)) continue;
    const areaLabel = LIFE_AREA_LABELS[key]?.title ?? key;
    const label = `Сфера: ${areaLabel}`;
    const ref = `life_area:${key}`;

    for (const item of items) {
      if (!canUseDescription(item) || !item.strengths?.length) continue;
      for (const s of item.strengths) {
        const t = String(s).trim();
        if (t) {
          result.push({
            title: t,
            summary: t,
            source: { type: 'life_area', label, ref },
          });
        }
      }
    }
  }

  return result;
}

function collectFromHarmoniousAspects(
  data: ChartResponse
): Array<{ title: string; summary: string; source: StrengthEvidence }> {
  const result: Array<{ title: string; summary: string; source: StrengthEvidence }> = [];
  const aspects = data.aspects ?? [];

  for (const a of aspects) {
    if (a.type !== 'trine' && a.type !== 'sextile') continue;

    const desc = a.description?.description;
    if (!desc || !canUseDescription(desc)) continue;

    const short = desc.short?.trim();
    if (!short) continue;

    const p1Label = PLANET_LABELS_RU[a.planet1] ?? a.planet1;
    const p2Label = PLANET_LABELS_RU[a.planet2] ?? a.planet2;
    const typeLabel = ASPECT_TYPE_LABELS_RU[a.type] ?? a.type;
    const label = `${typeLabel} ${p1Label}–${p2Label}`;
    const ref = `aspect:${a.planet1}_${a.planet2}_${a.type}`;

    const title = short.length > 50 ? short.slice(0, 50).trim() + '…' : short;
    result.push({
      title,
      summary: short,
      source: { type: 'aspect', label, ref },
    });
  }

  return result;
}

type RawAgg = {
  key: string;
  title: string;
  summaries: string[];
  sources: StrengthEvidence[];
};

function aggregate(raw: Array<{ title: string; summary: string; source: StrengthEvidence }>): Map<string, RawAgg> {
  const map = new Map<string, RawAgg>();

  for (const r of raw) {
    const key = normKey(r.title);
    if (!key) continue;

    const existing = map.get(key);
    if (existing) {
      existing.summaries.push(r.summary);
      const alreadyHasSource = existing.sources.some(
        (s) => s.ref === r.source.ref && s.label === r.source.label
      );
      if (!alreadyHasSource) {
        existing.sources.push(r.source);
      }
    } else {
      map.set(key, {
        key,
        title: r.title,
        summaries: [r.summary],
        sources: [r.source],
      });
    }
  }

  return map;
}

function dedupeSources(sources: StrengthEvidence[]): StrengthEvidence[] {
  const seen = new Set<string>();
  return sources.filter((s) => {
    const id = `${s.type}:${s.ref}:${s.label}`;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

const strengthItems = computed<StrengthItem[]>(() => {
  const d = props.data;
  if (!d) return [];

  const raw = [
    ...collectFromPlanets(d),
    ...collectFromLifeAreas(d),
    ...collectFromHarmoniousAspects(d),
  ];

  const map = aggregate(raw);
  const items: StrengthItem[] = [];
  let idx = 0;

  for (const agg of map.values()) {
    const sources = dedupeSources(agg.sources);
    const score = Math.min(1, sources.length / 4);
    const summary = agg.summaries[0] ?? agg.title;

    items.push({
      id: `strength:${idx}:${agg.key.slice(0, 40).replace(/\s+/g, '_')}`,
      title: agg.title,
      summary,
      score,
      sources,
    });
    idx++;
  }

  return items
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);
});

function scoreDisplay(score: number): number {
  return Math.round(score * 10);
}

function onChipClick(ev: StrengthEvidence) {
  if (ev.type === 'planet') {
    const name = ev.ref.replace('planet:', '');
    emit('select-planet', { name, label: ev.label });
  } else if (ev.type === 'life_area') {
    const key = ev.ref.replace('life_area:', '');
    const title = LIFE_AREA_LABELS[key]?.title ?? key;
    emit('select-life-area', { key, title });
  } else {
    emit('select-aspect', { ref: ev.ref });
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

.strengths {
  width: 100%;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.strengths__title {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.strengths__subtitle {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
}

.strengths__placeholder {
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

.strengths__grid {
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

.strength-card {
  background: $darkGrayBlue;
  border-radius: 16px;
  padding: 1.6rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.strength-card__head {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.strength-card__score {
  flex-shrink: 0;
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
}

.strength-card__title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: $lightGrayOrange;
  line-height: 1.35;
  flex: 1;
}

.strength-card__summary {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  line-height: 1.5;
  color: $primaryWhite;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.strength-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.strength-card__chip {
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

.strength-card__chip:hover {
  background: rgba(233, 168, 124, 0.2);
  opacity: 0.95;
}
</style>
