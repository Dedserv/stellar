import { INSIGHTS_CONFIG } from './config.js';
import { computeAllMetrics } from './metrics.js';
import { generateAllCandidates, generateFallbackAspects } from './generators.js';
import { scoreHighlight, pickTop } from './rank.js';
import { assignLifeAreasToHighlights } from './lifeAreas.js';

/**
 * Собирает предупреждения о контенте (например, только en).
 * @param {import('./types.js').NatalChartResult} result
 * @returns {string[]}
 */
function collectWarnings(result) {
  const warnings = [];
  const checkBlock = (block, context) => {
    if (!block?.description?.lang) return;
    if (block.description.lang === 'en') {
      warnings.push(`missing ru content: ${context}`);
    }
  };

  for (const p of result.planets || []) {
    if (p.description?.sign) checkBlock(p.description.sign, `planet ${p.name} sign`);
    if (p.description?.house) checkBlock(p.description.house, `planet ${p.name} house`);
  }
  for (const a of result.aspects || []) {
    if (a.description?.type !== 'fallback' && a.description?.description) {
      checkBlock(a.description, `aspect ${a.planet1}-${a.planet2}`);
    }
  }
  return warnings;
}

/**
 * Удаляет внутренние поля из highlight перед отдачей.
 * @param {import('./types.js').Highlight} h
 */
function sanitizeHighlight(h) {
  const { _topTagFreq, _topTagsSources, ...rest } = h;
  if (!rest.related) rest.related = {};
  return rest;
}

/**
 * @param {import('./types.js').NatalChartResult} result - ответ расчёта карты (astro.get)
 * @returns {import('./types.js').HighlightsPayload}
 */
export function buildHighlights(result) {
  if (!result) {
    return {
      version: '1.0',
      lang: 'ru',
      top: [],
      all: [],
      metrics: {
        elementCounts: { fire: 0, earth: 0, air: 0, water: 0 },
        modalityCounts: { cardinal: 0, fixed: 0, mutable: 0 },
        signCounts: {},
        houseCounts: Object.fromEntries([...Array(12)].map((_, i) => [`house_${i + 1}`, 0])),
        strongAspects: [],
        tensionScore: 0,
      },
      debug: { warnings: ['No chart result'] },
    };
  }

  const metrics = computeAllMetrics(result);
  const candidates = [
    ...generateAllCandidates(result, metrics),
    ...generateFallbackAspects(result, metrics),
  ];

  assignLifeAreasToHighlights(candidates, metrics);

  for (const c of candidates) {
    c.score = scoreHighlight(c, metrics, INSIGHTS_CONFIG);
  }

  const { top, all } = pickTop(candidates, INSIGHTS_CONFIG.topCount);

  const allSanitized = all.map(sanitizeHighlight);
  const allById = new Map(allSanitized.map((h) => [h.id, h]));
  const topSanitized = top
    .map(sanitizeHighlight)
    .filter((h) => allById.has(h.id));

  const topIds = topSanitized.map((h) => h.id);
  const allIds = allSanitized.map((h) => h.id);
  const uniqueAllIds = [...new Set(allIds)];
  const validationWarnings = [];
  if (uniqueAllIds.length !== allIds.length) validationWarnings.push('highlights: duplicate ids in all');
  if (!topIds.every((id) => allById.has(id))) validationWarnings.push('highlights: top is not subset of all');

  const tagThemesHighlight = all.find((h) => h.id === 'tag_themes');
  const topTagsSources = tagThemesHighlight?._topTagsSources || [];

  const warnings = collectWarnings(result);
  const payload = {
    version: '1.0',
    lang: 'ru',
    top: topSanitized,
    all: allSanitized,
    metrics: {
      elementCounts: metrics.elementCounts,
      modalityCounts: metrics.modalityCounts,
      signCounts: metrics.signCounts,
      houseCounts: metrics.houseCounts,
      strongAspects: metrics.strongAspects,
      tensionScore: metrics.tensionScore,
      aspect_counts: metrics.aspect_counts,
      harmonious_ratio: metrics.harmonious_ratio,
      top_tags_sources: topTagsSources,
    },
  };
  if (warnings.length > 0 || validationWarnings.length > 0) {
    payload.debug = { warnings: [...validationWarnings, ...warnings] };
  }

  return payload;
}

export { INSIGHTS_CONFIG } from './config.js';
export { recommendLifeAreas, assignLifeAreasToHighlights } from './lifeAreas.js';
export { computeAllMetrics } from './metrics.js';
