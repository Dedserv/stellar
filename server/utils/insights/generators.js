import { getElement, getModality } from './mappings.js';
import { INSIGHTS_CONFIG } from './config.js';
import {
  getElementTitle,
  getElementSummary,
  getElementWhy,
  getElementTagsUI,
  getElementTagsSys,
  getModalityTitle,
  getModalitySummary,
  getModalityTagsUI,
  getModalityTagsSys,
  getHouseTitle,
  getHouseSummary,
  getHouseWhy,
  getHouseTagsUI,
  getHouseTagsSys,
  getAspectWhy,
  getAspectTagsUI,
  getAspectTagsSys,
  getTensionAxisCopy,
  getTagThemesCopy,
  getFallbackAspectCopy,
} from './templates.js';

const ELEMENTS = ['fire', 'earth', 'air', 'water'];
const MODALITIES = ['cardinal', 'fixed', 'mutable'];

/** Единая форма related: все ключи присутствуют (пустые массивы допускаются). */
function emptyRelated() {
  return { planets: [], points: [], aspects: [], lifeAreas: [] };
}

function makeRelated(overrides) {
  return { ...emptyRelated(), ...overrides };
}

/**
 * Транслитерация кириллицы в латиницу для slug (ГОСТ 7.79-2000 / ISO 9).
 * tag_id хранится без префикса; в tags_sys используется префикс: "tag:" + tag_id.
 */
const CYR_TO_LAT = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'j', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};
function slugifyTag(label) {
  const s = String(label || '').toLowerCase().trim();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (/[a-z0-9]/.test(c)) out += c;
    else if (c === ' ' || c === '_') out += '_';
    else if (CYR_TO_LAT[c] !== undefined) out += CYR_TO_LAT[c];
  }
  return out.replace(/_+/g, '_').replace(/^_|_$/g, '') || 'tag';
}

const STOP_WORDS = new Set([
  'и', 'в', 'на', 'с', 'по', 'для', 'из', 'к', 'о', 'у', 'от', 'до', 'за', 'при', 'под', 'над', 'об', 'не', 'ни', 'как', 'что', 'это', 'так', 'уже', 'ещё', 'или', 'но', 'а', 'же', 'ли', 'бы', 'то', 'все', 'всё', 'всего', 'всех', 'свой', 'свои', 'своей', 'своих', 'его', 'её', 'их', 'она', 'они', 'оно',
]);

