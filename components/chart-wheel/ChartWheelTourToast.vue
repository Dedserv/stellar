<template>
  <Transition name="chart-wheel-toast">
    <p v-if="visible" class="chart-wheel-toast" role="status">
      Подробная легенда — ниже ↓
    </p>
  </Transition>
</template>

<script setup lang="ts">
  defineProps<{
    visible: boolean;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-toast {
    position: fixed;
    right: 1.6rem;
    bottom: calc(1.6rem + env(safe-area-inset-bottom, 0px));
    left: 1.6rem;
    z-index: 50;
    max-width: 32rem;
    margin: 0 auto;
    padding: 1.2rem 1.6rem;
    font-size: 1.3rem;
    color: $primaryWhite;
    text-align: center;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.8rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .chart-wheel-toast-enter-active,
  .chart-wheel-toast-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .chart-wheel-toast-enter-from,
  .chart-wheel-toast-leave-to {
    opacity: 0;
    transform: translateY(0.8rem);
  }
</style>
