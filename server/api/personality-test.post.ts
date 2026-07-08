import { readBody, createError } from 'h3';
import { extractArchetypeContent } from '~/server/utils/archetype-content';
import { loadArchetypeContent } from '~/server/utils/jsonLoader';
import {
  ARCHETYPE_META,
  calculateArchetype,
  calculateElementScores,
} from '~/server/utils/personality-mappings';
import { getZodiacSign } from '~/server/utils/zodiac';
import { parseAndValidateBirthDate } from '~/server/utils/validate-birth-date';
import type { QuizAnswer } from '~/types/personality';
import { ELEMENT_LABELS_RU, MODALITY_LABELS_RU } from '~/types/personality';

const VALID_ANSWERS = new Set(['A', 'B', 'C', 'D']);

function validateAnswers(answers: unknown): QuizAnswer[] {
  if (!Array.isArray(answers) || answers.length !== 12) {
    throw createError({
      statusCode: 400,
      statusMessage: 'answers должен содержать ровно 12 элементов',
    });
  }

  for (const answer of answers) {
    if (typeof answer !== 'string' || !VALID_ANSWERS.has(answer)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Каждый ответ должен быть A, B, C или D',
      });
    }
  }

  return answers as QuizAnswer[];
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const birthDate = parseAndValidateBirthDate(body?.birthDate);
  const answers = validateAnswers(body?.answers);

  const [, monthStr, dayStr] = birthDate.split('-');
  const zodiac = getZodiacSign(Number(dayStr), Number(monthStr));
  const archetypeId = calculateArchetype(birthDate, answers);
  const elements = calculateElementScores(birthDate, answers);
  const meta = ARCHETYPE_META[archetypeId];
  const archetypeData = await loadArchetypeContent(archetypeId);

  if (!archetypeData || !meta) {
    throw createError({
      statusCode: 500,
      statusMessage: `Контент архетипа ${archetypeId} не найден`,
    });
  }

  const dominantKey = (Object.entries(elements) as [keyof typeof elements, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  return {
    archetypeId,
    archetype: archetypeData.archetype,
    zodiacSign: zodiac.sign,
    birthDate,
    element: {
      name: ELEMENT_LABELS_RU[dominantKey],
      score: elements[dominantKey],
    },
    modality: MODALITY_LABELS_RU[zodiac.modality],
    elements,
    content: extractArchetypeContent(archetypeData),
  };
});
