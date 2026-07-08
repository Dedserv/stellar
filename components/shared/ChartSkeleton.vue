<template>
  <section class="chart-skeleton" aria-busy="true" aria-label="Загрузка результата">
    <div class="chart-skeleton__meta chart-skeleton__shimmer" />
    <div class="chart-skeleton__hero">
      <div
        v-for="n in 3"
        :key="n"
        class="chart-skeleton__card chart-skeleton__shimmer"
        :style="{ animationDelay: `${n * 0.08}s` }"
      />
    </div>
    <div class="chart-skeleton__loader">
      <NatalLoader :progress="progress" />
    </div>
    <div
      v-for="n in 2"
      :key="`block-${n}`"
      class="chart-skeleton__block chart-skeleton__shimmer"
      :style="{ animationDelay: `${0.2 + n * 0.1}s` }"
    />
  </section>
</template>

<script setup lang="ts">
  defineProps({
    progress: {
      type: Number,
      default: 0,
    },
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-skeleton {
    display: flex;
    flex-direction: column;
    gap: 2.4rem;
    padding: 2.4rem 0;
  }

  .chart-skeleton__meta {
    height: 1.6rem;
    max-width: 28rem;
    margin: 0 auto;
    border-radius: 0.4rem;
  }

  .chart-skeleton__hero {
    display: flex;
    gap: 1.2rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    padding: 0 calc((100% - 85%) / 2);
    margin: 0 -1.6rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @mixin desktop {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      overflow: visible;
      padding: 0;
      margin: 0;
    }
  }

  .chart-skeleton__card {
    flex: 0 0 85%;
    scroll-snap-align: center;
    min-height: 12rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);

    @mixin desktop {
      flex: unset;
    }
  }

  .chart-skeleton__block {
    min-height: 14rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .chart-skeleton__loader {
    padding: 0.8rem 0 0;
  }

  .chart-skeleton__shimmer {
    position: relative;
    overflow: hidden;
    background: $darkGrayBlue;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(233, 168, 124, 0.08) 45%,
        rgba(233, 168, 124, 0.14) 50%,
        rgba(233, 168, 124, 0.08) 55%,
        transparent 100%
      );
      transform: translateX(-100%);
      animation: chart-skeleton-shimmer 1.6s ease-in-out infinite;
    }
  }

  @keyframes chart-skeleton-shimmer {
    100% {
      transform: translateX(100%);
    }
  }
</style>
