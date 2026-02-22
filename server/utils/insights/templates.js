/**
 * RU шаблоны для highlights. Стиль: поддерживающий/практичный, без предсказаний.
 */

const ELEMENT_NAMES = {
  fire: 'Огня',
  earth: 'Земли',
  air: 'Воздуха',
  water: 'Воды',
};

const ELEMENT_NAME_NOMINATIVE = {
  fire: 'Огонь',
  earth: 'Земля',
  air: 'Воздух',
  water: 'Вода',
};

const ELEMENT_TAG_UI = { fire: 'огонь', earth: 'земля', air: 'воздух', water: 'вода' };
const MODALITY_TAG_UI = { cardinal: 'кардинальный', fixed: 'фиксированный', mutable: 'мутабельный' };

const ELEMENT_SUMMARIES = {
  fire: 'В карте выражена стихия огня: энергия, инициатива и уверенность в действиях.',
  earth: 'В карте выражена стихия земли: практичность, устойчивость и внимание к материальному.',
  air: 'В карте выражена стихия воздуха: общение, идеи и гибкость мышления.',
  water: 'В карте выражена стихия воды: чувствительность, интуиция и эмоциональная глубина.',
};

const MODALITY_TITLES = {
  cardinal: 'Инициатор',
  fixed: 'Стратег',
  mutable: 'Адаптивный',
};

const MODALITY_SUMMARIES = {
  cardinal: 'Кардинальная энергия в карте поддерживает инициативу и начало новых дел.',
  fixed: 'Фиксированная энергия в карте поддерживает устойчивость и концентрацию на целях.',
  mutable: 'Мутабельная энергия в карте поддерживает гибкость и адаптацию к изменениям.',
};

const HOUSE_SUMMARIES = {
  1: 'Личность, самовыражение, первое впечатление.',
  2: 'Ресурсы, ценности, материальная сфера.',
  3: 'Общение, обучение, ближайшее окружение.',
  4: 'Дом, семья, корни, внутренняя опора.',
  5: 'Творчество, любовь, дети, самовыражение.',
  6: 'Здоровье, рутина, служение.',
  7: 'Партнёрство, отношения, открытые противники.',
  8: 'Трансформация, общие ресурсы, глубины.',
  9: 'Мировоззрение, обучение, поиск смысла.',
  10: 'Карьера, статус, цели в обществе.',
  11: 'Друзья, сообщества, надежды.',
  12: 'Уединение, подсознание, завершение циклов.',
};

const ASPECT_TYPE_NAMES = {
  conjunction: 'соединение',
  sextile: 'секстиль',
  square: 'квадрат',
  trine: 'трин',
  opposition: 'оппозиция',
};

const PLANET_DISPLAY_NAMES_RU = {
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
  asc: 'Асцендент',
  ascendant: 'Асцендент',
};

/**
 * @param {"fire"|"earth"|"air"|"water"} element
 * @returns {string}
 */
export function getElementTitle(element) {
  return `Доминанта ${ELEMENT_NAMES[element] || element}`;
}

/**
 * @param {"fire"|"earth"|"air"|"water"} element
 * @returns {string}
 */
export function getElementSummary(element) {
  return ELEMENT_SUMMARIES[element] || `В карте выражена стихия ${element}.`;
}

/**
 * @param {"fire"|"earth"|"air"|"water"} element
 * @param {number} count
 * @param {number} total
 * @returns {string}
 */
export function getElementWhy(element, count, total) {
  const name = ELEMENT_NAME_NOMINATIVE[element] || element;
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `${name}: ${count.toFixed(1)} из ${total.toFixed(1)} (${pct}%).`;
}

/** tags_ui для элемента: ["стихия", "земля"] */
export function getElementTagsUI(element) {
  return ['стихия', ELEMENT_TAG_UI[element] || element];
}

/** tags_sys для элемента: ["element:earth"] */
export function getElementTagsSys(element) {
  return [`element:${element}`];
}

/** tags_ui для модальности */
export function getModalityTagsUI(modality) {
  return ['модальность', MODALITY_TAG_UI[modality] || modality];
}

/** tags_sys для модальности */
export function getModalityTagsSys(modality) {
  return [`modality:${modality}`];
}

/** tags_ui для дома: ["дом", "9 дом"] */
export function getHouseTagsUI(houseNumber) {
  const n = Math.max(1, Math.min(12, Math.floor(houseNumber)));
  return ['дом', `${n} дом`];
}

/** tags_sys для дома */
export function getHouseTagsSys(houseNumber) {
  const n = Math.max(1, Math.min(12, Math.floor(houseNumber)));
  return [`house:${n}`];
}

