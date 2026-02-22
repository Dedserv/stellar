<template>
  <section class="aspects">
    <h2 class="aspects__title">Аспекты</h2>
    <p class="aspects__subtitle">
      Связи между планетами и их напряжение/поддержка.
    </p>

    <template v-if="!hasAspects">
      <p class="aspects__placeholder">
        Аспекты для этой карты не найдены или ещё не посчитаны.
      </p>
    </template>
    <template v-else>
      <div class="aspects__filters">
        <div class="aspects__filter">
          <label for="aspects-category" class="aspects__label">Категория</label>
          <select
            id="aspects-category"
            v-model="selectedCategory"
            class="aspects__select"
          >
            <option value="">Все</option>
            <option value="harmonious">Гармоничные</option>
            <option value="tense">Напряжённые</option>
            <option value="conjunction">Соединения</option>
          </select>
        </div>
        <div class="aspects__filter aspects__filter--checkbox">
          <label class="aspects__checkbox-label">
            <input
              v-model="onlyStrong"
              type="checkbox"
              class="aspects__checkbox"
            />
            Показать только ключевые (strong)
          </label>
        </div>
        <div class="aspects__filter">
          <label for="aspects-planet" class="aspects__label">Фильтр по планете</label>
          <select
            id="aspects-planet"
            v-model="planetFilter"
            class="aspects__select"
          >
            <option value="">Все</option>
            <option
              v-for="p in planetOptions"
              :key="p.name"
              :value="p.name"
            >
              {{ p.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="aspects__grid">
        <article
          v-for="vm in filteredAspects"
          :key="vm.id"
          class="aspect-card"
          @click="onCardClick(vm)"
        >
          <div class="aspect-card__header">
            <span class="aspect-card__planets">
              <button
                type="button"
                class="aspect-card__planet-btn"
                @click.stop="emitSelectPlanet(vm.planet1, vm.label1)"
              >
                {{ planetIcon(vm.planet1) }} {{ vm.label1 }}
              </button>
              <span class="aspect-card__connector">{{ vm.typeLabel }}</span>
              <button
                type="button"
                class="aspect-card__planet-btn"
                @click.stop="emitSelectPlanet(vm.planet2, vm.label2)"
              >
                {{ planetIcon(vm.planet2) }} {{ vm.label2 }}
              </button>
            </span>
            <span class="aspect-card__badge" :class="`aspect-card__badge--${vm.category}`">
              {{ categoryLabel(vm.category) }}
            </span>
          </div>
          <p class="aspect-card__short">{{ vm.short ?? 'Описание появится позже.' }}</p>
          <p class="aspect-card__meta">
            Орб: {{ vm.orb.toFixed(1) }}° · {{ vm.exact ? 'Точный' : 'Не точный' }}
          </p>
          <div class="aspect-card__weight">
            <div class="aspect-card__weight-bar">
              <div
                class="aspect-card__weight-fill"
                :style="{ width: `${weightDisplay(vm.weight)}%` }"
              />
            </div>
            <span class="aspect-card__weight-value">{{ weightDisplay(vm.weight) }}/10</span>
          </div>
          <template v-if="vm.full">
            <button
              type="button"
              class="aspect-card__btn"
              @click.stop="toggleExpanded(vm.id)"
            >
              {{ expandedIds.has(vm.id) ? 'Свернуть' : 'Подробнее' }}
            </button>
            <Transition name="expand">
              <div v-show="expandedIds.has(vm.id)" class="aspect-card__expand">
                <p class="aspect-card__full">{{ vm.full }}</p>
                <div class="aspect-card__tech">
                  <p><strong>Тип:</strong> {{ vm.type }}</p>
                  <p><strong>Планеты:</strong> {{ vm.planet1 }}, {{ vm.planet2 }}</p>
                  <p><strong>Орб:</strong> {{ vm.orb.toFixed(2) }}° · <strong>Угол:</strong> {{ vm.angle.toFixed(1) }}°</p>
                </div>
              </div>
            </Transition>
          </template>
        </article>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import type {
  AstroApiResponse,
  Aspect,
  AspectCategory,
  AspectViewModel,
  StrongAspect,
} from '~/types/natal';

const props = defineProps<{
  data: AstroApiResponse;
}>();

const emit = defineEmits<{
  (e: 'select-planet', payload: { name: string; label: string }): void;
  (e: 'select-aspect', payload: { id: string; planet1: string; planet2: string; type: string }): void;
}>();

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

const PLANET_ICONS: Record<string, string> = {
  sun: '☀️',
  moon: '🌙',
  mercury: '☿️',
  venus: '♀️',
  mars: '♂️',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  ascendant: '⬆️',
};

const ASPECT_TYPE_LABELS: Record<string, string> = {
  conjunction: 'Соединение',
  opposition: 'Оппозиция',
  trine: 'Трин',
  sextile: 'Секстиль',
  square: 'Квадрат',
};

const CATEGORY_LABELS: Record<AspectCategory, string> = {
  harmonious: 'Гармоничный',
  tense: 'Напряжённый',
  conjunction: 'Соединение',
  other: 'Другой',
};

const BASE_WEIGHTS: Record<string, number> = {
  conjunction: 1.0,
  opposition: 0.9,
  square: 0.85,
  trine: 0.8,
  sextile: 0.7,
};

const ORB_TOLERANCE = 1;

function getCategory(type: string): AspectCategory {
  if (type === 'conjunction') return 'conjunction';
  if (['trine', 'sextile'].includes(type)) return 'harmonious';
  if (['square', 'opposition'].includes(type)) return 'tense';
  return 'other';
}

function findStrongAspect(
  a: Aspect,
  strongAspects: StrongAspect[]
): StrongAspect | undefined {
  return strongAspects.find(
    (sa) =>
      sa.type === a.type &&
      ((sa.planet1 === a.planet1 && sa.planet2 === a.planet2) ||
        (sa.planet1 === a.planet2 && sa.planet2 === a.planet1)) &&
      Math.abs((sa.orb ?? 0) - (a.orb ?? 0)) <= ORB_TOLERANCE
  );
}

function canUseDescription(a: Aspect): boolean {
  const nested = a.description;
  const desc = nested?.description;
  if (!desc) return false;
  if (nested.type === 'fallback') return false;
  if (desc.needs_review || desc.lang !== 'ru') return false;
  return nested.type === 'sign_combo' || nested.type === 'aspect';
}

function buildAspectViewModels(data: AstroApiResponse): AspectViewModel[] {
  const aspects = data.aspects ?? [];
  const planets = data.planets ?? [];
  const strongAspects = data.highlights?.metrics?.strongAspects ?? [];
  const hasStrongAspects = strongAspects.length > 0;

  let maxWeight = 0;
  if (hasStrongAspects) {
    for (const sa of strongAspects) {
      if ((sa.weight ?? 0) > maxWeight) maxWeight = sa.weight ?? 0;
    }
  }

  return aspects.map((a) => {
    const id = `${a.planet1}_${a.planet2}_${a.type}`;
    const label1 = PLANET_LABELS[a.planet1] ?? a.planet1;
    const label2 = PLANET_LABELS[a.planet2] ?? a.planet2;
    const typeLabel = ASPECT_TYPE_LABELS[a.type] ?? a.type;
    const category = getCategory(a.type);
    const orb = a.orb ?? 0;
    const exact = a.exact ?? false;
    const angle = a.angle ?? a.rawAngle ?? 0;

    let weight: number;
    let isStrong: boolean;

    if (hasStrongAspects) {
      const sa = findStrongAspect(a, strongAspects);
      if (sa) {
        const rawWeight = sa.weight ?? 0;
        weight = maxWeight > 0 ? rawWeight / maxWeight : rawWeight;
        isStrong = true;
      } else {
        const base = BASE_WEIGHTS[a.type] ?? 0.5;
        const orbFactor = Math.max(0, Math.min(1, 1 - orb / 8));
        weight = base * orbFactor;
        isStrong = weight >= 0.7;
      }
    } else {
      const base = BASE_WEIGHTS[a.type] ?? 0.5;
      const orbFactor = Math.max(0, Math.min(1, 1 - orb / 8));
      weight = base * orbFactor;
      isStrong = weight >= 0.7;
    }

    let short: string | undefined;
    let full: string | undefined;
    if (canUseDescription(a)) {
      short = a.description?.description?.short;
      full = a.description?.description?.full;
    }

    return {
      id,
      planet1: a.planet1,
      planet2: a.planet2,
      label1,
      label2,
      type: a.type,
      typeLabel,
      category,
      orb,
      exact,
      weight,
      isStrong,
      short,
      full,
      angle,
    };
  });
}

const hasAspects = computed(() => (props.data?.aspects?.length ?? 0) > 0);

const aspectViewModels = computed<AspectViewModel[]>(() => {
  if (!props.data) return [];
  return buildAspectViewModels(props.data);
});

const planetOptions = computed(() => {
  const planets = props.data?.planets ?? [];
  return planets.map((p) => ({
    name: p.name,
    label: PLANET_LABELS[p.name] ?? p.name,
  }));
});

const selectedCategory = ref<string>('');
const onlyStrong = ref(false);
const planetFilter = ref<string>('');
const expandedIds = ref<Set<string>>(new Set());

const filteredAspects = computed(() => {
  let list = [...aspectViewModels.value];

  if (selectedCategory.value) {
    list = list.filter((vm) => vm.category === selectedCategory.value);
  }

  if (onlyStrong.value) {
    list = list.filter((vm) => vm.isStrong);
  }

  if (planetFilter.value) {
    list = list.filter(
      (vm) => vm.planet1 === planetFilter.value || vm.planet2 === planetFilter.value
    );
  }

  list.sort((a, b) => b.weight - a.weight);
  return list;
});

function planetIcon(name: string): string {
  return PLANET_ICONS[name] ?? '✦';
}

function categoryLabel(category: AspectCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

function weightDisplay(weight: number): number {
  return Math.round(weight * 10);
}

function toggleExpanded(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expandedIds.value = next;
}

function onCardClick(vm: AspectViewModel) {
  emit('select-aspect', {
    id: vm.id,
    planet1: vm.planet1,
    planet2: vm.planet2,
    type: vm.type,
  });
}

function emitSelectPlanet(name: string, label: string) {
  emit('select-planet', { name, label });
}
</script>

<style scoped lang="scss">
$darkGrayBlue: #212429;
$lightGrayOrange: #e0d9d4;
$primaryWhite: #fafafa;
$gray: #bebec9;
$softOrange: #e9a87c;
$softOrangeTrans: rgba(233, 168, 124, 0.8);

.aspects {
  width: 100%;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.aspects__title {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.aspects__subtitle {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
}

.aspects__placeholder {
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

.aspects__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 1.6rem;
}

.aspects__filter {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;

  &--checkbox {
    justify-content: flex-end;
  }
}

.aspects__label {
  font-size: 1.1rem;
  color: $gray;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.aspects__select {
  padding: 0.6rem 1rem;
  font-size: 1.3rem;
  color: $primaryWhite;
  background: rgba($darkGrayBlue, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.6rem;
  cursor: pointer;
  min-width: 14rem;
}

.aspects__checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1.3rem;
  color: $primaryWhite;
  cursor: pointer;
}

.aspects__checkbox {
  width: 1.6rem;
  height: 1.6rem;
  cursor: pointer;
}

.aspects__grid {
  display: grid;
  gap: 1.6rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.aspect-card {
  margin: 0;
  padding: 1.6rem;
  text-align: left;
  background: rgba($darkGrayBlue, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }
}

.aspect-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.aspect-card__planets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem 0.6rem;
}

.aspect-card__planet-btn {
  margin: 0;
  padding: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: $softOrange;
  background: transparent;
  border: none;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.2em;

  &:hover {
    opacity: 0.9;
  }
}

.aspect-card__connector {
  font-size: 1.3rem;
  color: $gray;
  margin: 0 0.2rem;
}

.aspect-card__badge {
  padding: 0.25rem 0.6rem;
  font-size: 1.1rem;
  border-radius: 0.4rem;

  &--harmonious {
    color: #7cb87c;
    background: rgba(124, 184, 124, 0.15);
    border: 1px solid rgba(124, 184, 124, 0.4);
  }

  &--tense {
    color: #c87c7c;
    background: rgba(200, 124, 124, 0.15);
    border: 1px solid rgba(200, 124, 124, 0.4);
  }

  &--conjunction {
    color: $softOrange;
    background: rgba(233, 168, 124, 0.1);
    border: 1px solid $softOrangeTrans;
  }

  &--other {
    color: $gray;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }
}

.aspect-card__short {
  margin: 0 0 0.8rem;
  font-size: 1.35rem;
  line-height: 1.5;
  color: $primaryWhite;
}

.aspect-card__meta {
  margin: 0 0 0.8rem;
  font-size: 1.2rem;
  color: $gray;
}

.aspect-card__weight {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.aspect-card__weight-bar {
  flex: 1;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  overflow: hidden;
}

.aspect-card__weight-fill {
  height: 100%;
  background: $softOrange;
  border-radius: 0.25rem;
  transition: width 0.3s;
}

.aspect-card__weight-value {
  font-size: 1.2rem;
  color: $gray;
  min-width: 3rem;
}

.aspect-card__btn {
  margin: 0 0 0.8rem;
  padding: 0.4rem 0.8rem;
  font-size: 1.2rem;
  color: $softOrange;
  background: transparent;
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;

  &:hover {
    opacity: 0.9;
    background: rgba(233, 168, 124, 0.1);
  }
}

.aspect-card__expand {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.aspect-card__full {
  margin: 0 0 1rem;
  font-size: 1.35rem;
  line-height: 1.55;
  color: $primaryWhite;
}

.aspect-card__tech {
  font-size: 1.2rem;
  color: $gray;

  p {
    margin: 0.4rem 0 0;
  }
}

.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.2s ease, max-height 0.25s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}
</style>
