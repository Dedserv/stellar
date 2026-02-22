<template>
  <section class="life-areas">
    <h2 class="life-areas__title">Сферы жизни</h2>
    <p class="life-areas__subtitle">
      Ключевые области, в которых сейчас сосредоточено внимание вашей карты.
    </p>

    <template v-if="!hasAnyValidContent">
      <p class="life-areas__placeholder">
        Персональные рекомендации по сферам жизни появятся в одном из следующих обновлений.
      </p>
    </template>
    <template v-else>
      <div class="life-areas__grid">
        <button
          v-for="area in areaDefs"
          :key="area.key"
          type="button"
          class="life-area-card"
          :class="{ 'life-area-card--active': activeKey === area.key }"
          @click="selectArea(area.key)"
        >
          <span class="life-area-card__icon">{{ area.icon }}</span>
          <h3 class="life-area-card__title">{{ area.title }}</h3>
          <p class="life-area-card__preview">
            {{ area.previewText }}
          </p>
          <div v-if="area.tags.length > 0" class="life-area-card__tags">
            <span
              v-for="tag in area.tags"
              :key="tag"
              class="life-area-card__chip"
            >{{ tag }}</span>
          </div>
          <span class="life-area-card__link">Подробнее</span>
        </button>
      </div>

      <div v-if="activeArea" class="life-areas__details">
        <h3 class="life-areas__details-title">
          {{ activeArea.icon }} {{ activeArea.title }}
        </h3>
        <div
          v-for="(item, idx) in displayItems"
          :key="item.id ?? idx"
          class="life-areas__item"
        >
          <h4 class="life-areas__item-title">{{ truncateShort(item.short) }}</h4>
          <p v-if="item.full" class="life-areas__item-full">{{ truncateFull(item.full) }}</p>
          <div v-if="hasStructuredData(item)" class="life-areas__item-struct">
            <div v-if="item.strengths?.length" class="life-areas__struct-col">
              <span class="life-areas__struct-label">Сильные стороны</span>
              <ul>
                <li v-for="s in item.strengths" :key="s">{{ s }}</li>
              </ul>
            </div>
            <div v-if="item.challenges?.length" class="life-areas__struct-col">
              <span class="life-areas__struct-label">Вызовы</span>
              <ul>
                <li v-for="c in item.challenges" :key="c">{{ c }}</li>
              </ul>
            </div>
            <div v-if="item.actionable?.length" class="life-areas__struct-col">
              <span class="life-areas__struct-label">Практические шаги</span>
              <ul>
                <li v-for="a in item.actionable" :key="a">{{ a }}</li>
              </ul>
            </div>
          </div>
        </div>
        <p class="life-areas__disclaimer">
          Рекомендации носят общий характер и не заменяют личной работы со специалистом.
        </p>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { ChartResponse, LifeAreaItem, LifeAreas, SelectedLifeAreaPayload } from '~/types/natal';

const props = defineProps<{
  data: ChartResponse;
}>();

const emit = defineEmits<{
  (e: 'select-life-area', payload: SelectedLifeAreaPayload): void;
}>();

const LIFE_AREA_LABELS: Record<string, { title: string; icon: string }> = {
  relationships: { title: 'Отношения', icon: '❤️' },
  career: { title: 'Карьера', icon: '🧭' },
  finance: { title: 'Финансы', icon: '💰' },
};

const PLACEHOLDER_TEXT = 'Рекомендации появятся позже';
const MAX_ITEMS_DISPLAY = 5;
const MAX_FULL_LINES = 8;
const SHORT_TRUNCATE = 100;

function filterValidItems(items: LifeAreaItem[] | undefined): LifeAreaItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (it) => (it.lang === 'ru' || it.lang === undefined) && it.needs_review !== true
  );
}

function getPreviewItem(items: LifeAreaItem[]): LifeAreaItem | null {
  return items.find((it) => it.short?.trim()) ?? null;
}

function getCombinedTags(items: LifeAreaItem[], limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of items.slice(0, limit)) {
    for (const tag of item.tags ?? []) {
      if (tag && !seen.has(tag)) {
        seen.add(tag);
        result.push(tag);
      }
    }
  }
  return result.slice(0, 3);
}

function truncateShort(text: string): string {
  if (!text || text.length <= SHORT_TRUNCATE) return text;
  return text.slice(0, SHORT_TRUNCATE).trim() + '…';
}

