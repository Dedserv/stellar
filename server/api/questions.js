import fs from 'fs/promises';
import path from 'path';

const questionsPath = path.resolve('./data/questions.json');

export default defineEventHandler(async () => {
  const content = await fs.readFile(questionsPath, 'utf-8');
  return JSON.parse(content);
});
