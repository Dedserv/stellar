import { getQuery, createError } from 'h3';
import { extractArchetypeContent } from '~/server/utils/archetype-content';
import { loadArchetypeContent } from '~/server/utils/jsonLoader';
import { ARCHETYPE_META } from '~/server/utils/personality-mappings';

export default defineEventHandler(async (event) => {
  const { archetypeId } = getQuery(event);

  if (typeof archetypeId !== 'string' || !ARCHETYPE_META[archetypeId]) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некорректный archetypeId',
    });
  }

  const data = await loadArchetypeContent(archetypeId);
  if (!data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Архетип не найден',
    });
  }

  return {
    archetypeId: data.archetypeId,
    archetype: data.archetype,
    zodiacSign: data.zodiacSign,
    element: data.element,
    modality: data.modality,
    content: extractArchetypeContent(data),
  };
});
