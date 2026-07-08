<template>
  <div class="modal-menu">
    <VButton
      class="modal-menu__button"
      size="s"
      display="block"
      type="transparent"
      color="gray"
      withoutIconMargin
      :disabled="isFirstSlide"
      @click="onChangeSlideHandler()"
    >
      <UseIcon class="modal-menu__arrow" name="arrow" :width="8" :height="0.8" />
      <span class="modal-menu__text">Назад</span>
    </VButton>
    <div class="modal-menu__counter">{{ questionsCounter }}</div>
    <VButton
      class="modal-menu__button"
      size="s"
      display="block"
      type="transparent"
      color="gray"
      withoutIconMargin
      :disabled="!canProceed || isSubmitting"
      @click="onChangeSlideHandler(true)"
    >
      <UseIcon
        class="modal-menu__arrow modal-menu__arrow--rotate"
        name="arrow"
        :width="8"
        :height="0.8"
      />
      <span class="modal-menu__text">{{ isLastStep ? 'Результат' : 'Продолжить' }}</span>
    </VButton>
  </div>
</template>

<script setup lang="ts">
  import { usePersonalityQuizStore } from '@/stores/personalityQuiz';

  const quizStore = usePersonalityQuizStore();

  const emit = defineEmits(['changeSlideHandler']);

  const props = defineProps<{
    questionsLength: number;
    canProceed: boolean;
    isSubmitting?: boolean;
    isLastStep?: boolean;
  }>();

  const questionsCounter = computed(() => `${quizStore.step + 1} / ${props.questionsLength}`);
  const isFirstSlide = computed(() => quizStore.step === 0);

  const onChangeSlideHandler = (value?: boolean) => {
    emit('changeSlideHandler', value);
  };
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal-menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    color: $gray;
    padding: 2.4rem 1rem;
    background: linear-gradient(180deg, transparent, $blackBlue 30%);

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: $orangeMuted;
    }

    @mixin desktop {
      display: none;
    }

    &__button {
      &:first-of-type {
        text-align: left;
      }
    }

    &__arrow {
      color: $softOrange;
      margin-bottom: 0.6rem;

      &--rotate {
        transform: rotate(180deg);
      }
    }

    &__text {
      display: inline-block;
    }
  }
</style>
