<template>
  <div ref="contentRef" class="personality-quiz">
    <template v-if="quizStore.step === 0">
      <h4 class="personality-quiz__category">Дата рождения</h4>
      <p class="personality-quiz__question">Когда вы родились?</p>
      <QuizBirthDate :birth-date="quizStore.birthDate" @update="quizStore.setBirthDate" />
    </template>

    <div
      v-else-if="currentQuestion"
      ref="questionBlockRef"
      class="personality-quiz__question-block"
      :class="{ 'personality-quiz__question-block--entering': isEntering }"
    >
      <h4 class="personality-quiz__category">
        {{ currentQuestion.categoryLabel }}
      </h4>
      <p class="personality-quiz__question">{{ currentQuestion.text }}</p>
      <div
        ref="optionsRef"
        class="personality-quiz__options"
        role="radiogroup"
        aria-label="Варианты ответа"
        @keydown="onOptionsKeydown"
      >
        <QuizOption
          v-for="(option, index) in currentQuestion.options"
          :key="`${currentQuestion.id}-${option.key}`"
          :element="OPTION_ELEMENTS[option.key]"
          :text="option.text"
          :option-key="option.key"
          :selected="selectedKey === option.key"
          :dimmed="hasSelection && selectedKey !== option.key"
          :tabindex="focusIndex === index ? 0 : -1"
          @select="onSelect(option.key, index)"
        />
      </div>
    </div>

    <QuizFooter
      :step="quizStore.step"
      :has-selection="quizStore.canProceed"
      :loading="loading"
      :next-label="quizStore.isLastStep ? 'Получить результат' : 'Продолжить'"
      @back="requestBack"
      @next="requestNext"
    />
  </div>
</template>

