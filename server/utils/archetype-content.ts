import type { ArchetypeContent, ArchetypeFile } from '~/types/personality';

export function extractArchetypeContent(data: ArchetypeFile): ArchetypeContent {
  const { archetypeId, archetype, zodiacSign, element, modality, ...content } = data;
  return content;
}
