export type QuizAnswer = 'A' | 'B' | 'C' | 'D';

export type ElementKey = 'fire' | 'earth' | 'air' | 'water';

export interface QuizOption {
  key: QuizAnswer;
  text: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizCategory {
  id: string;
  label: string;
  emoji: string;
  questions: QuizQuestion[];
}

export interface QuizData {
  categories: QuizCategory[];
}

export interface ArchetypeStrength {
  title: string;
  description: string;
  manifestation: string;
  howToAmplify: string;
}

export interface ArchetypeGrowth {
  title: string;
  description: string;
  actionStep: string;
  expectedOutcome: string;
}

export interface CompatibilityMatch {
  archetype: string;
  archetypeId: string;
  why: string;
}

export interface IdealRole {
  role: string;
  why: string;
}

export interface ArchetypeContent {
  portrait: string;
  cosmicAdvice: string;
  strengths: ArchetypeStrength[];
  growthAreas: ArchetypeGrowth[];
  love: string;
  loveLanguage: string;
  compatibility: CompatibilityMatch[];
  loveWarning: string;
  career: string;
  idealRoles: IdealRole[];
  workStyle: string;
  moneyMindset: string;
  selfDevelopment: string;
  morningRitual: string;
  monthlyChallenge: string;
  recommendedPractice: string;
  conflictTriggers: string;
  conflictStyle: string;
  friendshipStyle: string;
  friendshipMatches: string;
  friendshipClashes: string;
  decisionStyle: string;
}

export interface ArchetypeFile extends ArchetypeContent {
  archetypeId: string;
  archetype: string;
  zodiacSign: string;
  element: string;
  modality: string;
}

export interface ElementScores {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

export interface PersonalityTestResponse {
  archetypeId: string;
  archetype: string;
  zodiacSign: string;
  birthDate: string;
  element: { name: string; score: number };
  modality: string;
  elements: ElementScores;
  content: ArchetypeContent;
}

export const OPTION_ELEMENTS: Record<QuizAnswer, ElementKey> = {
  A: 'fire',
  B: 'earth',
  C: 'air',
  D: 'water',
};

export const ELEMENT_LABELS_RU: Record<ElementKey, string> = {
  fire: 'Огонь',
  earth: 'Земля',
  air: 'Воздух',
  water: 'Вода',
};

export const MODALITY_LABELS_RU: Record<string, string> = {
  cardinal: 'Кардинальная',
  fixed: 'Фиксированная',
  mutable: 'Мутабельная',
};
