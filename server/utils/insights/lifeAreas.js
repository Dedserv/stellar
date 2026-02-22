/**
 * Рекомендация life_areas по типу highlight и связанным домам/планетам (индивидуально для каждого инсайта).
 */

const ALLOWED_AREAS = ['relationships', 'career', 'finance', 'health', 'family', 'creativity', 'spirituality'];

/** Дом → приоритетные сферы (1–3) */
const HOUSE_LIFE_AREAS = {
  1: ['career', 'relationships', 'health'],
  2: ['finance', 'career'],
  3: ['creativity', 'career'],
  4: ['family', 'health'],
  5: ['creativity', 'relationships'],
  6: ['health', 'career'],
  7: ['relationships', 'career'],
  8: ['finance', 'relationships'],
  9: ['spirituality', 'career'],
  10: ['career', 'spirituality'],
  11: ['relationships', 'creativity'],
  12: ['spirituality', 'health'],
};

/** Стихия → сферы (без spirituality для земли по умолчанию) */
const ELEMENT_LIFE_AREAS = {
  fire: ['career', 'creativity', 'relationships'],
  earth: ['finance', 'career', 'health'],
  air: ['career', 'creativity', 'relationships'],
  water: ['relationships', 'family', 'health', 'spirituality'],
};

/** Планеты в аспекте (moon–saturn и т.д.) → сферы */
const ASPECT_PLANET_LIFE_AREAS = {
  moon: ['family', 'relationships', 'health'],
  saturn: ['career', 'health', 'family'],
  venus: ['relationships', 'finance', 'creativity'],
  pluto: ['relationships', 'spirituality'],
  neptune: ['spirituality', 'creativity'],
  sun: ['career', 'creativity'],
  mars: ['career', 'health'],
  jupiter: ['career', 'spirituality'],
  mercury: ['career', 'creativity'],
  uranus: ['career', 'creativity'],
};

/**
 * Возвращает 1–3 ключа life_areas для одного highlight.
 * @param {import('./types.js').Highlight} h
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {string[]}
 */
export function getLifeAreasForHighlight(h, metrics) {
  const id = h.id || '';
  const related = h.related || {};
  const planets = new Set((related.planets || []).map((p) => (p || '').toLowerCase()));
  const points = new Set((related.points || []).map((p) => (p || '').toLowerCase()));
  const areas = [];

  if (id.startsWith('dominant_house_')) {
    const houseNum = parseInt(id.replace('dominant_house_', ''), 10);
    const houseAreas = HOUSE_LIFE_AREAS[houseNum];
    if (houseAreas) areas.push(...houseAreas);
  }

  if (id.startsWith('dominant_element_')) {
    const element = id.replace('dominant_element_', '');
    const elAreas = ELEMENT_LIFE_AREAS[element];
    if (elAreas) areas.push(...elAreas);
  }

  if (id.startsWith('dominant_modality_')) {
    return ['career', 'creativity', 'relationships'].slice(0, 3);
  }

  if (id.startsWith('aspect_') || id.startsWith('strong_fallback_aspect_')) {
    for (const p of planets) {
      const hints = ASPECT_PLANET_LIFE_AREAS[p];
      if (hints) areas.push(...hints);
    }
    if (planets.has('moon') && planets.has('saturn'))
      areas.push('family', 'relationships', 'health');
    if (planets.has('venus') || planets.has('pluto')) areas.push('relationships');
  }

  if (id === 'tension_axis_high' || id === 'tension_axis_low') {
    return ['health', 'relationships', 'career'].slice(0, 3);
  }

  if (id === 'tag_themes') {
    return ['creativity', 'relationships', 'career'].slice(0, 3);
  }

  const unique = [];
  const seen = new Set();
  for (const a of areas) {
    if (ALLOWED_AREAS.includes(a) && !seen.has(a)) {
      seen.add(a);
      unique.push(a);
    }
    if (unique.length >= 3) break;
  }
  return unique.slice(0, 3);
}

/**
 * Глобальная рекомендация (для обратной совместимости): по всем highlights и selectedTopics.
 * @param {import('./types.js').Highlight[]} highlights
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @param {string[]} [selectedTopics]
 * @returns {string[]}
 */
export function recommendLifeAreas(highlights, metrics, selectedTopics = []) {
  if (selectedTopics?.length > 0) {
    const result = [];
    for (const t of selectedTopics) {
      const key = (t || '').toLowerCase().trim();
      if (ALLOWED_AREAS.includes(key)) result.push(key);
    }
    if (result.length >= 3) return result.slice(0, 3);
  }

  const combined = new Set();
  for (const h of highlights) {
    for (const a of getLifeAreasForHighlight(h, metrics)) combined.add(a);
  }
  return [...combined].slice(0, 3);
}

/**
 * Проставляет related.lifeAreas индивидуально для каждого highlight.
 * @param {import('./types.js').Highlight[]} highlights
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @param {string[]} [selectedTopics]
 */
export function assignLifeAreasToHighlights(highlights, metrics, selectedTopics) {
  for (const h of highlights) {
    if (h.id?.startsWith('fallback_aspect_') && !h.id?.startsWith('strong_fallback_aspect_'))
      continue;
    if (!h.related) h.related = {};
    const perHighlight = getLifeAreasForHighlight(h, metrics);
    if (selectedTopics?.length > 0) {
      const fromTopics = selectedTopics
        .map((t) => (t || '').toLowerCase().trim())
        .filter((k) => ALLOWED_AREAS.includes(k));
      h.related.lifeAreas = fromTopics.length >= 3 ? fromTopics.slice(0, 3) : [...new Set([...fromTopics, ...perHighlight])].slice(0, 3);
    } else {
      h.related.lifeAreas = perHighlight.length ? perHighlight : ['relationships', 'career', 'creativity'].slice(0, 3);
    }
  }
}