/**
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateDominantElement(result, metrics) {
  const { elementCounts } = metrics;
  const total = ELEMENTS.reduce((s, e) => s + (elementCounts[e] || 0), 0);
  if (total <= 0) return [];

  const sorted = ELEMENTS
    .map((e) => ({ element: e, count: elementCounts[e] || 0 }))
    .sort((a, b) => b.count - a.count);
  const first = sorted[0];
  const second = sorted[1];
  const share = first.count / total;
  const lead = second ? first.count - second.count : first.count;

  const thresholdShare = INSIGHTS_CONFIG.dominantElementShareThreshold;
  const thresholdLead = INSIGHTS_CONFIG.dominantElementLeadThreshold;
  if (share < thresholdShare && lead < thresholdLead) return [];

  const planetsInElement = (result.planets || []).filter(
    (p) => getElement(p.sign) === first.element
  );
  const ascInElement =
    result.ascendant?.sign && getElement(result.ascendant.sign) === first.element;

  const evidence = [
    { kind: 'computed', metric: 'element_share', value: share },
    { kind: 'computed', metric: 'element_share_pct', value: Math.round(share * 100) },
    { kind: 'computed', metric: 'element_weight', value: first.count },
  ];
  for (const p of planetsInElement) {
    evidence.push({ kind: 'planet', planet: p.name, sign: p.sign, house: p.house });
  }
  if (ascInElement) {
    evidence.push({ kind: 'ascendant', sign: result.ascendant.sign });
  }

  return [
    {
      id: `dominant_element_${first.element}`,
      title: getElementTitle(first.element),
      summary: getElementSummary(first.element),
      why: getElementWhy(first.element, first.count, total),
      tone: 'supportive',
      tags: getElementTagsUI(first.element),
      tags_ui: getElementTagsUI(first.element),
      tags_sys: getElementTagsSys(first.element),
      status: 'ready',
      score: 0,
      evidence,
      related: makeRelated({
        planets: planetsInElement.map((p) => p.name),
        points: ascInElement ? ['ascendant'] : [],
      }),
    },
  ];
}

/**
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateDominantModality(result, metrics) {
  const { modalityCounts } = metrics;
  const total = MODALITIES.reduce((s, m) => s + (modalityCounts[m] || 0), 0);
  if (total <= 0) return [];

  const sorted = MODALITIES.map((m) => ({ modality: m, count: modalityCounts[m] || 0 })).sort(
    (a, b) => b.count - a.count
  );
  const first = sorted[0];
  const second = sorted[1];
  const share = first.count / total;
  const lead = second ? first.count - second.count : first.count;

  const thresholdShare = INSIGHTS_CONFIG.dominantElementShareThreshold;
  const thresholdLead = INSIGHTS_CONFIG.dominantElementLeadThreshold;
  if (share < thresholdShare && lead < thresholdLead) return [];

  const planetsInModality = (result.planets || []).filter(
    (p) => getModality(p.sign) === first.modality
  );
  const ascInModality =
    result.ascendant?.sign && getModality(result.ascendant.sign) === first.modality;

  const evidence = [
    { kind: 'computed', metric: 'modality_share', value: share },
    { kind: 'computed', metric: 'modality_share_pct', value: Math.round(share * 100) },
    { kind: 'computed', metric: 'modality_weight', value: first.count },
  ];
  for (const p of planetsInModality) {
    evidence.push({ kind: 'planet', planet: p.name, sign: p.sign, house: p.house });
  }
  if (ascInModality) {
    evidence.push({ kind: 'ascendant', sign: result.ascendant.sign });
  }

  return [
    {
      id: `dominant_modality_${first.modality}`,
      title: getModalityTitle(first.modality),
      summary: getModalitySummary(first.modality),
      why: `В карте преобладают ${first.modality === 'cardinal' ? 'кардинальные' : first.modality === 'fixed' ? 'фиксированные' : 'мутабельные'} знаки (${first.count.toFixed(1)} весов).`,
      tone: 'supportive',
      tags: getModalityTagsUI(first.modality),
      tags_ui: getModalityTagsUI(first.modality),
      tags_sys: getModalityTagsSys(first.modality),
      status: 'ready',
      score: 0,
      evidence,
      related: makeRelated({
        planets: planetsInModality.map((p) => p.name),
        points: ascInModality ? ['ascendant'] : [],
      }),
    },
  ];
}

/**
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateDominantHouse(result, metrics) {
  const { houseCounts } = metrics;
  const threshold = INSIGHTS_CONFIG.dominantHouseSignThreshold;
  const out = [];

  for (let i = 1; i <= 12; i++) {
    const key = `house_${i}`;
    const count = houseCounts[key] || 0;
    if (count < threshold) continue;

    const planetsInHouse = (result.planets || []).filter((p) => p.house === i);
    const ascFirst = result.ascendant && i === 1;
    const planetNames = planetsInHouse.map((p) => p.name).concat(ascFirst ? ['ascendant'] : []);
    const evidence = [
      { kind: 'computed', metric: key, value: count },
      ...planetsInHouse.map((p) => ({ kind: 'planet', planet: p.name, sign: p.sign, house: p.house })),
    ];
    if (ascFirst) evidence.push({ kind: 'ascendant', sign: result.ascendant?.sign });

    out.push({
      id: `dominant_house_${i}`,
      title: getHouseTitle(i),
      summary: getHouseSummary(i),
      why: getHouseWhy(i, planetNames, count),
      tone: 'practical',
      tags: getHouseTagsUI(i),
      tags_ui: getHouseTagsUI(i),
      tags_sys: getHouseTagsSys(i),
      status: 'ready',
      score: 0,
      evidence,
      related: makeRelated({
        planets: planetsInHouse.map((p) => p.name),
        points: ascFirst ? ['ascendant'] : [],
      }),
    });
  }
  return out;
}

/**
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateStrongAspects(result, metrics) {
  const strongAspects = metrics.strongAspects || [];
  const topN = Math.min(3, strongAspects.length);
  const out = [];
  const aspectByKey = (p1, p2, type) =>
    (result.aspects || []).find(
      (a) =>
        (a.planet1 === p1 && a.planet2 === p2 && a.type === type) ||
        (a.planet1 === p2 && a.planet2 === p1 && a.type === type)
    );

  for (let i = 0; i < topN; i++) {
    const sa = strongAspects[i];
    const aspect = aspectByKey(sa.planet1, sa.planet2, sa.type);
    if (!aspect) continue;

    const desc = aspect.description;
    const isFallback = desc?.type === 'fallback';
    if (isFallback) continue;

    const short =
      desc?.description?.short && (desc.description.lang === 'ru' || !desc.description.lang)
        ? desc.description.short
        : `Сильный аспект ${sa.planet1}–${sa.planet2}: ${getAspectWhy(sa.type, sa.orb)}`;

    const aspectLabel =
      sa.type === 'conjunction'
        ? 'Сильное соединение'
        : sa.type === 'opposition'
          ? 'Сильная оппозиция'
          : sa.type === 'trine'
            ? 'Сильный трин'
            : sa.type === 'square'
              ? 'Сильный квадрат'
              : 'Сильный секстиль';
    out.push({
      id: `aspect_${sa.planet1}_${sa.planet2}_${sa.type}`,
      title: `${aspectLabel} ${sa.planet1}–${sa.planet2}`,
      summary: short,
      why: getAspectWhy(sa.type, sa.orb),
      tone: sa.type === 'square' || sa.type === 'opposition' ? 'neutral' : 'supportive',
      tags: getAspectTagsUI(sa.planet1, sa.planet2, sa.type),
      tags_ui: getAspectTagsUI(sa.planet1, sa.planet2, sa.type),
      tags_sys: getAspectTagsSys(sa.planet1, sa.planet2, sa.type),
      status: 'ready',
      score: 0,
      evidence: [
        {
          kind: 'aspect',
          planet1: sa.planet1,
          planet2: sa.planet2,
          type: sa.type,
          orb: sa.orb,
        },
      ],
      related: makeRelated({
        aspects: [{ planet1: sa.planet1, planet2: sa.planet2, type: sa.type }],
        planets: [sa.planet1, sa.planet2],
      }),
    });
  }
  return out;
}

const PLANET_DISPLAY_RU = {
  sun: 'Sun', moon: 'Moon', mercury: 'Mercury', venus: 'Venus', mars: 'Mars',
  jupiter: 'Jupiter', saturn: 'Saturn', uranus: 'Uranus', neptune: 'Neptune', pluto: 'Pluto',
};

function formatPlanetPair(p1, p2) {
  const a = PLANET_DISPLAY_RU[p1] || (p1 ? p1.charAt(0).toUpperCase() + p1.slice(1) : '');
  const b = PLANET_DISPLAY_RU[p2] || (p2 ? p2.charAt(0).toUpperCase() + p2.slice(1) : '');
  return `${a}–${b}`;
}

/**
 * Fallback aspect highlights: топ-3 по весу → strong_fallback (score 65, могут в top), остальные → fallback (25, только all).
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateFallbackAspects(result, metrics) {
  const strongAspects = metrics.strongAspects || [];
  const copy = getFallbackAspectCopy();
  const out = [];
  let strongFallbackCount = 0;
  const maxStrongFallback = 3;

  for (const sa of strongAspects) {
    const aspect = (result.aspects || []).find(
      (a) =>
        ((a.planet1 === sa.planet1 && a.planet2 === sa.planet2) ||
          (a.planet1 === sa.planet2 && a.planet2 === sa.planet1)) &&
        a.type === sa.type
    );
    if (!aspect?.description || aspect.description.type !== 'fallback') continue;

    if (strongFallbackCount < maxStrongFallback) {
      strongFallbackCount += 1;
      out.push({
        id: `strong_fallback_aspect_${sa.planet1}_${sa.planet2}_${sa.type}`,
        title: `Сильный аспект ${formatPlanetPair(sa.planet1, sa.planet2)} (описание готовится)`,
        summary: copy.summary,
        why: copy.why,
        tone: 'neutral',
        tags: ['аспект', 'в разработке'],
        tags_ui: ['аспект', 'в разработке'],
        tags_sys: ['aspect:fallback', `planet:${sa.planet1}`, `planet:${sa.planet2}`],
        status: 'draft',
        score: 65,
        evidence: [
          { kind: 'aspect', planet1: sa.planet1, planet2: sa.planet2, type: sa.type, orb: sa.orb },
        ],
        related: makeRelated({
          aspects: [{ planet1: sa.planet1, planet2: sa.planet2, type: sa.type }],
          planets: [sa.planet1, sa.planet2],
        }),
      });
    } else {
      out.push({
        id: `fallback_aspect_${sa.planet1}_${sa.planet2}_${sa.type}`,
        title: copy.title,
        summary: copy.summary,
        why: copy.why,
        tone: 'neutral',
        tags: ['аспект', 'в разработке'],
        tags_ui: ['аспект', 'в разработке'],
        tags_sys: ['aspect:fallback', `planet:${sa.planet1}`, `planet:${sa.planet2}`],
        status: 'missing_copy',
        score: 25,
        evidence: [
          { kind: 'aspect', planet1: sa.planet1, planet2: sa.planet2, type: sa.type, orb: sa.orb },
        ],
        related: makeRelated({
          aspects: [{ planet1: sa.planet1, planet2: sa.planet2, type: sa.type }],
          planets: [sa.planet1, sa.planet2],
        }),
      });
    }
  }
  return out;
}

/**
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateTensionAxis(metrics) {
  const score = metrics.tensionScore ?? 50;
  const high = INSIGHTS_CONFIG.tensionHighThreshold;
  const low = INSIGHTS_CONFIG.tensionLowThreshold;
  if (score < high && score > low) return [];

  const isHigh = score >= high;
  const copy = getTensionAxisCopy(isHigh);
  const counts = metrics.aspect_counts || { harmonious: 0, tense: 0, neutral: 0 };
  const totalAspects = counts.harmonious + counts.tense + counts.neutral;
  const harmonious_ratio = totalAspects > 0 ? Math.round((counts.harmonious / totalAspects) * 100) : 0;

  const evidence = [
    { kind: 'computed', metric: 'tensionScore', value: score },
    { kind: 'computed', metric: 'aspect_counts', value: counts },
    { kind: 'computed', metric: 'harmonious_ratio', value: harmonious_ratio },
  ];

  return [
    {
      id: isHigh ? 'tension_axis_high' : 'tension_axis_low',
      title: isHigh ? 'Ось напряжения' : 'Гармоничные связи',
      summary: copy.summary,
      why: copy.why,
      tone: isHigh ? 'neutral' : 'supportive',
      tags: ['аспекты', isHigh ? 'напряжение' : 'гармония'],
      tags_ui: ['аспекты', isHigh ? 'напряжение' : 'гармония'],
      tags_sys: [isHigh ? 'tension:high' : 'tension:low'],
      status: 'ready',
      score: 0,
      evidence,
      related: emptyRelated(),
    },
  ];
}

/**
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateTagThemes(result, metrics) {
  const tagCounts = {};

  const addTags = (tags, source) => {
    if (!Array.isArray(tags)) return;
    for (const t of tags) {
      const normalized = String(t).toLowerCase().trim();
      if (!normalized || STOP_WORDS.has(normalized)) continue;
      if (!tagCounts[normalized]) tagCounts[normalized] = { count: 0, sources: [] };
      tagCounts[normalized].count += 1;
      if (source && !tagCounts[normalized].sources.includes(source)) {
        tagCounts[normalized].sources.push(source);
      }
    }
  };

  for (const p of result.planets || []) {
    const signDesc = p.description?.sign?.description;
    const houseDesc = p.description?.house?.description;
    if (signDesc?.tags) addTags(signDesc.tags, { kind: 'planet', planet: p.name, block: 'sign' });
    if (houseDesc?.tags) addTags(houseDesc.tags, { kind: 'planet', planet: p.name, block: 'house' });
  }

  for (const a of result.aspects || []) {
    if (a.description?.type === 'fallback') continue;
    const desc = a.description?.description;
    if (desc?.tags)
      addTags(desc.tags, {
        kind: 'aspect',
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type,
      });
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  if (topTags.length === 0) return [];

  const totalTagCount = Object.values(tagCounts).reduce((s, d) => s + d.count, 0);
  const topTagsWithWeight = topTags.map(([tag, data]) => ({
    tag_id: slugifyTag(tag),
    label: tag,
    count: data.count,
    weight: totalTagCount > 0 ? Math.round((data.count / totalTagCount) * 100) / 100 : 0,
  }));

  const refs = [];
  const seen = new Set();
  const refKey = (r) => {
    if (r.kind === 'planet') return `planet:${r.planet}:${r.blockKey || ''}`;
    if (r.kind === 'aspect') return `aspect:${r.planet1}:${r.planet2}:${r.type}`;
    return null;
  };
  for (const [, data] of topTags) {
    for (const src of data.sources || []) {
      const r =
        src.kind === 'planet'
          ? { kind: 'planet', planet: src.planet, blockKey: src.block }
          : src.kind === 'aspect'
            ? { kind: 'aspect', planet1: src.planet1, planet2: src.planet2, type: src.type }
            : null;
      if (r) {
        const k = refKey(r);
        if (k && !seen.has(k)) {
          seen.add(k);
          refs.push(r);
        }
      }
    }
  }

  const copy = getTagThemesCopy();
  const tags_ui = topTags.map(([t]) => t);
  const evidence = [{ kind: 'computed', metric: 'top_tags', value: topTagsWithWeight }];

  return [
    {
      id: 'tag_themes',
      title: copy.title,
      summary: copy.summary,
      why: copy.why,
      tone: 'practical',
      tags: tags_ui,
      tags_ui,
      tags_sys: topTagsWithWeight.map((x) => `tag:${x.tag_id}`),
      status: 'ready',
      score: 0,
      evidence,
      related: emptyRelated(),
      _topTagFreq: topTags[0]?.[1]?.count ?? 0,
      _topTagsSources: refs,
    },
  ];
}

/**
 * Собирает всех кандидатов (без fallback-аспектов).
 * @param {import('./types.js').NatalChartResult} result
 * @param {import('./types.js').HighlightsMetrics} metrics
 * @returns {import('./types.js').Highlight[]}
 */
export function generateAllCandidates(result, metrics) {
  const candidates = [
    ...generateDominantElement(result, metrics),
    ...generateDominantModality(result, metrics),
    ...generateDominantHouse(result, metrics),
    ...generateStrongAspects(result, metrics),
    ...generateTensionAxis(metrics),
    ...generateTagThemes(result, metrics),
  ];
  return candidates;
}
