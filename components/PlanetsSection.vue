<template>
  <section class="planets">
    <h2 class="planets__title">Планеты</h2>
    <p class="planets__subtitle">
      Как распределены акценты по планетам вашей карты.
    </p>

    <template v-if="!hasPlanets">
      <p class="planets__placeholder">
        Данные по планетам недоступны. Попробуйте позже.
      </p>
    </template>
    <template v-else>
      <div class="planets__filters">
        <div class="planets__filter">
          <label for="planets-sort" class="planets__label">Сортировка</label>
          <select
            id="planets-sort"
            v-model="sortBy"
            class="planets__select"
          >
            <option value="importance">По важности</option>
            <option value="house">По домам</option>
          </select>
        </div>
        <div class="planets__filter">
          <label for="planets-life-area" class="planets__label">Сфера жизни</label>
          <select
            id="planets-life-area"
            v-model="lifeAreaFilter"
            class="planets__select"
          >
            <option value="">Все сферы</option>
            <option
              v-for="(label, key) in LIFE_AREA_LABELS"
              :key="key"
              :value="key"
            >
              {{ label }}
            </option>
          </select>
        </div>
      </div>

      <div class="planets__grid">
        <button
          v-for="vm in filteredViewModels"
          :key="vm.name"
          type="button"
          class="planet-card"
          @click="openModal(vm)"
        >
          <span class="planet-card__icon">{{ planetIcon(vm.name) }}</span>
          <h3 class="planet-card__title">{{ vm.label }}</h3>
          <p class="planet-card__position">
            в {{ vm.signLabel }}, {{ vm.houseLabel }}
          </p>
          <div class="planet-card__importance">
            <div class="planet-card__importance-bar">
              <div
                class="planet-card__importance-fill"
                :style="{ width: `${importanceDisplay(vm.importance)}%` }"
              />
            </div>
            <span class="planet-card__importance-value">{{ importanceDisplay(vm.importance) }}/10</span>
          </div>
          <div v-if="vm.lifeAreas.length > 0" class="planet-card__life-areas">
            <span
              v-for="area in vm.lifeAreas.slice(0, 3)"
              :key="area"
              class="planet-card__chip"
            >{{ area }}</span>
          </div>
          <div v-if="vm.tags.length > 0" class="planet-card__tags">
            <span
              v-for="tag in vm.tags.slice(0, 3)"
              :key="tag"
              class="planet-card__tag"
            >{{ tag }}</span>
          </div>
        </button>
      </div>

      <Teleport to="body">
        <Transition name="modal">
          <div v-if="selectedPlanet" class="planets-modal">
            <div class="planets-modal__overlay" @click="closeModal" />
            <div class="planets-modal__content">
              <div class="planets-modal__header">
                <h3 class="planets-modal__title">
                  {{ planetIcon(selectedPlanet.name) }} {{ selectedPlanet.label }}
                </h3>
                <button
                  type="button"
                  class="planets-modal__close"
                  aria-label="Закрыть"
                  @click="closeModal"
                >
                  ×
                </button>
              </div>
              <div class="planets-modal__body">
                <div class="planets-modal__block">
                  <h4 class="planets-modal__block-title">Положение</h4>
                  <div class="planets-modal__position">
                    <p class="planets-modal__label">В знаке</p>
                    <template v-if="!canShowSignDesc">
                      <p class="planets-modal__placeholder">Описание появится позже</p>
                    </template>
                    <template v-else>
                      <p class="planets-modal__short">{{ signDesc?.short }}</p>
                      <template v-if="signDesc?.full">
                        <div
                          class="planets-modal__expand"
                          :class="{ 'planets-modal__expand--open': expandedSign }"
                        >
                          <p class="planets-modal__full">{{ signDesc.full }}</p>
                        </div>
                        <button
                          type="button"
                          class="planets-modal__btn"
                          @click="expandedSign = !expandedSign"
                        >
                          {{ expandedSign ? 'Свернуть' : 'Подробнее' }}
                        </button>
                      </template>
                    </template>
                  </div>
                  <div class="planets-modal__position">
                    <p class="planets-modal__label">В доме</p>
                    <template v-if="!canShowHouseDesc">
                      <p class="planets-modal__placeholder">Описание появится позже</p>
                    </template>
                    <template v-else>
                      <p class="planets-modal__short">{{ houseDesc?.short }}</p>
                      <template v-if="houseDesc?.full">
                        <div
                          class="planets-modal__expand"
                          :class="{ 'planets-modal__expand--open': expandedHouse }"
                        >
                          <p class="planets-modal__full">{{ houseDesc.full }}</p>
                        </div>
                        <button
                          type="button"
                          class="planets-modal__btn"
                          @click="expandedHouse = !expandedHouse"
                        >
                          {{ expandedHouse ? 'Свернуть' : 'Подробнее' }}
                        </button>
                      </template>
                    </template>
                  </div>
                </div>

                <div class="planets-modal__block">
                  <h4 class="planets-modal__block-title">Аспекты</h4>
                  <template v-if="planetAspects.length === 0">
                    <p class="planets-modal__placeholder">Аспектов нет</p>
                  </template>
                  <template v-else>
                    <div
                      v-for="group in aspectGroups"
                      :key="group.type"
                      class="planets-modal__aspect-group"
                    >
                      <p class="planets-modal__aspect-group-label">{{ group.label }}</p>
                      <ul class="planets-modal__aspect-list">
                        <li
                          v-for="a in group.aspects"
                          :key="`${a.planet1}-${a.planet2}-${a.type}`"
                          class="planets-modal__aspect-item"
                        >
                          <span class="planets-modal__aspect-type">{{ aspectTypeLabel(a.type) }}</span>
                          <span class="planets-modal__aspect-planets">
                            {{ planetLabel(a.planet1) }} — {{ planetLabel(a.planet2) }}
                          </span>
                          <span class="planets-modal__aspect-orb">орб {{ a.orb.toFixed(1) }}°</span>
                          <p
                            v-if="aspectDescriptionShort(a)"
                            class="planets-modal__aspect-desc"
                          >
                            {{ aspectDescriptionShort(a) }}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </template>
                </div>

                <div v-if="selectedLifeAreasWithKeys.length > 0" class="planets-modal__block">
                  <h4 class="planets-modal__block-title">Связанные сферы жизни</h4>
                  <ul class="planets-modal__life-list">
                    <li
                      v-for="{ key, label, genitive } in selectedLifeAreasWithKeys"
                      :key="key"
                      class="planets-modal__life-item"
                    >
                      Сильное влияние этой планеты проявляется в области {{ genitive }}.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </template>
  </section>
