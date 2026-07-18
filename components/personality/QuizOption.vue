<template>
  <div
    class="answer-card"
    :class="{
      'answer-card--selected': selected,
      'answer-card--dimmed': dimmed,
    }"
    role="radio"
    :aria-checked="selected"
    :aria-label="ariaLabel"
    :tabindex="tabindex"
    @click="$emit('select')"
  >
    <span class="answer-card__glyph">
      <ElementGlyph :element="element" />
    </span>
    <span class="answer-card__content">
      <span class="answer-card__text">{{ text }}</span>
      <span class="answer-card__element-label">{{ elementLabel }}</span>
    </span>
  </div>
</template>

<script setup lang="ts">
  import type { ElementKey, QuizAnswer } from '~/types/personality';
  import { ELEMENT_LABELS_RU } from '~/types/personality';

  const props = withDefaults(
    defineProps<{
      element: ElementKey;
      text: string;
      optionKey: QuizAnswer;
      selected?: boolean;
      dimmed?: boolean;
      tabindex?: number;
    }>(),
    {
      selected: false,
      dimmed: false,
      tabindex: 0,
    }
  );

  defineEmits<{ select: [] }>();

  const elementLabel = computed(() => ELEMENT_LABELS_RU[props.element]);

  const ariaLabel = computed(
    () => `Ответ ${props.optionKey}: ${props.text}. Стихия: ${elementLabel.value}`
  );
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .answer-card {
    display: flex;
    align-items: center;
    gap: $gap-card-inner;
    width: 100%;
    margin: 0 0 0.8rem;
    padding: $card-padding-mobile;
    border: 1px solid transparent;
    border-radius: $radius-card;
    background: $color-card-bg;
    box-shadow: $shadow-card;
    color: $quiz-text-primary;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    position: relative;
    overflow: visible;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      box-shadow $anim-glow-duration ease,
      opacity 0.3s ease;

    @mixin tablet {
      padding: $card-padding-desktop;
    }

    &:hover {
      background: $color-card-bg-hover;
      border-color: $color-card-border-hover;
    }

    &:hover .answer-card__glyph {
      transform: scale(1.08);
    }

    &:active {
      background: $color-card-bg-active;
      border-color: $color-card-border-active;
      transition:
        background 0.1s ease,
        border-color 0.1s ease;
    }

    &:active :deep(.glyph-circle) {
      opacity: 0.8;
    }

    &:focus-visible {
      outline: $focus-ring-width solid $color-focus-ring;
      outline-offset: $focus-ring-offset;
    }

    &--selected {
      background: $color-card-bg-selected;
      border-color: $color-card-border-selected;
      box-shadow: $shadow-card, $shadow-card-glow;
    }

    &--selected :deep(.glyph-circle) {
      opacity: $glyph-circle-opacity-selected;
      stroke-width: $glyph-stroke-selected;
    }

    &--selected :deep(.glyph-shape) {
      stroke-width: $glyph-stroke-selected;
    }

    &--selected .answer-card__text {
      color: $color-glyph-gold;
      font-weight: 500;
    }

    &--dimmed {
      opacity: 0.55;
    }

    &--dimmed:hover {
      opacity: 0.9;
      background: $color-card-bg-hover;
      border-color: $color-card-border-hover;
    }
  }

  .answer-card__glyph {
    width: $glyph-size-mobile;
    height: $glyph-size-mobile;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform $anim-hover-duration ease-out;

    @mixin tablet {
      width: $glyph-size;
      height: $glyph-size;
    }
  }

  .answer-card__content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .answer-card__text {
    font-size: 1.6rem;
    line-height: 1.4;
    color: $quiz-text-primary;
    letter-spacing: 0.05rem;
    font-weight: 400;
    transition: color 0.2s ease;

    @mixin tablet {
      font-size: 1.8rem;
    }
  }

  .answer-card__element-label {
    margin-top: 0.2rem;
    font-size: $element-label-font-size;
    color: $element-label-color;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  @media (prefers-reduced-motion: reduce) {
    .answer-card,
    .answer-card *,
    .answer-card :deep(.glyph-circle),
    .answer-card :deep(.glyph-shape) {
      transition: none !important;
      animation: none !important;
    }

    .answer-card:hover .answer-card__glyph {
      transform: none;
    }
  }
</style>
