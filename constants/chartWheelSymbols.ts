export const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'] as const;

export const SIGN_LABELS_RU: Record<string, string> = {
  aries: 'Овен',
  taurus: 'Телец',
  gemini: 'Близнецы',
  cancer: 'Рак',
  leo: 'Лев',
  virgo: 'Дева',
  libra: 'Весы',
  scorpio: 'Скорпион',
  sagittarius: 'Стрелец',
  capricorn: 'Козерог',
  aquarius: 'Водолей',
  pisces: 'Рыбы',
};

export const PLANET_LABELS: Record<string, string> = {
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
};

export const PLANET_ICONS: Record<string, string> = {
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
};

export function signLabelRu(sign?: string): string {
  if (!sign) return '';
  return SIGN_LABELS_RU[sign.toLowerCase()] ?? sign;
}

export function signSymbolByIndex(signIndex?: number): string {
  if (signIndex == null || signIndex < 0 || signIndex > 11) return '';
  return SIGN_SYMBOLS[signIndex] ?? '';
}

export type SignElement = 'fire' | 'earth' | 'air' | 'water';

export const SIGN_KEYS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export const SIGN_ELEMENTS: SignElement[] = [
  'fire',
  'earth',
  'air',
  'water',
  'fire',
  'earth',
  'air',
  'water',
  'fire',
  'earth',
  'air',
  'water',
];

export const SIGN_ELEMENT_LABELS: Record<SignElement, string> = {
  fire: 'Огонь',
  earth: 'Земля',
  air: 'Воздух',
  water: 'Вода',
};

export const SIGN_ELEMENT_CHIP_CLASS: Record<SignElement, string> = {
  fire: 'chart-wheel-legend__chip--fire',
  earth: 'chart-wheel-legend__chip--earth',
  air: 'chart-wheel-legend__chip--air',
  water: 'chart-wheel-legend__chip--water',
};

export const PLANET_LEGEND_ORDER = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
] as const;

export const PLANET_LEGEND_DESCRIPTIONS: Record<string, string> = {
  sun: 'Ядро личности, воля и самовыражение',
  moon: 'Эмоции, привычки и внутренние потребности',
  mercury: 'Мышление, речь и обучение',
  venus: 'Любовь, вкус и ценности',
  mars: 'Энергия, действие и напор',
  jupiter: 'Рост, удача и смысл',
  saturn: 'Границы, дисциплина и ответственность',
  uranus: 'Свобода, перемены и озарения',
  neptune: 'Мечты, интуиция и тонкие грани',
  pluto: 'Трансформация и глубинные силы',
};

export const ASPECT_LEGEND_ITEMS = [
  {
    id: 'harmonious',
    label: 'Гармоничные',
    description: 'Трин, секстиль — поддержка и лёгкость',
    highlight: 'aspects-harmonious' as const,
    swatchClass: 'chart-wheel-legend__swatch--harmonious',
  },
  {
    id: 'tense',
    label: 'Напряжённые',
    description: 'Квадрат, оппозиция — вызов и рост через трение',
    highlight: 'aspects-tense' as const,
    swatchClass: 'chart-wheel-legend__swatch--tense',
  },
  {
    id: 'conjunction',
    label: 'Соединения',
    description: 'Планеты рядом — усиление темы',
    highlight: 'aspects-conjunction' as const,
    swatchClass: 'chart-wheel-legend__swatch--conjunction',
  },
] as const;
