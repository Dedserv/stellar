import type { QuizCategory, QuizData, QuizQuestion } from '~/types/personality';

export interface FlatQuizQuestion extends QuizQuestion {
  categoryLabel: string;
  categoryEmoji: string;
  globalIndex: number;
}

export function flattenQuizQuestions(data: QuizData): FlatQuizQuestion[] {
  const result: FlatQuizQuestion[] = [];
  let globalIndex = 0;

  for (const category of data.categories) {
    for (const question of category.questions) {
      result.push({
        ...question,
        categoryLabel: category.label,
        categoryEmoji: category.emoji,
        globalIndex,
      });
      globalIndex += 1;
    }
  }

  return result;
}

export function getQuizCategories(data: QuizData): QuizCategory[] {
  return data.categories;
}
