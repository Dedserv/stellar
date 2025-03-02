<template>
  <div class="modal-header">
    <VButton
      class="modal-header__button"
      size="s"
      type="transparent"
      color="gray"
      :withoutIconMargin="hasMargin"
      @click="closeModalHandler"
    >
      <UseIcon
        class="modal-header__arrow"
        :name="iconName"
        :width="iconSize.width"
        :height="iconSize.height"
      />
      {{ exitButtonName }}
    </VButton>

    <div class="modal-header__logo">
      <CircleDivider
        class="modal-header__circle-divider"
        :active-index="currentSlideIndex"
        :segments-count="questionsLength"
        :radius="circleDividerRadius"
        :gapPercentage="0.5"
        stroke-color="#E9A87C"
      />
      <svg
        class="modal-header__circle"
        :width="circleSizeWrapper"
        :height="circleSizeWrapper"
        :viewBox="`0 0 ${circleSizeWrapper} ${circleSizeWrapper}`"
      >
        <circle ref="circle" :cx="circleSize + 0.4" :cy="circleSize + 0.4" :r="circleSize" />
      </svg>
      <div ref="star" class="icon-wrapper">
        <UseIcon
          ref="star"
          class="modal-header__star"
          name="star"
          :width="starSize"
          :height="starSize"
        />
      </div>
    </div>
    <div class="modal-header__counter">{{ questionsCounter }}</div>
  </div>
</template>

<script setup>
  import { questionsStore } from '@/stores/questions';

  const { $gsap } = useNuxtApp();

  const emit = defineEmits(['closeModal']);
  const props = defineProps({
    questionsLength: {
      type: Number,
      required: true,
    },
  });

  const store = questionsStore();
  const currentSlideIndex = computed(() => store.currentSlide);
  const questionsCounter = computed(
    () => `${currentSlideIndex.value + 1} / ${props.questionsLength}`
  );

  const circle = ref(null);
  const star = ref(null);
  const iconSizes = {
    exit: { width: 3.3, height: 2.4 },
    arrow: { width: 10, height: 0.8 },
  };

  const hasMargin = computed(() => isMobile.value);
  const isMobile = useMediaQuery('(max-width: 767px)', { ssrWidth: 395 });
  const iconName = computed(() => (isMobile.value ? 'exit' : 'arrow'));
  const iconSize = computed(() => iconSizes[iconName.value]);
  const circleDividerRadius = computed(() => (isMobile.value ? 40 : 60));
  const circleSizeWrapper = computed(() => (isMobile.value ? 80 : 104));
  const circleSize = computed(() => (isMobile.value ? 39.5 : 50));
  const starSize = computed(() => (isMobile.value ? 5 : 8));
  const exitButtonName = computed(() => (isMobile.value ? 'выйти' : 'вернуться на главную'));

  const closeModalHandler = () => emit('closeModal');

  onMounted(() => {
    $gsap.to(circle.value, {
      strokeDashoffset: 0, // Полностью отрисовываем круг
      duration: 2.2,
      delay: 1.2,
      ease: 'circ.in',
      opacity: 1,
    });

    $gsap.to(star.value, {
      opacity: 1,
      scale: 1,
      duration: 1.6,
      delay: 0.2,
      ease: 'power3.in',
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';
  .modal-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: $gray;
    padding: 2.4rem 0 4.2rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -1.6rem;
      width: 100vw;
      height: 1px;
      background-color: $orangeMuted;
    }

    @mixin tablet {
      padding: 2.4rem 0 5.4rem;
    }

    @mixin desktop {
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0.6rem;
        width: calc(100% - 1.2rem);
        height: 1px;
        background-color: $orangeMuted;
      }
    }

    &__arrow {
      color: $softOrange;
    }

    &__button {
      &:hover {
        opacity: 0.8;
      }
    }

    &__logo {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $softOrange;
      width: 8rem;
      height: 8rem;
      left: 50%;
      transform: translateX(-50%);

      @mixin tablet {
        width: 10.4rem;
        height: 10.4rem;
      }
    }

    &__circle-divider {
      position: absolute;
      top: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 10rem;
      height: 10rem;

      @mixin tablet {
        width: 12rem;
        height: 12rem;
        left: calc(50% - 2px);
      }
    }

    &__counter {
      visibility: hidden;
      opacity: 0;
      user-select: none;

      @mixin tablet {
        visibility: visible;
        display: block;
        padding: 0.6rem;
        opacity: 1;
      }
    }

    &__circle {
      position: absolute;
      top: 0;
      left: 0;

      circle {
        opacity: 0.4;
        fill: none;
        stroke: $softOrange;
        stroke-width: 1;
        stroke-linecap: round;
        stroke-dasharray: 502; /* Длина окружности (примерно 2πr) */
        stroke-dashoffset: 502; /* Начально скрываем круг */
      }
    }
  }

  .icon-wrapper {
    opacity: 0;
    transform: scale(0);
  }
</style>
