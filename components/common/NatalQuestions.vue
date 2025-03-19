<template>
  <div class="questions">
    <ClientOnly>
      <swiper-container ref="container" :key="uId" :init="false" class="swiper-container">
        <swiper-slide v-for="(question, qIdx) in props.questions" :key="`slide_${qIdx + uId}`">
          <div class="questions__wrapper" :class="questionClass(question)">
            <component
              v-for="(questionComponent, compIdx) in question.options ?? 1"
              v-model="model[qIdx][question.component === 'VueSelect' ? compIdx : 0]"
              v-bind="getComponentProps(question, questionComponent)"
              :is="defineComponents[question.component]"
              :key="`${question.component}_${compIdx}`"
              @menu-opened="onOpen(question.component)"
              @search="onChange(question.component)"
            >
              <component
                v-if="question.subcomponent"
                v-bind="questionComponent"
                :is="defineComponents[question.subcomponent]"
                :key="`${question.subcomponent}_${compIdx}`"
              ></component>
            </component>
          </div>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
  </div>
</template>

<script setup>
  import { uid } from 'uid';

  import defineComponents from '~/composables/defineComponents';
  import getComponentProps from '~/assets/js/utils/getComponentProps';

  import { questionsStore } from '@/stores/questions';

  const questionStores = questionsStore();

  const props = defineProps({
    questions: {
      type: Array,
      required: true,
    },
  });

  const emit = defineEmits(['getQuestionData']);

  const uId = uid();

  const model = reactive(
    props.questions.map((question) =>
      question.component === 'VueSelect'
        ? question.options.map((option) => option.value)
        : [question.value]
    )
  );

  const onOpen = (component) => {
    if (component !== 'VueSelect') {
      return;
    }

    nextTick(() => {
      document
        ?.querySelector('[data-state="open"]')
        ?.querySelector('input')
        ?.setAttribute('readonly', true);
    });
  };

  const questionClass = (question) => {
    if (!question?.subcomponent || !question.options?.length) {
      return;
    }

    return question.options.length > 4 && question.subcomponent === 'VCard'
      ? 'questions__wrapper--small-gap'
      : '';
  };

  const container = ref(null);
  const slideIndex = ref(0);

  const swiper = computed(() => container.value?.swiper);

  const currentSlide = computed(() => {
    return {
      title: props.questions[slideIndex.value].title,
      name: props.questions[slideIndex.value].name,
      value: model[slideIndex.value],
    };
  });

  watchEffect(() => {
    const isComplete = model[slideIndex.value].filter((item) => !item).length === 0;
    questionStores.setCompleted(isComplete);
  });

  useSwiper(container, {
    effect: 'fade',
    speed: 800,
    allowTouchMove: false,
    fadeEffect: {
      crossFade: true,
    },
    slidesPerView: 1,
  });

  const nextSlide = () => {
    if (swiper.value) {
      emit('getQuestionData', currentSlide, slideIndex.value);
      swiper.value.slideNext();
      slideIndex.value += 1;
      questionStores.setSlideIndex(slideIndex.value);
    }
  };

  const prevSlide = () => {
    if (swiper.value) {
      emit('getQuestionData', {});
      swiper.value.slidePrev();
      slideIndex.value -= 1;
      questionStores.setSlideIndex(slideIndex.value);
    }
  };

  // Экспортируем методы для доступа из родителя
  defineExpose({
    nextSlide,
    prevSlide,
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .questions {
    height: 100%;

    &__wrapper {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      height: 100%;
      gap: 1.6rem;

      &--small-gap {
        gap: 0.4rem;
        overflow-y: auto;
        max-height: 55.4dvh;

        @mixin tablet {
          gap: 1.6rem;
          max-height: 100%;
        }
      }

      .separator:first-of-type {
        position: relative;

        &::after {
          content: ':';
          position: absolute;
          top: 50%;
          right: -0.8rem;
          transform: translate(50%, -50%);
          color: $softOrange;
          font-size: 3.6rem;
        }
      }
    }

    :deep(.single-value) {
      display: inline-block;
    }

    :deep(#vue-select-1-listbox) {
      @mixin custom-scroll;
    }
  }
</style>