</template>

<script setup lang="ts">
import type {
  AstroApiResponse,
  Aspect,
  NestedDescription,
  Planet,
  PlanetViewModel,
} from '~/types/natal';
import { canShowFullDescription } from '~/types/natal';

const props = defineProps<{
  data: AstroApiResponse;
}>();

const emit = defineEmits<{
  (e: 'select-planet', payload: { name: string; label: string }): void;
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

const SIGN_LABELS: Record<string, string> = {
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

const LIFE_AREA_LABELS: Record<string, string> = {
  relationships: 'Отношения',
  career: 'Карьера',
  finance: 'Финансы',
  health: 'Здоровье',
  family: 'Семья',
  spirituality: 'Духовность',
  creativity: 'Творчество',
};

const LIFE_AREA_GENITIVE: Record<string, string> = {
  relationships: 'отношений',
  career: 'карьеры',
  finance: 'финансов',
  health: 'здоровья',
  family: 'семьи',
  spirituality: 'духовности',
  creativity: 'творчества',
};

const ASPECT_TYPE_LABELS: Record<string, string> = {
  conjunction: 'Соединение',
  opposition: 'Оппозиция',
  trine: 'Трин',
  sextile: 'Секстиль',
  square: 'Квадрат',
};

const ANGULAR_HOUSES = [1, 4, 7, 10];
const BASE_WEIGHTS: Record<string, number> = {
  sun: 0.9,
  moon: 0.85,
  ascendant: 0.8,
};
const ANGULAR_BONUS = 0.3;
const STRONG_ORB_THRESHOLD = 3;

function buildPlanetImportance(data: AstroApiResponse): Map<string, number> {
  const result = new Map<string, number>();
  const planets = data.planets ?? [];
  const strongAspects = data.highlights?.metrics?.strongAspects ?? [];
  const aspects = data.aspects ?? [];

  for (const p of planets) {
    let score = BASE_WEIGHTS[p.name] ?? 0.5;

    for (const sa of strongAspects) {
      if (sa.planet1 === p.name || sa.planet2 === p.name) {
        score += sa.weight ?? 0;
      }
    }

    if (ANGULAR_HOUSES.includes(p.house)) {
      score += ANGULAR_BONUS;
    }

    result.set(p.name, score);
  }

  if (strongAspects.length === 0) {
    for (const p of planets) {
      let score = result.get(p.name) ?? BASE_WEIGHTS[p.name] ?? 0.5;
      const planetAspects = aspects.filter(
        (a) => (a.planet1 === p.name || a.planet2 === p.name) && (a.orb ?? 99) <= STRONG_ORB_THRESHOLD
      );
      score += planetAspects.length * 0.15;
      if (ANGULAR_HOUSES.includes(p.house)) {
        score += ANGULAR_BONUS;
      }
      result.set(p.name, score);
    }
  }

  let maxScore = 0;
  for (const s of result.values()) {
    if (s > maxScore) maxScore = s;
  }
  if (maxScore > 0) {
    for (const [name, s] of result) {
      result.set(name, Math.min(1, s / maxScore));
    }
  }
  return result;
}

function buildPlanetLifeAreas(data: AstroApiResponse): Map<string, string[]> {
  const result = new Map<string, string[]>();
  const highlights = [...(data.highlights?.top ?? []), ...(data.highlights?.all ?? [])];

  for (const h of highlights) {
    const planets = h.related?.planets ?? [];
    const lifeAreas = h.related?.lifeAreas ?? [];
    if (planets.length === 0 || lifeAreas.length === 0) continue;

    for (const planetName of planets) {
      const existing = result.get(planetName) ?? [];
      const merged = [...new Set([...existing, ...lifeAreas])];
      result.set(planetName, merged);
    }
  }

  return result;
}

function buildPlanetViewModels(data: AstroApiResponse): PlanetViewModel[] {
  const planets = data.planets ?? [];
  const aspects = data.aspects ?? [];
  const strongAspects = data.highlights?.metrics?.strongAspects ?? [];
  const importanceMap = buildPlanetImportance(data);
  const lifeAreaMap = buildPlanetLifeAreas(data);

  return planets.map((p) => {
    const signKey = p.sign?.toLowerCase() ?? '';
    const signLabel = SIGN_LABELS[signKey] ?? p.sign;
    const house = p.house ?? 1;
    const houseLabel = house === 1 ? '1 дом' : `${house} дом`;

    const planetAspects = aspects.filter(
      (a) => a.planet1 === p.name || a.planet2 === p.name
    );
    const strongCount = planetAspects.filter((a) => {
      const sa = strongAspects.find(
        (s) =>
          (s.planet1 === a.planet1 && s.planet2 === a.planet2) ||
          (s.planet1 === a.planet2 && s.planet2 === a.planet1)
      );
      return !!sa || (a.orb ?? 99) <= STRONG_ORB_THRESHOLD;
    }).length;

    const signTags = p.description?.sign?.description?.tags ?? [];
    const houseTags = p.description?.house?.description?.tags ?? [];
    const allTags = [...new Set([...signTags, ...houseTags])].filter(Boolean).slice(0, 5);

    const lifeAreaKeys = lifeAreaMap.get(p.name) ?? [];
    const lifeAreas = lifeAreaKeys
      .map((k) => LIFE_AREA_LABELS[k] ?? k)
      .filter(Boolean);

    const importance = importanceMap.get(p.name) ?? 0.5;

    return {
      lifeAreaKeys,
      name: p.name,
      label: PLANET_LABELS[p.name] ?? p.name,
      sign: p.sign,
      signLabel,
      house,
      houseLabel,
      importance,
      aspectsCount: planetAspects.length,
      strongAspectsCount: strongCount,
      tags: allTags,
      lifeAreas,
      _raw: p,
    };
  });
}

const hasPlanets = computed(() => (props.data?.planets?.length ?? 0) > 0);

const viewModels = computed<PlanetViewModel[]>(() => {
  if (!props.data) return [];
  return buildPlanetViewModels(props.data);
});

const sortBy = ref<'importance' | 'house'>('importance');
const lifeAreaFilter = ref<string>('');

const filteredViewModels = computed(() => {
  let list = [...viewModels.value];

  if (lifeAreaFilter.value) {
    list = list.filter((vm) =>
      (lifeAreaMapForFilter.value.get(vm.name) ?? []).includes(lifeAreaFilter.value)
    );
  }

  if (sortBy.value === 'importance') {
    list.sort((a, b) => b.importance - a.importance);
  } else {
    list.sort((a, b) => a.house - b.house || b.importance - a.importance);
  }
  return list;
});

const lifeAreaMapForFilter = computed(() => buildPlanetLifeAreas(props.data));

const selectedPlanet = ref<PlanetViewModel | null>(null);
const expandedSign = ref(false);
const expandedHouse = ref(false);

const { lock, unlock } = useBodyScrollLock();

function openModal(vm: PlanetViewModel) {
  selectedPlanet.value = vm;
  expandedSign.value = false;
  expandedHouse.value = false;
  lock();
  emit('select-planet', { name: vm.name, label: vm.label });
}

function closeModal() {
  selectedPlanet.value = null;
  unlock();
}

watch(
  () => selectedPlanet.value,
  (val) => {
    if (!val) unlock();
  }
);

const signDesc = computed(() => selectedPlanet.value?._raw?.description?.sign?.description);
const houseDesc = computed(() => selectedPlanet.value?._raw?.description?.house?.description);

const canShowSignDesc = computed(() =>
  canShowFullDescription(selectedPlanet.value?._raw?.description?.sign)
);
const canShowHouseDesc = computed(() =>
  canShowFullDescription(selectedPlanet.value?._raw?.description?.house)
);

const selectedLifeAreasWithKeys = computed(() => {
  const planet = selectedPlanet.value;
  if (!planet?.lifeAreaKeys?.length) return [];
  return planet.lifeAreaKeys.map((key) => ({
    key,
    label: LIFE_AREA_LABELS[key] ?? key,
    genitive: LIFE_AREA_GENITIVE[key] ?? (LIFE_AREA_LABELS[key] ?? key).toLowerCase(),
  }));
});

const planetAspects = computed<Aspect[]>(() => {
  const name = selectedPlanet.value?.name;
  if (!name || !props.data?.aspects) return [];
  return props.data.aspects.filter((a) => a.planet1 === name || a.planet2 === name);
});

const HARMONIOUS = ['trine', 'sextile'];
const TENSE = ['square', 'opposition'];

const aspectGroups = computed(() => {
  const harmonious: Aspect[] = [];
  const tense: Aspect[] = [];
  const conj: Aspect[] = [];

  for (const a of planetAspects.value) {
    if (a.type === 'conjunction') conj.push(a);
    else if (HARMONIOUS.includes(a.type)) harmonious.push(a);
    else if (TENSE.includes(a.type)) tense.push(a);
  }

  const groups: { type: string; label: string; aspects: Aspect[] }[] = [];
  if (conj.length) groups.push({ type: 'conjunction', label: 'Соединения', aspects: conj });
  if (harmonious.length)
    groups.push({ type: 'harmonious', label: 'Гармоничные', aspects: harmonious });
  if (tense.length) groups.push({ type: 'tense', label: 'Напряжённые', aspects: tense });
  return groups;
});

function planetIcon(name: string): string {
  return PLANET_ICONS[name] ?? '✦';
}

function planetLabel(name: string): string {
  return PLANET_LABELS[name] ?? name;
}

function aspectTypeLabel(type: string): string {
  return ASPECT_TYPE_LABELS[type] ?? type;
}

function aspectDescriptionShort(a: Aspect): string {
  const block = a.description?.description;
  if (!block || block.lang !== 'ru' || block.needs_review) return '';
  return block.short ?? '';
}

function importanceDisplay(importance: number): number {
  return Math.round(importance * 10);
}
</script>

<style scoped lang="scss">
$darkGrayBlue: #212429;
$lightGrayOrange: #e0d9d4;
$primaryWhite: #fafafa;
$gray: #bebec9;
$softOrange: #e9a87c;
$softOrangeTrans: rgba(233, 168, 124, 0.8);

.planets {
  width: 100%;
  margin-top: 2.4rem;
  padding-top: 2.4rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.planets__title {
  margin: 0 0 0.4rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.planets__subtitle {
  margin: 0 0 1.6rem;
  font-size: 1.4rem;
  color: $gray;
}

.planets__placeholder {
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

.planets__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-bottom: 1.6rem;
}

.planets__filter {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.planets__label {
  font-size: 1.1rem;
  color: $gray;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.planets__select {
  padding: 0.6rem 1rem;
  font-size: 1.3rem;
  color: $primaryWhite;
  background: rgba($darkGrayBlue, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.6rem;
  cursor: pointer;
  min-width: 14rem;
}

.planets__grid {
  display: grid;
  gap: 1.6rem;
  grid-template-columns: repeat(2, 1fr);

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.planet-card {
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
}

.planet-card__icon {
  font-size: 2rem;
  margin-bottom: 0.6rem;
}

.planet-card__title {
  margin: 0 0 0.4rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: $lightGrayOrange;
  line-height: 1.35;
}

.planet-card__position {
  margin: 0 0 1rem;
  font-size: 1.3rem;
  color: $gray;
}

.planet-card__importance {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
}

.planet-card__importance-bar {
  flex: 1;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  overflow: hidden;
}

.planet-card__importance-fill {
  height: 100%;
  background: $softOrange;
  border-radius: 0.25rem;
  transition: width 0.3s;
}

.planet-card__importance-value {
  font-size: 1.2rem;
  color: $gray;
  min-width: 3rem;
}

.planet-card__life-areas,
.planet-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.planet-card__chip {
  padding: 0.3rem 0.6rem;
  font-size: 1.1rem;
  color: $softOrange;
  background: rgba(233, 168, 124, 0.1);
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
}

.planet-card__tag {
  padding: 0.25rem 0.5rem;
  font-size: 1.1rem;
  color: $gray;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 0.4rem;
}

.planets-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.6rem;
}

.planets-modal__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.planets-modal__content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 42rem;
  max-height: 90vh;
  background: $darkGrayBlue;
  border-radius: 1.2rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.planets-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.6rem;
  border-bottom: 1px solid rgba(233, 168, 124, 0.2);
}

.planets-modal__title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: $lightGrayOrange;
}

.planets-modal__close {
  margin: 0;
  padding: 0.4rem 0.8rem;
  font-size: 2rem;
  line-height: 1;
  color: $gray;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
}

.planets-modal__close:hover {
  color: $primaryWhite;
}

.planets-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.6rem;
}

.planets-modal__block {
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.planets-modal__block-title {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: $lightGrayOrange;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.planets-modal__position {
  margin-bottom: 1.2rem;
}

.planets-modal__label {
  margin: 0 0 0.4rem;
  font-size: 1.1rem;
  color: $gray;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.planets-modal__short,
.planets-modal__full {
  margin: 0 0 0.6rem;
  font-size: 1.35rem;
  line-height: 1.55;
  color: $primaryWhite;
}

.planets-modal__placeholder {
  margin: 0 0 0.6rem;
  font-size: 1.35rem;
  color: $gray;
  font-style: italic;
}

.planets-modal__expand {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s ease-out;
}

.planets-modal__expand--open {
  max-height: 80vh;
  transition: max-height 0.4s ease-in;
}

.planets-modal__expand .planets-modal__full {
  margin-top: 0.8rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.planets-modal__btn {
  margin: 0 0 0.8rem;
  padding: 0.4rem 0.8rem;
  font-size: 1.2rem;
  color: $softOrange;
  background: transparent;
  border: 1px solid $softOrangeTrans;
  border-radius: 0.4rem;
  cursor: pointer;
  transition: opacity 0.2s, background 0.2s;
}

.planets-modal__btn:hover {
  opacity: 0.9;
  background: rgba(233, 168, 124, 0.1);
}

.planets-modal__aspect-group {
  margin-bottom: 1.2rem;
}

.planets-modal__aspect-group-label {
  margin: 0 0 0.6rem;
  font-size: 1.2rem;
  color: $gray;
}

.planets-modal__aspect-list {
  margin: 0;
  padding-left: 1.4rem;
}

.planets-modal__aspect-item {
  margin-bottom: 0.8rem;
  font-size: 1.3rem;
  line-height: 1.5;
  color: $primaryWhite;
}

.planets-modal__aspect-type {
  font-weight: 600;
  color: $softOrange;
  margin-right: 0.6rem;
}

.planets-modal__aspect-planets {
  margin-right: 0.6rem;
}

.planets-modal__aspect-orb {
  font-size: 1.1rem;
  color: $gray;
}

.planets-modal__aspect-desc {
  margin: 0.4rem 0 0;
  font-size: 1.25rem;
  color: $primaryWhite;
  padding-left: 0;
  list-style: none;
}

.planets-modal__life-list {
  margin: 0;
  padding-left: 1.4rem;
}

.planets-modal__life-item {
  margin-bottom: 0.6rem;
  font-size: 1.3rem;
  line-height: 1.5;
  color: $primaryWhite;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}
</style>
