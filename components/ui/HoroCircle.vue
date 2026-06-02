<template>
  <div class="horo-circle" aria-hidden="true">
    <img
      ref="bigCircleRef"
      loading="lazy"
      class="circle circle--big"
      src="@/assets/img/big-circle.svg"
      alt=""
    />
    <img
      ref="smallCircleRef"
      loading="lazy"
      class="circle circle--small"
      src="@/assets/img/small-circle.svg"
      alt=""
    />
  </div>
</template>

<script setup lang="ts">
  const { $gsap } = useNuxtApp();
  const bigCircleRef = ref<HTMLImageElement | null>(null);
  const smallCircleRef = ref<HTMLImageElement | null>(null);

  onMounted(() => {
    if (!import.meta.client) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (bigCircleRef.value) {
      $gsap.to(bigCircleRef.value, {
        rotation: -360,
        duration: 120,
        ease: 'none',
        repeat: -1,
      });
    }

    if (smallCircleRef.value) {
      $gsap.to(smallCircleRef.value, {
        rotation: 360,
        duration: 90,
        ease: 'none',
        repeat: -1,
      });
    }
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .horo-circle {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 0;
  }

  .circle {
    position: absolute;
    z-index: 0;
    will-change: transform;
    opacity: 0.25;
    pointer-events: none;
  }

  .circle--big {
    display: block;
    width: 150%;
    height: 150%;
    top: 43%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 0.2;

    @mixin tablet {
      width: 132vw;
      height: 132vw;
      top: 55%;
      opacity: 0.2;
    }

    @mixin desktop {
      top: 68%;
      opacity: 0.15;
    }
  }

  .circle--small {
    width: 155%;
    height: 155%;
    top: 43%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 0.3;

    @mixin tablet {
      width: 82.4vw;
      height: 82.4vw;
      top: 44.2%;
      opacity: 0.28;
    }

    @mixin desktop {
      width: 83.4vw;
      height: 83.4vw;
      top: 68.2%;
      opacity: 0.22;
    }
  }
</style>