function truncateFull(text: string): string {
  if (!text) return '';
  const paragraphs = text.split(/\n\n+/);
  let lines = 0;
  const result: string[] = [];
  for (const p of paragraphs) {
    const pLines = Math.ceil(p.length / 60) || 1;
    if (lines + pLines > MAX_FULL_LINES) break;
    result.push(p);
    lines += pLines;
  }
  return result.join('\n\n');
}

function hasStructuredData(item: LifeAreaItem): boolean {
  return (
    (item.strengths?.length ?? 0) > 0 ||
    (item.challenges?.length ?? 0) > 0 ||
    (item.actionable?.length ?? 0) > 0
  );
}

const lifeAreas = computed<LifeAreas>(() => props.data?.life_areas ?? {});

const areaDefs = computed(() => {
  const entries = Object.entries(lifeAreas.value);
  return entries
    .filter(([, arr]) => Array.isArray(arr))
    .map(([key, arr]) => {
      const items = filterValidItems(arr as LifeAreaItem[]);
      const previewItem = getPreviewItem(items);
      const tags = getCombinedTags(items, 5);
      const label = LIFE_AREA_LABELS[key] ?? {
        title: key.charAt(0).toUpperCase() + key.slice(1),
        icon: '📌',
      };
      return {
        key,
        title: label.title,
        icon: label.icon,
        items,
        previewItem,
        tags,
        previewText: previewItem?.short?.trim() || PLACEHOLDER_TEXT,
      };
    });
});

const hasAnyValidContent = computed(() =>
  areaDefs.value.some((a) => a.items.length > 0)
);

const activeKey = ref<string | null>(null);

const activeArea = computed(() =>
  areaDefs.value.find((a) => a.key === activeKey.value) ?? areaDefs.value[0] ?? null
);

const displayItems = computed(() => {
  const area = activeArea.value;
  if (!area) return [];
  return area.items.slice(0, MAX_ITEMS_DISPLAY);
});

function selectArea(key: string) {
  const def = areaDefs.value.find((a) => a.key === key);
  if (!def) return;
  activeKey.value = key;
  emit('select-life-area', { key, title: def.title });
}

// Auto-select first area when areaDefs loads
watch(
  () => areaDefs.value,
  (defs) => {
    if (defs.length > 0 && !activeKey.value) {
      activeKey.value = defs[0].key;
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
$darkGrayBlue: #212429;
$lightGrayOrange: #e0d9d4;
$primaryWhite: #fafafa;
$gray: #bebec9;
$softOrange: #e9a87c;
$softOrangeTrans: rgba(233, 168, 124, 0.8);

.life-areas {
  width: 100%;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.life-areas__title {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.life-areas__subtitle {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
}

.life-areas__placeholder {
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

.life-areas__grid {
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.life-area-card {
  margin: 0;
  padding: 1.6rem;
  text-align: left;
  background: rgba($darkGrayBlue, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  min-height: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  &--active {
    border-color: $softOrangeTrans;
    box-shadow: 0 0 0 1px $softOrangeTrans, 0 4px 16px rgba(233, 168, 124, 0.15);
  }
}

.life-area-card__icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

.life-area-card__title {
  margin: 0 0 0.8rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: $lightGrayOrange;
  line-height: 1.35;
}

.life-area-card__preview {
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

.life-area-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.life-area-card__chip {
  padding: 0.35rem 0.7rem;
  font-size: 1.2rem;
  color: $softOrange;
  background: rgba(233, 168, 124, 0.1);
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
}

.life-area-card__link {
  font-size: 1.3rem;
  color: $softOrange;
  align-self: flex-start;
}

.life-areas__details {
  margin-top: 2rem;
  padding: 1.6rem;
  background: $darkGrayBlue;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.life-areas__details-title {
  margin: 0 0 1.6rem;
  font-size: 1.6rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.life-areas__item {
  margin-bottom: 2rem;

  &:last-of-type {
    margin-bottom: 0;
  }
}

.life-areas__item-title {
  margin: 0 0 0.6rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: $primaryWhite;
  line-height: 1.4;
}

.life-areas__item-full {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  line-height: 1.55;
  color: $primaryWhite;
}

.life-areas__item-struct {
  display: grid;
  gap: 1.2rem;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.life-areas__struct-col {
  .life-areas__struct-label {
    display: block;
    font-size: 1.1rem;
    color: $gray;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 0.4rem;
  }

  ul {
    margin: 0;
    padding-left: 1.4rem;
    font-size: 1.3rem;
    line-height: 1.5;
    color: $primaryWhite;
  }
}

.life-areas__disclaimer {
  margin: 1.6rem 0 0;
  padding-top: 1.2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 1.2rem;
  color: $gray;
  font-style: italic;
}
</style>
