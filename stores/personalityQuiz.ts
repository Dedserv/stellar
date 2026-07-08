import { defineStore } from 'pinia';
import type { QuizAnswer } from '~/types/personality';

export interface BirthDateFields {
  day: number | null;
  month: number | null;
  year: number | null;
}

export const usePersonalityQuizStore = defineStore('personalityQuiz', {
  state: () => ({
    step: 0,
    birthDate: {
      day: null,
      month: null,
      year: null,
    } as BirthDateFields,
    answers: Array.from({ length: 12 }, () => null) as (QuizAnswer | null)[],
  }),

  getters: {
    totalSteps: () => 13,
    isBirthDateComplete(state): boolean {
      return Boolean(state.birthDate.day && state.birthDate.month && state.birthDate.year);
    },
    currentQuestionIndex(state): number | null {
      if (state.step === 0) return null;
      return state.step - 1;
    },
    canProceed(state): boolean {
      if (state.step === 0) {
        return Boolean(state.birthDate.day && state.birthDate.month && state.birthDate.year);
      }
      const index = state.step - 1;
      return Boolean(state.answers[index]);
    },
    isLastStep(state): boolean {
      return state.step === 12;
    },
    formattedBirthDate(state): string | null {
      const { day, month, year } = state.birthDate;
      if (!day || !month || !year) return null;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    },
  },

  actions: {
    setBirthDate(field: keyof BirthDateFields, value: number | null) {
      this.birthDate[field] = value;
    },
    selectAnswer(questionIndex: number, optionKey: QuizAnswer) {
      this.answers[questionIndex] = optionKey;
    },
    nextStep() {
      if (this.step < 12) this.step += 1;
    },
    prevStep() {
      if (this.step > 0) this.step -= 1;
    },
    reset() {
      this.step = 0;
      this.birthDate = { day: null, month: null, year: null };
      this.answers = Array.from({ length: 12 }, () => null);
    },
  },
});