/** tags_ui/tags_sys для аспекта (планеты в RU для UI) */
export function getAspectTagsUI(planet1, planet2, aspectType) {
  const p1 = PLANET_DISPLAY_NAMES_RU[planet1] || planet1;
  const p2 = PLANET_DISPLAY_NAMES_RU[planet2] || planet2;
  const typeName = ASPECT_TYPE_NAMES[aspectType] || aspectType;
  return ['аспект', typeName, p1, p2];
}

export function getAspectTagsSys(planet1, planet2, aspectType) {
  return [`aspect:${aspectType}`, `planet:${planet1}`, `planet:${planet2}`];
}

/**
 * @param {"cardinal"|"fixed"|"mutable"} modality
 * @returns {string}
 */
export function getModalityTitle(modality) {
  return MODALITY_TITLES[modality] || modality;
}

/**
 * @param {"cardinal"|"fixed"|"mutable"} modality
 * @returns {string}
 */
export function getModalitySummary(modality) {
  return MODALITY_SUMMARIES[modality] || `В карте выражена модальность ${modality}.`;
}

/**
 * @param {number} houseNumber 1..12
 * @returns {string}
 */
export function getHouseSummary(houseNumber) {
  const n = Math.max(1, Math.min(12, Math.floor(houseNumber)));
  return HOUSE_SUMMARIES[n] || `Акцент на ${n} доме.`;
}

/**
 * @param {number} houseNumber 1..12
 * @returns {string}
 */
export function getHouseTitle(houseNumber) {
  const n = Math.max(1, Math.min(12, Math.floor(houseNumber)));
  return `Акцент на ${n} доме`;
}

/**
 * @param {number} houseNumber
 * @param {string[]} planetNames - lowercase (sun, moon, ...), может быть 'asc'
 * @param {number} totalWeight
 * @returns {string}
 */
export function getHouseWhy(houseNumber, planetNames, totalWeight) {
  const names = (planetNames || [])
    .map((p) => PLANET_DISPLAY_NAMES_RU[(p || '').toLowerCase()] || (p ? p.charAt(0).toUpperCase() + p.slice(1) : ''))
    .filter(Boolean);
  const list = names.length ? names.join(', ') : '—';
  return `В ${houseNumber} доме: ${list} (суммарный вес ${totalWeight.toFixed(1)}).`;
}

/**
 * @param {string} aspectType - conjunction | sextile | square | trine | opposition
 * @param {number} orb
 * @returns {string}
 */
export function getAspectWhy(aspectType, orb) {
  const name = ASPECT_TYPE_NAMES[aspectType] || aspectType;
  return `${name}, орб ${typeof orb === 'number' ? orb.toFixed(1) : orb}° — один из самых сильных аспектов карты.`;
}

/**
 * @param {string} aspectType
 * @returns {string}
 */
export function getAspectTypeName(aspectType) {
  return ASPECT_TYPE_NAMES[aspectType] || aspectType;
}

const TENSION_HIGH_SUMMARY = 'В карте много напряжения между планетами: рост через вызовы и внутреннюю работу.';
const TENSION_LOW_SUMMARY = 'В карте много гармоничных связей: легче находить баланс и опору.';
const TENSION_HIGH_WHY = 'Преобладают напряжённые аспекты (квадраты и оппозиции).';
const TENSION_LOW_WHY = 'Преобладают гармоничные аспекты (трины и секстили).';

/**
 * @param {boolean} isHighTension
 * @returns {{ summary: string; why: string }}
 */
export function getTensionAxisCopy(isHighTension) {
  return isHighTension
    ? { summary: TENSION_HIGH_SUMMARY, why: TENSION_HIGH_WHY }
    : { summary: TENSION_LOW_SUMMARY, why: TENSION_LOW_WHY };
}

const TAG_THEMES_TITLE = 'Ключевые темы карты';
const TAG_THEMES_SUMMARY = 'Повторяющиеся темы по знакам, домам и аспектам.';
const TAG_THEMES_WHY = 'По частоте тегов в описаниях позиций и аспектов.';

export function getTagThemesCopy() {
  return { title: TAG_THEMES_TITLE, summary: TAG_THEMES_SUMMARY, why: TAG_THEMES_WHY };
}

const FALLBACK_ASPECT_TITLE = 'Описание скоро появится';
const FALLBACK_ASPECT_SUMMARY = 'Интерпретация этого аспекта будет добавлена позже.';
const FALLBACK_ASPECT_WHY = 'Аспект в пределах орба, описание в разработке.';

export function getFallbackAspectCopy() {
  return { title: FALLBACK_ASPECT_TITLE, summary: FALLBACK_ASPECT_SUMMARY, why: FALLBACK_ASPECT_WHY };
}
