import { defineStore } from 'pinia';

export const questionsStore = defineStore('questions', {
  state: () => ({ currentSlide: 0, isCompleted: false }),
  actions: {
    setSlideIndex(value) {
      this.currentSlide = value;
    },

    setCompleted(value) {
      this.isCompleted = value;
    },
  },
});
