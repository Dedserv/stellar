import { ARCHETYPE_META } from '~/constants/archetypeMeta';
import type { ElementKey } from '~/types/personality';
import { getZodiacBySign, getZodiacSign } from './zodiac';

export { ARCHETYPE_META };

export const SIGN_TO_ARCHETYPE: Record<string, string> = {
  Овен: 'aries-1',
  Телец: 'taurus-1',
  Близнецы: 'gemini-1',
  Рак: 'cancer-1',
  Лев: 'leo-1',
  Дева: 'virgo-1',
  Весы: 'libra-1',
  Скорпион: 'scorpio-1',
  Стрелец: 'sagittarius-1',
  Козерог: 'capricorn-1',
  Водолей: 'aquarius-1',
  Рыбы: 'pisces-1',
};

const ARCHETYPES_BY_ELEMENT: Record<ElementKey, string[]> = {
  fire: ['aries-1', 'leo-1', 'sagittarius-1'],
  earth: ['taurus-1', 'virgo-1', 'capricorn-1'],
  air: ['gemini-1', 'libra-1', 'aquarius-1'],
  water: ['cancer-1', 'scorpio-1', 'pisces-1'],
};

const SIGN_ORDER = [
  'Овен',
  'Телец',
  'Близнецы',
  'Рак',
  'Лев',
  'Дева',
  'Весы',
  'Скорпион',
  'Стрелец',
  'Козерог',
  'Водолей',
  'Рыбы',
];

export interface ElementScores {
  fire: number;
  earth: number;
  air: number;
  water: number;
}

function getDominantElement(scores: ElementScores, preferred: ElementKey): ElementKey {
  const entries = (Object.entries(scores) as [ElementKey, number][]).sort((a, b) => b[1] - a[1]);
  const topScore = entries[0][1];
  const topElements = entries.filter(([, score]) => score === topScore).map(([key]) => key);
  if (topElements.includes(preferred)) return preferred;
  return topElements[0];
}

function zodiacDistance(signA: string, signB: string) {
  const indexA = SIGN_ORDER.indexOf(signA);
  const indexB = SIGN_ORDER.indexOf(signB);
  if (indexA === -1 || indexB === -1) return Number.MAX_SAFE_INTEGER;
  const direct = Math.abs(indexA - indexB);
  return Math.min(direct, SIGN_ORDER.length - direct);
}

function findClosestArchetype(userSign: string, dominantElement: ElementKey): string {
  const candidates = ARCHETYPES_BY_ELEMENT[dominantElement];
  let closestId = candidates[0];
  let closestDistance = Number.MAX_SAFE_INTEGER;

  for (const archetypeId of candidates) {
    const meta = ARCHETYPE_META[archetypeId];
    const distance = zodiacDistance(userSign, meta.zodiacSign);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestId = archetypeId;
    }
  }

  return closestId;
}

export function calculateArchetype(birthDate: string, answers: string[]): string {
  const [, monthStr, dayStr] = birthDate.split('-');
  const day = Number(dayStr);
  const month = Number(monthStr);
  const zodiac = getZodiacSign(day, month);

  const scores: ElementScores = { fire: 0, earth: 0, air: 0, water: 0 };

  for (const answer of answers) {
    switch (answer) {
      case 'A':
        scores.fire += 1;
        break;
      case 'B':
        scores.earth += 1;
        break;
      case 'C':
        scores.air += 1;
        break;
      case 'D':
        scores.water += 1;
        break;
    }
  }

  scores[zodiac.element] += 2;

  const dominant = getDominantElement(scores, zodiac.element);

  if (dominant === zodiac.element) {
    return SIGN_TO_ARCHETYPE[zodiac.sign];
  }

  return findClosestArchetype(zodiac.sign, dominant);
}

export function calculateElementScores(birthDate: string, answers: string[]): ElementScores {
  const [, monthStr, dayStr] = birthDate.split('-');
  const day = Number(dayStr);
  const month = Number(monthStr);
  const zodiac = getZodiacSign(day, month);

  const scores: ElementScores = { fire: 0, earth: 0, air: 0, water: 0 };

  for (const answer of answers) {
    switch (answer) {
      case 'A':
        scores.fire += 1;
        break;
      case 'B':
        scores.earth += 1;
        break;
      case 'C':
        scores.air += 1;
        break;
      case 'D':
        scores.water += 1;
        break;
    }
  }

  scores[zodiac.element] += 2;
  return scores;
}

export function getModalityLabel(sign: string): string {
  return getZodiacBySign(sign)?.modality
    ? {
        cardinal: 'Кардинальная',
        fixed: 'Фиксированная',
        mutable: 'Мутабельная',
      }[getZodiacBySign(sign)!.modality]
    : 'Кардинальная';
}
