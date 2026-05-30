<template>
  <Teleport to="#teleports">
    <Transition>
      <div class="modal">
        <div class="container">
          <ModalHeader
            :count="data.length"
            :currentSlideIndex="questionStores?.currentSlide || 0"
            @close-modal="clickExitButton"
          />
          <div class="modal__wrapper">
            <h3 class="modal__title">{{ currentTitle }}</h3>
            <NatalQuestions
              ref="natalQuestionsRef"
              class="modal__questions"
              :questions="data"
              @getQuestionData="getQuestionData"
            />
            <VButton
              class="modal__button"
              size="s"
              type="transparent"
              color="gray"
              withoutIconMargin
              hover
              :disabled="!questionStores.isCompleted || isSubmitting"
              @click="changeSlideHandler"
            >
              {{ buttonTitle }}
              <UseIcon class="modal__arrow" name="arrow" :width="10" :height="0.8" />
            </VButton>
            <p v-if="submitError" class="modal__error">{{ submitError }}</p>
          </div>
        </div>
        <ModalMobileMenu :questions-length="data.length" @changeSlideHandler="changeSlideHandler" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { modalStore } from '@/stores/modal';
  import { questionsStore } from '@/stores/questions';
  import NatalQuestions from '../NatalQuestions.vue';

  const { lock, unlock } = useBodyScrollLock();
  const { buildFromAnswers } = useChartQuery();

  const modal = modalStore();
  const questionStores = questionsStore();
  const natalQuestionsRef = ref(null);

  const isSubmitting = ref(false);
  const submitError = ref('');

  onMounted(() => {
    lock();
  });

  const { data } = await useFetch('/api/questions');
  const finalResult = ref([]);

  const clickExitButton = () => {
    unlock();
    questionStores.setSlideIndex(0);
    modal.closeModal();
  };

  const getQuestionData = (data, index) => {
    finalResult.value[index] = { ...data.value, value: data.value.value.join() };
  };

  const changeSlideHandler = async (next) => {
    if (!natalQuestionsRef.value) return;

    submitError.value = '';

    if (isLastSlide.value) {
      isSubmitting.value = true;
      try {
        const answers = natalQuestionsRef.value.collectAllAnswers();
        const query = await buildFromAnswers(answers);

        unlock();
        questionStores.setSlideIndex(0);
        modal.closeModal();

        await navigateTo({ path: '/natalchart', query });
      } catch (error) {
        submitError.value =
          error?.data?.message ||
          error?.message ||
          'Не удалось определить город. Попробуйте ещё раз.';
      } finally {
        isSubmitting.value = false;
      }
      return;
    }

    const { nextSlide, prevSlide } = natalQuestionsRef.value;
    next ? nextSlide() : prevSlide();
  };

  const currentTitle = computed(() => data.value[questionStores.currentSlide].title);

  const isLastSlide = computed(() => questionStores.currentSlide === data.value.length - 1);

  const buttonTitle = computed(() => {
    if (isSubmitting.value) return 'Загрузка…';
    return isLastSlide.value ? 'Получить результат' : 'Продолжить';
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 1.2rem 1.2rem;
    width: 100%;
    height: 100%;
    background-color: $blackBlue;
    z-index: 9999;
    overflow: hidden;

    @mixin tablet {
      padding: 4rem 1.6rem;
    }

    @mixin desktop {
      padding: 4rem 10rem;
    }

    &__wrapper {
      margin: auto;
      margin-top: 3.2rem;

      @mixin tablet {
        margin-top: 8rem;
      }

      @mixin desktop {
        display: flex;
        justify-content: space-between;
      }
    }

    &__questions {
      @mixin desktop {
        max-width: 44.4vw;
      }
    }

    &__title {
      font-size: 2rem;
      line-height: 1.4;
      text-align: center;
      font-weight: normal;
      margin: 0;
      margin-bottom: 2.4rem;
      color: $gray;

      @mixin desktop {
        font-size: 3rem;
        margin: 0;
        width: 20.8vw;
        text-align: left;
      }
    }

    &__button {
      display: none;

      @mixin desktop {
        display: flex;
        width: 19vw;
        height: fit-content;
        gap: 0.6rem;
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

      @mixin desktop {
        text-align: left;
      }
    }
  }
</style>
