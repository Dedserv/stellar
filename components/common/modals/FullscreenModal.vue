<template>
  <Teleport to="#teleports">
    <Transition name="fullscreen-modal" appear @after-leave="onAfterLeave">
      <div v-if="isOverlayVisible" class="modal" :class="{ 'modal--loading': isLoadingResult }">
        <template v-if="!isLoadingResult">
          <div class="container">
            <ModalHeader
              :count="totalSteps"
              :current-slide-index="quizStore.step"
              @close-modal="clickExitButton"
            />
            <div class="modal__wrapper">
              <PersonalityQuiz
                class="modal__questions"
                :questions="flatQuestions"
                :loading="isSubmitting"
                @next="handleNext"
              />
              <p v-if="submitError" class="modal__error">{{ submitError }}</p>
            </div>
          </div>
          <ModalMobileMenu
            :questions-length="totalSteps"
            :can-proceed="quizStore.canProceed"
            :is-submitting="isSubmitting"
            :is-last-step="quizStore.isLastStep"
            @change-slide-handler="handleMobileNav"
          />
        </template>
        <div v-else class="container">
          <ChartSkeleton :progress="loadingProgress" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { modalStore } from '@/stores/modal';
  import { usePersonalityQuizStore } from '@/stores/personalityQuiz';
  import type { QuizData } from '~/types/personality';
  import type { PersonalityTestResponse } from '~/types/personality';
  import { flattenQuizQuestions } from '~/composables/useQuizQuestions';

  const PERSONALITY_RESULT_KEY = 'stellara:personality-result';

  const { lock, unlock } = useBodyScrollLock();
  const modal = modalStore();
  const quizStore = usePersonalityQuizStore();

  const isOverlayVisible = ref(true);
  const isSubmitting = ref(false);
  const isLoadingResult = ref(false);
  const submitError = ref('');
  const loadingProgress = ref(0);
  let progressTimer: ReturnType<typeof setInterval> | null = null;
  let pendingExitCleanup = false;

  onMounted(() => {
    lock();
  });

  onBeforeUnmount(() => {
    stopProgressTimer();
  });

  const { data: quizData } = await useFetch<QuizData>('/api/questions');
  const flatQuestions = computed(() =>
    quizData.value ? flattenQuizQuestions(quizData.value) : []
  );
  const totalSteps = 13;

  function waitForPaint() {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
  }

  function dismissOverlay() {
    isOverlayVisible.value = false;
  }

  function onAfterLeave() {
    unlock();
    if (pendingExitCleanup) {
      quizStore.reset();
      pendingExitCleanup = false;
    }
    modal.closeModal();
  }

  const clickExitButton = () => {
    pendingExitCleanup = true;
    dismissOverlay();
  };

  function stopProgressTimer() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function startProgressTimer() {
    loadingProgress.value = 0;
    progressTimer = setInterval(() => {
      loadingProgress.value = Math.min(loadingProgress.value + 8, 92);
    }, 180);
  }

  async function submitQuiz() {
    if (!quizStore.formattedBirthDate) return;

    isSubmitting.value = true;
    isLoadingResult.value = true;
    submitError.value = '';
    startProgressTimer();

    try {
      const result = await $fetch<PersonalityTestResponse>('/api/personality-test', {
        method: 'POST',
        body: {
          birthDate: quizStore.formattedBirthDate,
          answers: quizStore.answers,
        },
      });

      if (import.meta.client) {
        sessionStorage.setItem(PERSONALITY_RESULT_KEY, JSON.stringify(result));
      }

      loadingProgress.value = 100;
      stopProgressTimer();
      quizStore.reset();

      // Result page mounts under the opaque overlay first
      await navigateTo({
        path: '/personality-result',
        query: { archetypeId: result.archetypeId },
        replace: true,
      });
      await nextTick();
      await waitForPaint();

      // Then fade out onto the already-ready result page
      dismissOverlay();
    } catch (error: unknown) {
      isLoadingResult.value = false;
      stopProgressTimer();
      const err = error as { data?: { statusMessage?: string }; message?: string };
      submitError.value =
        err?.data?.statusMessage ||
        err?.message ||
        'Не удалось получить результат. Попробуйте ещё раз.';
    } finally {
      isSubmitting.value = false;
    }
  }

  async function handleNext() {
    submitError.value = '';

    if (quizStore.isLastStep) {
      await submitQuiz();
      return;
    }

    quizStore.nextStep();
  }

  function handleMobileNav(next?: boolean) {
    if (next) {
      handleNext();
      return;
    }
    quizStore.prevStep();
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1.2rem;
    width: 100%;
    height: 100%;
    background-color: $blackBlue;
    z-index: 9999;
    overflow-y: auto;

    @mixin tablet {
      padding: 4rem 1.6rem;
    }

    @mixin desktop {
      padding: 4rem 10rem;
    }

    &--loading {
      display: flex;
      align-items: center;
    }

    &__wrapper {
      margin: auto;
      margin-top: 3.2rem;
      max-width: 72rem;

      @mixin tablet {
        margin-top: 4rem;
      }

      @mixin desktop {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        gap: 2.4rem;
        max-width: none;
      }
    }

    &__questions {
      width: 100%;

      @mixin desktop {
        max-width: 44.4vw;
      }
    }

    &__button {
      display: none;

      @mixin desktop {
        display: flex;
        width: 19vw;
        height: fit-content;
        gap: 0.6rem;
        flex-shrink: 0;
      }
    }

    &__arrow {
      color: $softOrange;
      transform: rotate(180deg);
    }

    &__error {
      width: 100%;
      margin: 1.2rem 0 0;
      font-size: 1.4rem;
      color: $softOrange;
      text-align: center;
    }
  }

  .fullscreen-modal-enter-active,
  .fullscreen-modal-leave-active {
    transition: opacity 0.4s ease;
  }

  .fullscreen-modal-enter-from,
  .fullscreen-modal-leave-to {
    opacity: 0;
  }
</style>
