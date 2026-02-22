import { INSIGHTS_CONFIG } from './config.js';

const ELEMENTS = ['fire', 'earth', 'air', 'water'];
const MODALITIES = ['cardinal', 'fixed', 'mutable'];

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * @param {import('./types.js').Highlight} candidate
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @param {typeof INSIGHTS_CONFIG} config
 * @returns {number}
 */
export function scoreHighlight(candidate, metrics, config = INSIGHTS_CONFIG) {
  const id = candidate.id || '';
  const fixedScore = candidate.score;
  if (fixedScore > 0 && id.startsWith('fallback_aspect_')) return fixedScore;

  if (id.startsWith('dominant_element_')) {
    const counts = metrics.elementCounts || {};
    const sorted = ELEMENTS.map((e) => counts[e] || 0).sort((a, b) => b - a);
    const first = sorted[0] || 0;
    const second = sorted[1] || 0;
    const lead = first - second;
    return clamp(70 + clamp(lead * 10, 0, 25), 0, 95);
  }

  if (id.startsWith('dominant_modality_')) {
    const counts = metrics.modalityCounts || {};
    const sorted = MODALITIES.map((m) => counts[m] || 0).sort((a, b) => b - a);
    const first = sorted[0] || 0;
    const second = sorted[1] || 0;
    const lead = first - second;
    return clamp(70 + clamp(lead * 10, 0, 25), 0, 95);
  }

  if (id.startsWith('dominant_house_')) {
    const houseNum = parseInt(id.replace('dominant_house_', ''), 10);
    const key = `house_${houseNum}`;
    const houseWeight = (metrics.houseCounts || {})[key] || 0;
    const threshold = config.dominantHouseSignThreshold;
    return clamp(65 + (houseWeight - threshold) * 15, 0, 95);
  }

  if (id.startsWith('strong_fallback_aspect_')) {
    return candidate.score ?? 65;
  }

  if (id.startsWith('aspect_') && !id.startsWith('aspect_fallback')) {
    const parts = id.replace('aspect_', '').split('_');
    const type = parts.pop();
    const planet2 = parts.pop();
    const planet1 = parts.join('_') || parts[0];
    const sa = (metrics.strongAspects || []).find(
      (a) =>
        a.planet1 === planet1 &&
        a.planet2 === planet2 &&
        a.type === type
    );
    if (!sa) return 50;
    const orbBonus = sa.orb <= 2 ? 10 : 0;
    return clamp(50 + sa.weight * 40 + orbBonus, 0, 95);
  }

  if (id.startsWith('tension_axis_')) {
    const tensionScore = metrics.tensionScore ?? 50;
    return clamp(55 + Math.abs(tensionScore - 50) * 0.6, 0, 95);
  }

  if (id === 'tag_themes') {
    const freq = candidate._topTagFreq ?? 0;
    return clamp(45 + freq * 8, 0, 95);
  }

  return 50;
}

/** Big Three + точки + планеты для tie-break */
const IMPORTANCE_ORDER = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

function importanceRank(h) {
  const related = h.related || {};
  const planets = new Set((related.planets || []).map((p) => p?.toLowerCase?.() || p));
  const points = related.points || [];
  if (points.includes('ascendant')) return -2;
  for (let i = 0; i < IMPORTANCE_ORDER.length; i++) {
    if (planets.has(IMPORTANCE_ORDER[i])) return -i - 10;
  }
  const aspects = related.aspects || [];
  const hasStrongAspect = aspects.length > 0;
  return hasStrongAspect ? -IMPORTANCE_ORDER.length - 10 : 0;
}

/** Есть ли у highlight хотя бы один non-fallback evidence (planet, ascendant или aspect с контентом) */
function hasNonFallbackEvidence(h) {
  const evidence = h.evidence || [];
  return evidence.some(
    (e) =>
      e.kind === 'planet' ||
      e.kind === 'ascendant' ||
      (e.kind === 'aspect' && !h.id?.startsWith('fallback_'))
  );
}

/**
 * @param {import('./types.js').Highlight[]} candidates
 * @returns {import('./types.js').Highlight[]}
 */
export function sortCandidates(candidates) {
  return [...candidates].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aEvidence = hasNonFallbackEvidence(a) ? 1 : 0;
    const bEvidence = hasNonFallbackEvidence(b) ? 1 : 0;
    if (bEvidence !== aEvidence) return bEvidence - aEvidence;
    return importanceRank(a) - importanceRank(b);
  });
}

/**
 * @param {import('./types.js').Highlight[]} candidates
 * @param {number} topCount
 * @returns {{ top: import('./types.js').Highlight[]; all: import('./types.js').Highlight[] }}
 */
export function pickTop(candidates, topCount = INSIGHTS_CONFIG.topCount) {
  const sorted = sortCandidates(candidates);
  const eligibleForTop = sorted.filter(
    (h) => h.id?.startsWith('strong_fallback_aspect_') || !h.id?.startsWith('fallback_aspect_')
  );
  const top = eligibleForTop.slice(0, topCount);
  return { top, all: sorted };
}
