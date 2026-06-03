<template>
  <button
    type="button"
    class="chart-wheel-help"
    :class="{ 'chart-wheel-help--disabled': disabled }"
    :disabled="disabled"
    aria-label="Показать подсказку по колесу"
    title="Что это?"
    @click="$emit('click')"
  >
    ?
  </button>
</template>

<script setup lang="ts">
  defineProps<{
    disabled?: boolean;
  }>();

  defineEmits<{
    click: [];
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-help {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.2rem;
    height: 3.2rem;
    padding: 0;
    font-size: 1.8rem;
    font-weight: 600;
    line-height: 1;
    color: $softOrange;
    cursor: pointer;
    background: rgba(33, 36, 41, 0.85);
    border: 1px solid $softOrangeTrans;
    border-radius: 50%;
    transition: opacity 0.15s ease;
    opacity: 0.8;

    @mixin desktop {
      width: 3.6rem;
      height: 3.6rem;
      font-size: 2rem;
    }

    &:focus-visible {
      outline: 2px solid $softOrange;
      outline-offset: 2px;
    }

    &:hover:not(:disabled) {
      background: rgba(233, 168, 124, 0.12);
    }
  }

  .chart-wheel-help--disabled,
  .chart-wheel-help:disabled {
    opacity: 0.4;
    pointer-events: none;
    cursor: default;
  }
</style>
