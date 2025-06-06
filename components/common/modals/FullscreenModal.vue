<template>
  <Teleport to="#teleports">
    <Transition>
      <div class="modal" :class="{ 'modal--show-result': isShowedResults }">
        <div class="container">
          <Transition>
            <div v-if="!isShowedResults" :key="`${isShowedResults}_modal`">
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
                  :disabled="!questionStores.isCompleted"
                  @click="changeSlideHandler"
                >
                  {{ buttonTitle }}
                  <UseIcon class="modal__arrow" name="arrow" :width="10" :height="0.8" />
                </VButton>
              </div>
            </div>
            <ModalResults
              v-else
              :key="`${isShowedResults}_result`"
              :natalResult="natalCard"
              :loadingProgress="loadingProgress"
              @close-modal="clickExitButton"
            />
          </Transition>
        </div>
        <ModalMobileMenu
          v-if="!isShowedResults"
          :questions-length="data.length"
          @changeSlideHandler="changeSlideHandler"
        ></ModalMobileMenu>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import scrollLock from '@/composables/scrollLock.js';
  import { modalStore } from '@/stores/modal';
  import { questionsStore } from '@/stores/questions';
  import NatalQuestions from '../NatalQuestions.vue';

  const modal = modalStore();
  const questionStores = questionsStore();
  const natalQuestionsRef = ref(null);

  const isShowedResults = ref(false);
  const natalCard = ref('');
  const loadingProgress = ref(0);
  const progressInterval = ref(null);

  const startProgressAnimation = () => {
    loadingProgress.value = 0;
    let currentProgress = 0;

    // Первая секция - 15 секунд до 25%
    progressInterval.value = setInterval(() => {
      if (currentProgress < 99) {
        currentProgress += 0.5;
        loadingProgress.value = currentProgress;
      } else {
        clearInterval(progressInterval.value);
      }
    }, 300);
  };

  onMounted(async () => {
    scrollLock(true);
  });

  const { data } = await useFetch('/api/questions');
  const finalResult = ref([]);

  const clickExitButton = () => {
    scrollLock(false);
    questionStores.setSlideIndex(0);
    modal.closeModal();
  };

  const getQuestionData = (data, index) => {
    finalResult.value[index] = { ...data.value, value: data.value.value.join() };
  };

  const getQuestionsResultData = () => {
    return finalResult.value
      .map((item) => {
        let formattedValue = item.value;

        if (item.name === 'Birthday') {
          const [day, month, year] = item.value.split(',');
          formattedValue = `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
        }

        if (item.name === 'Time') {
          const [hours, minutes] = item.value.split(',');
          formattedValue = `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }

        return `${item.title}: ${formattedValue}`;
      })
      .join(', ');
  };

  const getNatalCard = async () => {
    const questionsResultData = getQuestionsResultData();
    let fullResponse = '';
    startProgressAnimation();

    const sections = ['basics', 'personality', 'forecasting', 'personalization'];

    try {
      // Разбиваем секции на группы по 2
      for (let i = 0; i < sections.length; i += 2) {
        const chunk = sections.slice(i, i + 2);

        // Создаем массив промисов для текущей группы
        const promises = chunk.map((section) =>
          $fetch('/api/deepseek', {
            method: 'POST',
            body: {
              message: questionsResultData,
              section,
            },
          })
        );

        const responses = await Promise.all(promises);

        responses.forEach((res) => {
          fullResponse += res + '\n\n';
        });
      }
    } catch (error) {
      console.error('Ошибка в группе запросов:', error);
    }

    natalCard.value = fullResponse.trim();
  };

  const changeSlideHandler = async (next) => {
    if (natalQuestionsRef.value) {
      if (isLastSlide.value) {
        isShowedResults.value = true;
        await getNatalCard();
        return;
      }

      const { nextSlide, prevSlide } = natalQuestionsRef.value;
      next ? nextSlide() : prevSlide();
    }
  };

  const currentTitle = computed(() => data.value[questionStores.currentSlide].title);

  const isLastSlide = computed(() => questionStores.currentSlide === data.value.length - 1);

  const buttonTitle = computed(() =>
    data.value.length === isLastSlide.value ? 'Получить результат' : 'Продолжить'
  );

  onUnmounted(() => {
    if (progressInterval.value) {
      clearInterval(progressInterval.value);
    }
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

    &--show-result {
      padding: 1.2rem 0;
    }

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
  }
</style>
