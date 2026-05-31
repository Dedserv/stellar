<template>
  <section :id="sectionId" class="aspects container">
    <h2 class="aspects__title">Аспекты</h2>
    <p class="aspects__subtitle">Связи между планетами и их напряжение/поддержка.</p>

    <template v-if="!hasAspects">
      <p class="aspects__placeholder">Аспекты для этой карты не найдены или ещё не посчитаны.</p>
    </template>
    <template v-else>
      <div class="aspects__filters">
        <FilterChips
          v-model="selectedCategory"
          class="aspects__filter"
          label="Категория"
          aria-label="Фильтр по категории аспектов"
          name="aspects-category"
          :options="categoryOptions"
        />
        <FilterChips
          v-model="onlyStrong"
          class="aspects__filter aspects__filter--toggle"
          toggle
          toggle-label="Ключевые"
          aria-label="Показать только ключевые аспекты"
        />
        <FilterChips
          v-model="planetFilter"
          class="aspects__filter aspects__filter--planets"
          label="Фильтр по планете"
          aria-label="Фильтр аспектов по планете"
          name="aspects-planet"
          :options="planetFilterOptions"
        />
      </div>

      <div v-if="groupedAspects.length === 0" class="aspects__empty-filter">
        Нет аспектов по выбранным фильтрам.
      </div>

      <div v-else class="aspects__accordion">
        <div v-for="group in groupedAspects" :key="group.category" class="aspects__group">
          <button
            type="button"
            class="aspects__group-header"
            :aria-expanded="isGroupExpanded(group.category)"
            :aria-controls="`aspects-panel-${group.category}`"
            @click="toggleGroup(group.category)"
          >
            <span class="aspects__group-title">
              <span class="aspects__group-label">{{ group.label }}</span>
              <span class="aspects__group-count" :class="`aspects__group-count--${group.category}`">
                {{ group.aspects.length }}
              </span>
            </span>
            <span
              class="aspects__group-chevron"
              :class="{ 'aspects__group-chevron--open': isGroupExpanded(group.category) }"
              aria-hidden="true"
            />
          </button>

          <div
            :id="`aspects-panel-${group.category}`"
            v-show="isGroupExpanded(group.category)"
            class="aspects__group-panel"
          >
            <div class="aspects__grid">
              <article
                v-for="vm in group.aspects"
                :key="vm.id"
                class="aspect-card"
                :class="`aspect-card--${vm.category}`"
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
                      :class="`aspect-card__weight-fill--${vm.category}`"
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
                        <p>
                          <strong>Тип:</strong>
                          {{ vm.type }}
                        </p>
                        <p>
                          <strong>Планеты:</strong>
                          {{ vm.planet1 }}, {{ vm.planet2 }}
                        </p>
                        <p>
                          <strong>Орб:</strong>
                          {{ vm.orb.toFixed(2) }}° ·
                          <strong>Угол:</strong>
                          {{ vm.angle.toFixed(1) }}°
                        </p>
                      </div>
                    </div>
                  </Transition>
                </template>
              </article>
            </div>
          </div>
        </div>
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
    id?: string;
  }>();

  const sectionId = computed(() => props.id);

  const emit = defineEmits<{
    (e: 'select-planet', payload: { name: string; label: string }): void;
    (
      e: 'select-aspect',
      payload: { id: string; planet1: string; planet2: string; type: string }
    ): void;
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

  const GROUP_ORDER: AspectCategory[] = ['harmonious', 'tense', 'conjunction', 'other'];

  const GROUP_SECTION_LABELS: Record<AspectCategory, string> = {
    harmonious: 'Гармоничные',
    tense: 'Напряжённые',
    conjunction: 'Соединения',
    other: 'Другие',
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

  function findStrongAspect(a: Aspect, strongAspects: StrongAspect[]): StrongAspect | undefined {
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

  const categoryOptions = [
    { value: '', label: 'Все' },
    { value: 'harmonious', label: 'Гармоничные' },
    { value: 'tense', label: 'Напряжённые' },
    { value: 'conjunction', label: 'Соединения' },
  ];

  const planetFilterOptions = computed(() => [
    { value: '', label: 'Все' },
    ...planetOptions.value.map((p) => ({ value: p.name, label: p.label })),
  ]);

  const selectedCategory = ref<string>('');
  const onlyStrong = ref(false);
  const planetFilter = ref<string>('');
  const expandedIds = ref<Set<string>>(new Set());
  const expandedGroups = ref<Set<AspectCategory>>(new Set());

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

  const groupedAspects = computed(() => {
    const buckets = new Map<AspectCategory, AspectViewModel[]>();
    for (const cat of GROUP_ORDER) {
      buckets.set(cat, []);
    }
    for (const vm of filteredAspects.value) {
      buckets.get(vm.category)?.push(vm);
    }
    return GROUP_ORDER.filter((cat) => (buckets.get(cat)?.length ?? 0) > 0).map((cat) => ({
      category: cat,
      label: GROUP_SECTION_LABELS[cat],
      aspects: buckets.get(cat)!,
    }));
  });

  function ensureDefaultExpanded() {
    const visible = groupedAspects.value;
    const next = new Set(expandedGroups.value);

    for (const cat of next) {
      if (!visible.some((g) => g.category === cat)) {
        next.delete(cat);
      }
    }

    if (next.size === 0 && visible.length > 0) {
      next.add(visible[0].category);
    }

    expandedGroups.value = next;
  }

  watch(groupedAspects, ensureDefaultExpanded, { immediate: true });

  function isGroupExpanded(category: AspectCategory): boolean {
    return expandedGroups.value.has(category);
  }

  function toggleGroup(category: AspectCategory) {
    const next = new Set(expandedGroups.value);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    expandedGroups.value = next;
  }

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

<style scoped>
  @import '~/assets/css/variables.css';

  .aspects {
    width: 100%;
    min-width: 0;
    overflow-x: clip;
    margin-top: 2.4rem;
    margin-bottom: 2.4rem;
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

  .aspects__empty-filter {
    margin: 0;
    padding: 1.6rem;
    font-size: 1.3rem;
    color: $gray;
    font-style: italic;
    text-align: center;
    background: $darkGrayBlue;
    border-radius: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .aspects__filters {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    margin-bottom: 1.6rem;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .aspects__filter {
    flex: 1 1 100%;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    contain: inline-size;

    @mixin tablet {
      flex: 1 1 auto;
    }
  }

  .aspects__filter--toggle {
    flex: 0 0 auto;
    width: auto;
    contain: none;
    align-self: flex-end;

    @mixin tablet {
      align-self: flex-start;
      padding-top: 2rem;
    }
  }

  .aspects__filter--planets {
    flex: 1 1 100%;
    width: 100%;
    max-width: 100%;
  }

  .aspects__accordion {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .aspects__group {
    background: rgba(33, 36, 41, 0.5);
    border-radius: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .aspects__group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin: 0;
    padding: 1.2rem 1.6rem;
    font-family: inherit;
    text-align: left;
    color: $lightGrayOrange;
    background: transparent;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
  }

  .aspects__group-header:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .aspects__group-title {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }

  .aspects__group-label {
    font-size: 1.5rem;
    font-weight: 600;
  }

  .aspects__group-count {
    padding: 0.2rem 0.55rem;
    font-size: 1.1rem;
    font-weight: 500;
    border-radius: 0.4rem;
  }

  .aspects__group-count--harmonious {
    color: rgba(100, 180, 130, 0.95);
    background: rgba(100, 180, 130, 0.15);
    border: 1px solid rgba(100, 180, 130, 0.4);
  }

  .aspects__group-count--tense {
    color: rgba(210, 95, 95, 0.95);
    background: rgba(210, 95, 95, 0.15);
    border: 1px solid rgba(210, 95, 95, 0.4);
  }

  .aspects__group-count--conjunction {
    color: $softOrange;
    background: rgba(233, 168, 124, 0.1);
    border: 1px solid $softOrangeTrans;
  }

  .aspects__group-count--other {
    color: $gray;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  .aspects__group-chevron {
    flex-shrink: 0;
    width: 0.8rem;
    height: 0.8rem;
    border-right: 2px solid $gray;
    border-bottom: 2px solid $gray;
    transform: rotate(45deg);
    transition: transform 0.2s ease;
  }

  .aspects__group-chevron--open {
    transform: rotate(-135deg);
  }

  .aspects__group-panel {
    padding: 0 1.6rem 1.6rem;
  }

  .aspects__grid {
    display: grid;
    gap: 1.6rem;
    grid-template-columns: 1fr;

    @mixin tablet {
      grid-template-columns: repeat(2, 1fr);
    }

    @mixin desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .aspect-card {
    margin: 0;
    padding: 1.6rem;
    text-align: left;
    background: rgba(33, 36, 41, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left-width: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition:
      border-color 0.2s,
      box-shadow 0.2s;
  }

  .aspect-card:hover {
    border-color: rgba(255, 255, 255, 0.12);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }

  .aspect-card--harmonious {
    border-left-color: rgba(100, 180, 130, 0.85);
  }

  .aspect-card--tense {
    border-left-color: rgba(210, 95, 95, 0.85);
  }

  .aspect-card--conjunction {
    border-left-color: $softOrange;
  }

  .aspect-card--other {
    border-left-color: $gray;
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
  }

  .aspect-card__planet-btn:hover {
    opacity: 0.9;
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
  }

  .aspect-card__badge--harmonious {
    color: rgba(100, 180, 130, 0.95);
    background: rgba(100, 180, 130, 0.15);
    border: 1px solid rgba(100, 180, 130, 0.4);
  }

  .aspect-card__badge--tense {
    color: rgba(210, 95, 95, 0.95);
    background: rgba(210, 95, 95, 0.15);
    border: 1px solid rgba(210, 95, 95, 0.4);
  }

  .aspect-card__badge--conjunction {
    color: $softOrange;
    background: rgba(233, 168, 124, 0.1);
    border: 1px solid $softOrangeTrans;
  }

  .aspect-card__badge--other {
    color: $gray;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
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
    border-radius: 0.25rem;
    transition: width 0.3s;
  }

  .aspect-card__weight-fill--harmonious {
    background: rgba(100, 180, 130, 0.85);
  }

  .aspect-card__weight-fill--tense {
    background: rgba(210, 95, 95, 0.85);
  }

  .aspect-card__weight-fill--conjunction {
    background: $softOrange;
  }

  .aspect-card__weight-fill--other {
    background: $gray;
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
    transition:
      opacity 0.2s,
      background 0.2s;
  }

  .aspect-card__btn:hover {
    opacity: 0.9;
    background: rgba(233, 168, 124, 0.1);
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
  }

  .aspect-card__tech p {
    margin: 0.4rem 0 0;
  }

  .expand-enter-active,
  .expand-leave-active {
    transition:
      opacity 0.2s ease,
      max-height 0.25s ease;
  }

  .expand-enter-from,
  .expand-leave-to {
    opacity: 0;
  }
</style>
