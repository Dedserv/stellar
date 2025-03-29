<template>
  <div>
    <img loading="lazy" class="circle circle--big" src="@/assets/img/big-circle.svg" alt="" />
    <img loading="lazy" class="circle circle--small" src="@/assets/img/small-circle.svg" alt="" />
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();

  onMounted(() => {
    const { width } = useWindowSize();

    if (width.value > 768) {
      $gsap.to('.circle--big', {
        rotation: -180, // Вращение на 360 градусов
        duration: 10, // Длительность анимации в секундах
        ease: 'expo.out', // Линейная анимация для равномерного вращения
      });
    }

    $gsap.to('.circle--small', {
      rotation: 180, // Вращение на 360 градусов
      duration: 10, // Длительность анимации в секундах
      ease: 'expo.out', // Линейная анимация для равномерного вращения
    });
  });
</script>

<style scoped>
  &__circle {
    position: absolute;
    z-index: 0;
    will-change: transform;

    &--big {
      display: none;

      @mixin tablet {
        display: block;
        width: 132vw;
        height: 132vw;
        top: 51%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(0deg);
      }

      @mixin desktop {
        top: 68%;
      }
    }

    &--small {
      width: 150vw;
      height: 150vw;
      top: 59%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(0deg);

      @mixin tablet {
        width: 82.4vw;
        height: 82.4vw;
        top: 51.2%;
      }

      @mixin desktop {
        width: 83.4vw;
        height: 83.4vw;
        top: 68.2%;
      }
    }
  }
</style>
