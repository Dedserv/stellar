<template>
  <section class="chart-atmospheric-hero">
    <HoroCircle />
    <div class="chart-atmospheric-hero__gradient" aria-hidden="true" />
    <div class="chart-atmospheric-hero__content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-atmospheric-hero {
    position: relative;
    overflow: hidden;
    margin: 0 -1.6rem 2.4rem;
    padding: 7rem 1.6rem 2.4rem;
    min-height: 28rem;

    @mixin tablet {
      margin: 0 0 2.4rem;
      padding: 2rem 0 2.8rem;
      min-height: 32rem;
    }

    @mixin desktop {
      min-height: 36rem;
      padding: 6.8rem 0 3.2rem;
    }
  }

  .chart-atmospheric-hero__gradient {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(
      60deg,
      rgba(13, 8, 4, 0.85) 0%,
      rgba(13, 8, 4, 0.2) 35%,
      rgba(233, 168, 124, 0.04) 58%,
      rgba(233, 168, 124, 0.12) 100%
    );
    opacity: 0.55;
  }

  .chart-atmospheric-hero__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 2.4rem;

    :deep(.chart-header) {
      margin-bottom: 0;
    }
  }
</style>
