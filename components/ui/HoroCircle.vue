<template>
  <div class="horo-circle" :class="{ 'horo-circle--compact': compact }" aria-hidden="true">
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
  withDefaults(
    defineProps<{
      compact?: boolean;
    }>(),
    {
      compact: false,
    }
  );

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
    width: 180%;
    height: 180%;
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
      top: 68.2%;
      opacity: 0.22;
    }
  }

  .horo-circle--compact {
    .circle--big {
      width: 120%;
      height: 120%;
      top: 50%;
      opacity: 0.14;

      @mixin tablet {
        width: 100%;
        height: 100%;
        top: 50%;
      }
    }

    .circle--small {
      width: 90%;
      height: 90%;
      top: 50%;
      opacity: 0.18;

      @mixin tablet {
        width: 72%;
        height: 72%;
        top: 50%;
      }
    }
  }
</style>
