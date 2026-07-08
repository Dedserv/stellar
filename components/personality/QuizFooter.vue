<template>
  <div class="quiz-footer">
    <VButton
      class="quiz-footer__back"
      size="s"
      type="transparent"
      color="gray"
      :disabled="step === 0"
      @click="$emit('back')"
    >
      <UseIcon class="quiz-footer__arrow" name="arrow" :width="10" :height="0.8" />
      Назад
    </VButton>
    <span class="quiz-footer__counter">{{ counterLabel }}</span>
    <VButton
      class="quiz-footer__next"
      size="s"
      type="transparent"
      color="gray"
      hover
      :disabled="!hasSelection || loading"
      @click="$emit('next')"
    >
      {{ nextLabel }}
      <UseIcon
        class="quiz-footer__arrow quiz-footer__arrow--right"
        name="arrow"
        :width="10"
        :height="0.8"
      />
    </VButton>
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      step: number;
      totalSteps?: number;
      hasSelection: boolean;
      loading?: boolean;
      nextLabel?: string;
    }>(),
    {
      totalSteps: 13,
      loading: false,
      nextLabel: 'Продолжить',
    }
  );

  defineEmits<{ back: []; next: [] }>();

  const counterLabel = computed(() => {
    if (props.step === 0) return '1/13';
    return `${props.step + 1}/13`;
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .quiz-footer {
    display: none;

    @mixin desktop {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 2.4rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
  }

  .quiz-footer__back,
  .quiz-footer__next {
    border: none;
    background: transparent;
    color: $gray;
    font-family: inherit;
    font-size: 1.3rem;
    cursor: pointer;

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }
  }

  .quiz-footer__arrow {
    color: $softOrange;

    &--right {
      transform: rotate(180deg);
    }
  }

  .quiz-footer__next--active {
    color: $softOrange;
  }

  .quiz-footer__counter {
    font-size: 1.2rem;
    color: $grayDark;

    @mixin tablet {
      font-size: 1.4rem;
    }
  }
</style>