<script setup lang="ts">
  import type { FlatQuizQuestion } from '~/composables/useQuizQuestions';
  import { usePersonalityQuizStore } from '~/stores/personalityQuiz';
  import type { QuizAnswer } from '~/types/personality';
  import { OPTION_ELEMENTS } from '~/types/personality';

  const props = defineProps<{
    questions: FlatQuizQuestion[];
    loading?: boolean;
  }>();

  const emit = defineEmits<{ next: [] }>();

  const { $gsap } = useNuxtApp();
  const quizStore = usePersonalityQuizStore();
  const contentRef = ref<HTMLElement | null>(null);
  const questionBlockRef = ref<HTMLElement | null>(null);
  const optionsRef = ref<HTMLElement | null>(null);
  const focusIndex = ref(0);
  const isTransitioning = ref(false);
  /** CSS gate: cards mount at opacity 0 before GSAP runs (option A) */
  const isEntering = ref(false);

  const currentQuestion = computed(() => {
    if (quizStore.step === 0) return null;
    return props.questions[quizStore.step - 1] ?? null;
  });

  const selectedKey = computed(() => {
    if (!currentQuestion.value) return null;
    return quizStore.answers[currentQuestion.value.globalIndex] ?? null;
  });

  const hasSelection = computed(() => Boolean(selectedKey.value));

  function prefersReducedMotion() {
    return import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function getCards(): HTMLElement[] {
    if (!optionsRef.value) return [];
    return Array.from(optionsRef.value.querySelectorAll<HTMLElement>('.answer-card'));
  }

  function clearMotionProps(targets: HTMLElement | HTMLElement[]) {
    if (!targets || (Array.isArray(targets) && !targets.length)) return;
    $gsap.set(targets, { clearProps: 'opacity,transform,boxShadow' });
  }

  /** Hide stable question shell before step swap so remounted cards never paint at opacity 1 */
  function hideQuestionBlock() {
    if (!questionBlockRef.value) return;
    $gsap.killTweensOf(questionBlockRef.value);
    $gsap.set(questionBlockRef.value, { opacity: 0 });
  }

  function syncFocusIndexFromSelection() {
    const q = currentQuestion.value;
    if (!q) {
      focusIndex.value = 0;
      return;
    }
    const selected = quizStore.answers[q.globalIndex];
    if (!selected) {
      focusIndex.value = 0;
      return;
    }
    const idx = q.options.findIndex((o) => o.key === selected);
    focusIndex.value = idx >= 0 ? idx : 0;
  }

  /** Option A: sync gsap.set(0) before any paint / before dropping CSS --entering */
  function preHideCards() {
    const cards = getCards();
    if (!cards.length) return cards;

    const glyphs = cards
      .map((card) => card.querySelector<HTMLElement>('.answer-card__glyph'))
      .filter((el): el is HTMLElement => Boolean(el));

    $gsap.killTweensOf(cards);
    if (glyphs.length) $gsap.killTweensOf(glyphs);

    $gsap.set(cards, { opacity: 0, y: prefersReducedMotion() ? 0 : 20 });
    if (glyphs.length) {
      $gsap.set(glyphs, {
        opacity: 0,
        scale: prefersReducedMotion() ? 1 : 0,
      });
    }

    return cards;
  }

  function animateEntrance() {
    const block = questionBlockRef.value;
    const cards = getCards();
    if (!block || !cards.length) {
      isEntering.value = false;
      return;
    }

    const glyphs = cards
      .map((card) => card.querySelector<HTMLElement>('.answer-card__glyph'))
      .filter((el): el is HTMLElement => Boolean(el));

    $gsap.killTweensOf(block);

    // A: lock opacity 0 via GSAP while CSS --entering still active
    preHideCards();
    $gsap.set(block, { opacity: 1 });
    // Drop CSS !important gate only after inline opacity:0 is applied
    isEntering.value = false;

    if (prefersReducedMotion()) {
      $gsap.to(cards, {
        opacity: 1,
        duration: 0.2,
        ease: 'none',
        overwrite: true,
        onComplete: () => clearMotionProps(cards),
        onInterrupt: () => clearMotionProps(cards),
      });
      return;
    }

    $gsap.to(cards, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      stagger: 0.1,
      ease: 'power2.out',
      overwrite: true,
      onComplete: () => clearMotionProps(cards),
      onInterrupt: () => clearMotionProps(cards),
    });

    if (glyphs.length) {
      $gsap.to(glyphs, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        delay: 0.08,
        ease: 'back.out(1.7)',
        overwrite: true,
        onComplete: () => clearMotionProps(glyphs),
        onInterrupt: () => clearMotionProps(glyphs),
      });
    }
  }

  function animateExit(): Promise<void> {
    const cards = getCards();
    if (!cards.length || prefersReducedMotion()) {
      return Promise.resolve();
    }

    $gsap.killTweensOf(cards);

    return new Promise((resolve) => {
      $gsap.to(cards, {
        opacity: 0,
        y: -10,
        duration: 0.25,
        stagger: {
          each: 0.05,
          from: 'end',
        },
        ease: 'power2.in',
        overwrite: true,
        onComplete: () => resolve(),
        onInterrupt: () => resolve(),
      });
    });
  }

  function animateSelection(cardEl: HTMLElement) {
    if (prefersReducedMotion()) return;

    const baseShadow = '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 40px rgba(233, 168, 124, 0.15)';
    const pulseShadow = '0 4px 24px rgba(0, 0, 0, 0.3), 0 0 60px rgba(233, 168, 124, 0.25)';

    $gsap.killTweensOf(cardEl);

    const tl = $gsap.timeline({
      onComplete: () => {
        $gsap.set(cardEl, { clearProps: 'boxShadow' });
      },
      onInterrupt: () => {
        $gsap.set(cardEl, { clearProps: 'boxShadow' });
      },
    });
    tl.to(cardEl, {
      boxShadow: baseShadow,
      duration: 0.3,
      ease: 'power2.out',
    });
    tl.to(cardEl, {
      boxShadow: pulseShadow,
      duration: 0.6,
      repeat: 1,
      yoyo: true,
      ease: 'sine.inOut',
    });
    tl.to(cardEl, {
      boxShadow: baseShadow,
      duration: 0.3,
      ease: 'power2.out',
    });
  }

  function onSelect(key: QuizAnswer, index: number) {
    if (!currentQuestion.value || isTransitioning.value) return;

    quizStore.selectAnswer(currentQuestion.value.globalIndex, key);
    focusIndex.value = index;

    nextTick(() => {
      const cards = getCards();
      const selectedCard = cards[index];
      if (selectedCard) animateSelection(selectedCard);
    });
  }

  function focusOption(index: number) {
    const cards = getCards();
    if (!cards.length) return;
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    focusIndex.value = clamped;
    cards[clamped]?.focus();
  }

  function onOptionsKeydown(event: KeyboardEvent) {
    const q = currentQuestion.value;
    if (!q || isTransitioning.value) return;

    const max = q.options.length - 1;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusOption(focusIndex.value >= max ? 0 : focusIndex.value + 1);
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusOption(focusIndex.value <= 0 ? max : focusIndex.value - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusOption(max);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const option = q.options[focusIndex.value];
      if (option) onSelect(option.key, focusIndex.value);
    }
  }

  async function requestNext() {
    if (isTransitioning.value || !quizStore.canProceed || props.loading) return;

    if (quizStore.isLastStep) {
      emit('next');
      return;
    }

    if (quizStore.step === 0) {
      // A: CSS --entering before first question mounts
      isEntering.value = true;
      emit('next');
      return;
    }

    isTransitioning.value = true;
    try {
      await animateExit();
      isEntering.value = true;
      hideQuestionBlock();
      emit('next');
    } finally {
      isTransitioning.value = false;
    }
  }

  async function requestBack() {
    if (isTransitioning.value) return;
    if (quizStore.step === 0) return;

    isTransitioning.value = true;
    try {
      await animateExit();
      if (quizStore.step > 1) {
        isEntering.value = true;
        hideQuestionBlock();
      }
      quizStore.prevStep();
    } finally {
      isTransitioning.value = false;
    }
  }

  defineExpose({
    requestNext,
    requestBack,
  });

  // A: arm CSS gate synchronously before DOM patch whenever we land on a question
  watch(
    () => quizStore.step,
    (step) => {
      if (!import.meta.client) return;
      if (step > 0) isEntering.value = true;
    },
    { flush: 'sync' }
  );

  watch(
    () => quizStore.step,
    async () => {
      if (!import.meta.client) return;

      await nextTick();
      syncFocusIndexFromSelection();

      if (quizStore.step === 0) {
        isEntering.value = false;
        if (contentRef.value && !prefersReducedMotion()) {
          $gsap.killTweensOf(contentRef.value);
          $gsap.fromTo(
            contentRef.value,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: true,
              onComplete: () => {
                if (contentRef.value) {
                  $gsap.set(contentRef.value, { clearProps: 'opacity' });
                }
              },
              onInterrupt: () => {
                if (contentRef.value) {
                  $gsap.set(contentRef.value, { clearProps: 'opacity' });
                }
              },
            }
          );
        }
        return;
      }

      // A: set(0) in the same turn as nextTick, before paint — then entrance
      preHideCards();
      animateEntrance();
    }
  );
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .personality-quiz {
    padding-bottom: 8.8rem;

    @mixin desktop {
      padding-bottom: 0;
    }
  }

  .personality-quiz__question-block {
    width: 100%;
  }

  /* Option A: new cards never paint at full opacity before GSAP */
  .personality-quiz__question-block--entering .answer-card {
    opacity: 0 !important;
    transform: translateY(20px);
  }

  .personality-quiz__question-block--entering .answer-card__glyph {
    opacity: 0 !important;
    transform: scale(0);
  }

  .personality-quiz__category {
    margin: 0 0 1rem;
    font-size: 1.3rem;
    font-weight: 500;
    color: $softOrange;
    text-align: center;
  }

  .personality-quiz__question {
    margin: 0 0 1.6rem;
    font-size: 1.8rem;
    line-height: 1.35;
    font-weight: 400;
    color: $primaryWhite;
    text-align: center;

    @mixin desktop {
      margin: 0 0 2rem;
      font-size: 2.4rem;
      text-align: left;
    }
  }

  .personality-quiz__options {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
</style>
