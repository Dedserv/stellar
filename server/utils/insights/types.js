/**
 * @typedef {Object} TextBlock
 * @property {string|number} [id]
 * @property {string} [key]
 * @property {string} [type]
 * @property {string} short
 * @property {string} full
 * @property {string[]} [tags]
 * @property {string} [audience]
 * @property {"ru"|"en"} [lang]
 * @property {string|number} [version]
 * @property {boolean} [needs_review]
 * @property {string[]} [strengths]
 * @property {string[]} [challenges]
 * @property {string[]} [actionable]
 */

/**
 * @typedef {Object} PlanetDescriptionBlock
 * @property {"sign"|"house"|"sign_fallback"|"house_fallback"} type
 * @property {TextBlock} description
 */

/**
 * @typedef {Object} PlanetDescription
 * @property {PlanetDescriptionBlock|null} [sign]
 * @property {PlanetDescriptionBlock|null} [house]
 */

/**
 * @typedef {Object} Planet
 * @property {string} name
 * @property {number} longitude
 * @property {string} sign
 * @property {number} signIndex
 * @property {number} house
 * @property {PlanetDescription} [description]
 */

/**
 * @typedef {Object} AspectDescriptionFallback
 * @property {string} short
 * @property {string} full
 * @property {true} needs_review
 */

/**
 * @typedef {Object} AspectDescriptionAspect
 * @property {"aspect"|"aspect_fallback"} type
 * @property {TextBlock} description
 */

/**
 * @typedef {Object} AspectDescriptionSignCombo
 * @property {"sign_combo"|"sign_combo_fallback"} type
 * @property {TextBlock} description
 */

/**
 * @typedef {Object} AspectDescriptionFallbackType
 * @property {"fallback"} type
 * @property {AspectDescriptionFallback} description
 */

/**
 * @typedef {AspectDescriptionAspect|AspectDescriptionSignCombo|AspectDescriptionFallbackType} AspectDescription
 */

/**
 * @typedef {"conjunction"|"sextile"|"square"|"trine"|"opposition"} AspectType
 */

/**
 * @typedef {Object} Aspect
 * @property {string} planet1
 * @property {string} planet2
 * @property {AspectType} type
 * @property {number} orb
 * @property {boolean} exact
 * @property {string} sign1
 * @property {string} sign2
 * @property {AspectDescription} [description]
 */

/**
 * @typedef {Object} NatalChartResult
 * @property {{ date: object; location: object; julianDay: number }} chart
 * @property {{ longitude: number; sign: string; signIndex: number; description: object }} ascendant
 * @property {Planet[]} planets
 * @property {{ number: number; cusp: number; sign: string; signIndex: number }[]} houses
 * @property {Aspect[]} aspects
 * @property {Record<string, TextBlock[]>} [life_areas]
 */

/**
 * @typedef {Object} EvidenceRefPlanet
 * @property {"planet"} kind
 * @property {string} planet
 * @property {string} [sign]
 * @property {number} [house]
 * @property {string} [blockKey]
 */

/**
 * @typedef {Object} EvidenceRefAspect
 * @property {"aspect"} kind
 * @property {string} planet1
 * @property {string} planet2
 * @property {AspectType} type
 * @property {number} orb
 * @property {string} [blockKey]
 */

/**
 * @typedef {Object} EvidenceRefComputed
 * @property {"computed"} kind
 * @property {string} metric
 * @property {*} value
 */

/**
 * Элемент evidence.computed.top_tags.value (для tag_themes).
 * tag_id — slug без префикса (транслит ГОСТ/ISO); в tags_sys используется "tag:" + tag_id.
 * @typedef {{ tag_id: string; label: string; count: number; weight: number }} TopTagItem
 */

/**
 * @typedef {Object} EvidenceRefAscendant
 * @property {"ascendant"} kind
 * @property {string} [sign]
 */

/**
 * @typedef {EvidenceRefPlanet|EvidenceRefAspect|EvidenceRefComputed|EvidenceRefAscendant} EvidenceRef
 */

/**
 * @typedef {"supportive"|"neutral"|"practical"} HighlightTone
 */

/**
 * @typedef {"ready"|"missing_copy"|"missing_lang"|"draft"} HighlightStatus
 */

/**
 * @typedef {Object} Highlight
 * @property {string} id
 * @property {string} title
 * @property {string} summary
 * @property {string} why
 * @property {HighlightTone} tone
 * @property {string[]} tags - алиас tags_ui (контракт: tags === tags_ui всегда)
 * @property {string[]} [tags_ui] - RU подписи для чипов (источник истины для отображения)
 * @property {string[]} [tags_sys] - стабильные ключи с namespace-префиксом (element:earth, house:9, tag:emocii). Правило: tag_id в top_tags.value — без префикса; в tags_sys — с префиксом: "tag:" + tag_id
 * @property {HighlightStatus} [status] - ready | missing_copy | draft для UI-бейджей/фильтров
 * @property {number} score
 * @property {EvidenceRef[]} evidence
 * @property {{ planets: string[]; points: string[]; aspects: { planet1: string; planet2: string; type: AspectType }[]; lifeAreas: string[] }} related - всегда одни и те же ключи (пустые массивы допускаются)
 */

/**
 * @typedef {Object} StrongAspectMetric
 * @property {string} planet1
 * @property {string} planet2
 * @property {AspectType} type
 * @property {number} orb
 * @property {number} weight
 */

/**
 * @typedef {Object} AspectCountsByType
 * @property {number} harmonious
 * @property {number} tense
 * @property {number} neutral
 */

/**
 * @typedef {Object} HighlightsMetrics
 * @property {Record<"fire"|"earth"|"air"|"water", number>} elementCounts
 * @property {Record<"cardinal"|"fixed"|"mutable", number>} modalityCounts
 * @property {Record<string, number>} signCounts
 * @property {Record<string, number>} houseCounts
 * @property {StrongAspectMetric[]} strongAspects
 * @property {number} tensionScore
 * @property {AspectCountsByType} [aspect_counts]
 * @property {number} [harmonious_ratio] - 0..100, доля гармоничных аспектов
 * @property {EvidenceRef[]} [top_tags_sources] - единственный источник истины для источников тегов
 */

/**
 * @typedef {Object} HighlightsPayload
 * @property {"1.0"} version
 * @property {"ru"} lang
 * @property {Highlight[]} top
 * @property {Highlight[]} all
 * @property {HighlightsMetrics} metrics
 * @property {{ warnings: string[] }} [debug]
 */
