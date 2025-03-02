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
      :disabled="!store.isCompleted"
      @click="onChangeSlideHandler(true)"
    >
      <UseIcon
        class="modal-menu__arrow modal-menu__arrow--rotate"
        name="arrow"
        :width="8"
        :height="0.8"
      />
      <span class="modal-menu__text">Продолжить</span>
    </VButton>
  </div>
</template>

<script setup>
  import { questionsStore } from '@/stores/questions';

  const store = questionsStore();

  const emit = defineEmits(['changeSlideHandler']);

  const onChangeSlideHandler = (value) => {
    emit('changeSlideHandler', value);
  };

  const props = defineProps({
    questionsLength: {
      type: Number,
      required: true,
    },
  });

  const currentSlideIndex = computed(() => store.currentSlide);
  const questionsCounter = computed(
    () => `${currentSlideIndex.value + 1} / ${props.questionsLength}`
  );

  const isFirstSlide = computed(() => currentSlideIndex.value === 0);
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal-menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    color: $gray;
    padding: 2.4rem 1rem;

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
