/**
 * Конфигурация модуля insights. Пороги и веса для A/B тестирования в UI.
 * @type {{
 *   planetWeights: Record<string, number>;
 *   ascendantWeight: number;
 *   dominantElementShareThreshold: number;
 *   dominantElementLeadThreshold: number;
 *   dominantHouseSignThreshold: number;
 *   aspectBaseWeights: Record<string, number>;
 *   aspectOrbDivisor: number;
 *   aspectWeakOrbThreshold: number;
 *   tensionHarmonyConjunctionFactor: number;
 *   topCount: number;
 *   tensionHighThreshold: number;
 *   tensionLowThreshold: number;
 * }}
 */
export const INSIGHTS_CONFIG = {
  planetWeights: {
    sun: 2.0,
    moon: 2.0,
    mercury: 1.0,
    venus: 1.0,
    mars: 1.0,
    jupiter: 1.0,
    saturn: 1.0,
    uranus: 1.0,
    neptune: 1.0,
    pluto: 1.0,
  },
  ascendantWeight: 1.5,

  dominantElementShareThreshold: 0.38,
  dominantElementLeadThreshold: 1.5,
  dominantHouseSignThreshold: 3.0,

  aspectBaseWeights: {
    conjunction: 1.0,
    trine: 0.9,
    sextile: 0.7,
    square: 1.0,
    opposition: 1.0,
  },
  aspectOrbDivisor: 8,
  aspectWeakOrbThreshold: 6,

  tensionHarmonyConjunctionFactor: 0.5,
  tensionHighThreshold: 60,
  tensionLowThreshold: 35,

  topCount: 5,
};
