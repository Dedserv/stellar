import { getElement, getModality } from './mappings.js';
import { INSIGHTS_CONFIG } from './config.js';

const ELEMENTS = ['fire', 'earth', 'air', 'water'];
const MODALITIES = ['cardinal', 'fixed', 'mutable'];

function clamp(x, min, max) {
  return Math.max(min, Math.min(max, x));
}

/**
 * @param {import('./types.js').NatalChartResult} result
 * @returns {{
 *   elementCounts: Record<"fire"|"earth"|"air"|"water", number>;
 *   modalityCounts: Record<"cardinal"|"fixed"|"mutable", number>;
 *   signCounts: Record<string, number>;
 *   houseCounts: Record<string, number>;
 * }}
 */
export function computeWeights(result) {
  const elementCounts = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));
  const modalityCounts = Object.fromEntries(MODALITIES.map((m) => [m, 0]));
  const signCounts = {};
  const houseCounts = {};
  for (let i = 1; i <= 12; i++) houseCounts[`house_${i}`] = 0;

  const add = (sign, house, weight) => {
    const el = getElement(sign);
    const mod = getModality(sign);
    if (el) elementCounts[el] = (elementCounts[el] || 0) + weight;
    if (mod) modalityCounts[mod] = (modalityCounts[mod] || 0) + weight;
    if (sign) signCounts[sign] = (signCounts[sign] || 0) + weight;
    if (house >= 1 && house <= 12) {
      const key = `house_${house}`;
      houseCounts[key] = (houseCounts[key] || 0) + weight;
    }
  };

  const planetWeight = (name) => INSIGHTS_CONFIG.planetWeights[name?.toLowerCase()] ?? 1.0;

  for (const planet of result.planets || []) {
    const w = planetWeight(planet.name);
    add(planet.sign, planet.house, w);
  }

  if (result.ascendant?.sign) {
    add(result.ascendant.sign, 1, INSIGHTS_CONFIG.ascendantWeight);
  }

  return { elementCounts, modalityCounts, signCounts, houseCounts };
}

/**
 * @param {import('./types.js').Aspect[]} aspects
 * @returns {{ planet1: string; planet2: string; type: import('./types.js').AspectType; orb: number; weight: number }[]}
 */
export function computeStrongAspects(aspects) {
  const baseWeights = INSIGHTS_CONFIG.aspectBaseWeights;
  const orbDivisor = INSIGHTS_CONFIG.aspectOrbDivisor;
  const weakThreshold = INSIGHTS_CONFIG.aspectWeakOrbThreshold;

  const out = [];
  for (const a of aspects || []) {
    if (a.orb > weakThreshold) continue;
    const base = baseWeights[a.type] ?? 1.0;
    const orbWeight = clamp(1.0 - a.orb / orbDivisor, 0, 1);
    const weight = Number((base * orbWeight).toFixed(2));
    out.push({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type,
      orb: a.orb,
      weight,
    });
  }
  out.sort((x, y) => y.weight - x.weight);
  return out;
}

/**
 * @param {import('./types.js').Aspect[]} aspects
 * @param {(a: import('./types.js').Aspect) => number} getWeight - функция, возвращающая weight для аспекта (как в computeStrongAspects)
 * @returns {number}
 */
export function computeTensionScore(aspects, getWeight) {
  let tension = 0;
  let harmony = 0;
  let conjunctionWeight = 0;
  const tensionTypes = ['square', 'opposition'];
  const harmonyTypes = ['trine', 'sextile'];
  const factor = INSIGHTS_CONFIG.tensionHarmonyConjunctionFactor;

  for (const a of aspects || []) {
    const w = getWeight(a);
    if (tensionTypes.includes(a.type)) tension += w;
    else if (harmonyTypes.includes(a.type)) harmony += w;
    else if (a.type === 'conjunction') conjunctionWeight += w;
  }

  const total = tension + harmony + conjunctionWeight * factor;
  if (total <= 0) return 0;
  return Math.round((100 * tension) / total);
}

/**
 * Количество аспектов по типам (гармоничные / напряжённые / нейтральные).
 * @param {import('./types.js').Aspect[]} aspects
 * @returns {{ harmonious: number; tense: number; neutral: number }}
 */
export function computeAspectCountsByType(aspects) {
  const tensionTypes = ['square', 'opposition'];
  const harmonyTypes = ['trine', 'sextile'];
  let harmonious = 0;
  let tense = 0;
  let neutral = 0;
  for (const a of aspects || []) {
    if (tensionTypes.includes(a.type)) tense += 1;
    else if (harmonyTypes.includes(a.type)) harmonious += 1;
    else if (a.type === 'conjunction') neutral += 1;
  }
  return { harmonious, tense, neutral };
}

/**
 * Вычисляет weight для одного аспекта (для передачи в computeTensionScore).
 * @param {import('./types.js').Aspect} a
 * @returns {number}
 */
function aspectWeight(a) {
  const baseWeights = INSIGHTS_CONFIG.aspectBaseWeights;
  const orbDivisor = INSIGHTS_CONFIG.aspectOrbDivisor;
  const base = baseWeights[a.type] ?? 1.0;
  const orbWeight = clamp(1.0 - a.orb / orbDivisor, 0, 1);
  return base * orbWeight;
}

/**
 * @param {import('./types.js').NatalChartResult} result
 * @returns {import('./types.js').HighlightsMetrics}
 */
export function computeAllMetrics(result) {
  const { elementCounts, modalityCounts, signCounts, houseCounts } = computeWeights(result);
  const strongAspects = computeStrongAspects(result.aspects || []);
  const tensionScore = computeTensionScore(result.aspects || [], aspectWeight);
  const aspect_counts = computeAspectCountsByType(result.aspects || []);
  const totalAspects =
    (aspect_counts.harmonious || 0) + (aspect_counts.tense || 0) + (aspect_counts.neutral || 0);
  const harmonious_ratio =
    totalAspects > 0
      ? Math.round(((aspect_counts.harmonious || 0) / totalAspects) * 100)
      : 0;

  return {
    elementCounts,
    modalityCounts,
    signCounts,
    houseCounts,
    strongAspects,
    tensionScore,
    aspect_counts,
    harmonious_ratio,
  };
}
