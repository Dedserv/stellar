export type Lang = 'ru' | 'en' | string;

export type DescriptionBlock = {
  id?: number | string;
  key?: string;
  type?: string;
  short: string;
  full?: string;
  tags?: string[];
  audience?: string;
  lang?: Lang;
  version?: string | number;
  needs_review?: boolean;
  strengths?: string[];
  challenges?: string[];
  actionable?: string[];
};

export type LifeAreaItem = DescriptionBlock;

export type LifeAreas = {
  relationships?: LifeAreaItem[];
  career?: LifeAreaItem[];
  finance?: LifeAreaItem[];
  [key: string]: LifeAreaItem[] | undefined;
};

export type SelectedLifeAreaPayload = {
  key: string;
  title: string;
};

export type NestedDescription = {
  type: string;
  description: DescriptionBlock;
};

export type Ascendant = {
  longitude: number;
  sign: string;
  signIndex: number;
  description: {
    sign: NestedDescription;
    house: NestedDescription;
  };
};

export type Planet = {
  name: string;
  longitude: number;
  sign: string;
  signIndex: number;
  positionInSign: number;
  speed: number;
  house: number;
  description: {
    sign: NestedDescription;
    house: NestedDescription;
  };
};

export type PlanetViewModel = {
  name: string;
  label: string;
  sign: string;
  signLabel: string;
  house: number;
  houseLabel: string;
  importance: number;
  aspectsCount: number;
  strongAspectsCount: number;
  tags: string[];
  lifeAreas: string[];
  lifeAreaKeys: string[];
  _raw?: Planet;
};

export type Aspect = {
  planet1: string;
  planet2: string;
  angle: number;
  rawAngle: number;
  type: 'trine' | 'sextile' | 'square' | 'opposition' | 'conjunction' | string;
  orb: number;
  exact: boolean;
  sign1: string;
  sign2: string;
  description: NestedDescription;
};

export type AspectCategory = 'harmonious' | 'tense' | 'conjunction' | 'other';

export type AspectViewModel = {
  id: string;
  planet1: string;
  planet2: string;
  label1: string;
  label2: string;
  type: string;
  typeLabel: string;
  category: AspectCategory;
  orb: number;
  exact: boolean;
  weight: number;
  isStrong: boolean;
  short?: string;
  full?: string;
  angle: number;
};

export type ChartDate = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timezone: number;
};

export type ChartLocation = {
  latitude: number;
  longitude: number;
};

export type ChartResponse = {
  chart: {
    date: ChartDate;
    location: ChartLocation;
    julianDay: number;
  };
  ascendant: Ascendant;
  planets: Planet[];
  houses: Array<{ number: number; cusp: number; sign: string; signIndex: number }>;
  aspects: Aspect[];
  life_areas?: LifeAreas;
};

export type StrongAspect = {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  weight: number;
};

export type HighlightRelated = {
  planets?: string[];
  aspects?: string[];
  lifeAreas?: string[];
};

export type Highlight = {
  id: string;
  title: string;
  summary: string;
  score: number;
  related?: HighlightRelated;
};

export type HighlightsMetrics = {
  elementCounts?: Record<'fire' | 'earth' | 'air' | 'water', number>;
  aspect_counts?: { harmonious: number; tense: number; neutral?: number };
  harmonious_ratio?: number;
  strongAspects?: StrongAspect[];
  houseCounts?: Record<string, number>;
  modalityCounts?: Record<string, number>;
  signCounts?: Record<string, number>;
  tensionScore?: number;
};

export type AstroApiResponse = ChartResponse & {
  highlights?: {
    top?: Highlight[];
    all?: Highlight[];
    metrics?: HighlightsMetrics;
  };
};

/** Sign → element (for client-side dominant element calculation) */
export const SIGN_ELEMENT: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
};

/** Element key → Russian label */
export const ELEMENT_LABELS_RU: Record<'fire' | 'earth' | 'air' | 'water', string> = {
  fire: 'Огонь',
  earth: 'Земля',
  air: 'Воздух',
  water: 'Вода',
};

export type InsightCategory = 'core' | 'aspect' | 'planet' | 'life_area';

export type InsightEvidence = {
  type: 'aspect' | 'planet' | 'life_area';
  label: string;
  ref: string;
};

export type Insight = {
  id: string;
  title: string;
  summary: string;
  full?: string;
  score: number;
  category: InsightCategory;
  badge?: string;
  evidence: InsightEvidence[];
};

export type StrengthSourceType = 'planet' | 'life_area' | 'aspect';

export type StrengthEvidence = {
  type: StrengthSourceType;
  label: string;
  ref: string;
};

export type StrengthItem = {
  id: string;
  title: string;
  summary: string;
  score: number;
  sources: StrengthEvidence[];
};

/** Whether to show full text and "Подробнее" button (content is valid RU, not fallback) */
export function canShowFullDescription(nested: NestedDescription | null | undefined): boolean {
  if (!nested?.description) return false;
  return (
    nested.type !== 'fallback' &&
    !nested.description.needs_review &&
    nested.description.lang === 'ru'
  );
}
