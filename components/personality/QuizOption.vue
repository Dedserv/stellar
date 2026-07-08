<template>
  <button
    type="button"
    class="quiz-option"
    :class="{ 'quiz-option--selected': selected }"
    @click="$emit('select')"
  >
    <span class="quiz-option__icon">{{ icon }}</span>
    <span class="quiz-option__text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    icon: string;
    text: string;
    selected?: boolean;
  }>();

  defineEmits<{ select: [] }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .quiz-option {
    display: flex;
    align-items: flex-start;
    gap: 1.2rem;
    width: 100%;
    margin: 0 0 1rem;
    padding: 1.4rem 1.6rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1rem;
    background: rgba(255, 255, 255, 0.025);
    color: $primaryWhite;
    font-family: inherit;
    font-size: 1.4rem;
    line-height: 1.45;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    &--selected {
      border-color: rgba(233, 168, 124, 0.35);
      background: rgba(233, 168, 124, 0.06);
    }
  }

  .quiz-option__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 3.2rem;
    height: 3.2rem;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.04);
    font-size: 1.6rem;
  }

  .quiz-option__text {
    flex: 1;
  }
</style>
