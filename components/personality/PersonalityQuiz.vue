<template>
  <div ref="contentRef" class="personality-quiz">
    <template v-if="quizStore.step === 0">
      <h4 class="personality-quiz__category">🌙 Дата рождения</h4>
      <p class="personality-quiz__question">Когда вы родились?</p>
      <QuizBirthDate :birth-date="quizStore.birthDate" @update="quizStore.setBirthDate" />
    </template>

    <template v-else-if="currentQuestion">
      <h4 class="personality-quiz__category">
        {{ currentQuestion.categoryEmoji }} {{ currentQuestion.categoryLabel }}
      </h4>
      <p class="personality-quiz__question">{{ currentQuestion.text }}</p>
      <div class="personality-quiz__options">
        <QuizOption
          v-for="option in currentQuestion.options"
          :key="option.key"
          :icon="OPTION_ICONS[option.key]"
          :text="option.text"
          :selected="quizStore.answers[currentQuestion.globalIndex] === option.key"
          @select="quizStore.selectAnswer(currentQuestion.globalIndex, option.key)"
        />
      </div>
    </template>

    <QuizFooter
      :step="quizStore.step"
      :has-selection="quizStore.canProceed"
      :loading="loading"
      :next-label="quizStore.isLastStep ? 'Получить результат' : 'Продолжить'"
      @back="quizStore.prevStep()"
      @next="$emit('next')"
    />
  </div>
</template>

<script setup lang="ts">
  import type { FlatQuizQuestion } from '~/composables/useQuizQuestions';
  import { usePersonalityQuizStore } from '~/stores/personalityQuiz';
  import { OPTION_ICONS } from '~/types/personality';

  const props = defineProps<{
    questions: FlatQuizQuestion[];
    loading?: boolean;
  }>();

  defineEmits<{ next: [] }>();

  const { $gsap } = useNuxtApp();
  const quizStore = usePersonalityQuizStore();
  const contentRef = ref<HTMLElement | null>(null);

  const currentQuestion = computed(() => {
    if (quizStore.step === 0) return null;
    return props.questions[quizStore.step - 1] ?? null;
  });

  watch(
    () => quizStore.step,
    () => {
      if (!import.meta.client || !contentRef.value) return;
      $gsap.fromTo(
        contentRef.value,
        { opacity: 0 },
        { opacity: 1, duration: 0.75, ease: 'easeOut' }
      );
    }
  );
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .personality-quiz__category {
    margin: 0 0 1.2rem;
    font-size: 1.3rem;
    font-weight: 500;
    color: $softOrange;
    text-align: center;
  }

  .personality-quiz__question {
    margin: 0 0 2rem;
    font-size: 2rem;
    line-height: 1.35;
    font-weight: 400;
    color: $primaryWhite;
    text-align: center;

    @mixin desktop {
      font-size: 2.4rem;
      text-align: left;
    }
  }

  .personality-quiz__options {
    display: flex;
    flex-direction: column;
    min-height: 28rem;
  }
</style>
