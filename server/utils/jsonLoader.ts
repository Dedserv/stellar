import fs from 'node:fs/promises';
import path from 'node:path';
import type { ArchetypeFile } from '~/types/personality';

const PERSONALITY_TEST_DIR = path.join(process.cwd(), 'data/generated/personality-test');

async function loadFromFilesystem(archetypeId: string): Promise<ArchetypeFile | null> {
  try {
    const filePath = path.join(PERSONALITY_TEST_DIR, `${archetypeId}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as ArchetypeFile;
  } catch {
    return null;
  }
}

/**
 * Загружает контент архетипа из data/generated/personality-test.
 * В production — через Nitro serverAssets, в dev — fallback на filesystem.
 */
export async function loadArchetypeContent(archetypeId: string): Promise<ArchetypeFile | null> {
  try {
    const storage = useStorage('assets:personality-test');
    const data = await storage.getItem<ArchetypeFile>(`${archetypeId}.json`);
    if (data) return data;
  } catch {
    // serverAssets may be unavailable in some tooling contexts
  }

  return loadFromFilesystem(archetypeId);
}
