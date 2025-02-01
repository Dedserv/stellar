<template>
  <div class="hero" ref="wrapper">
    <div class="hero__wrapper container layout-upper">
      <div class="hero__title">
        <UseIcon class="hero__star" name="star" :width="3.8" :height="3.8" />
        <img loading="lazy" src="@/assets/img/logo.svg" />
      </div>
      <p class="hero__description">
        Ваш мистический путеводитель по Вселенной. Получайте персонализированные ежедневные
        гороскопы, отчеты о совместимости и мистические озарения
      </p>
    </div>
    <img
      loading="lazy"
      class="hero__circle hero__circle--big"
      src="@/assets/img/big-circle.svg"
      alt=""
    />
    <img
      loading="lazy"
      class="hero__circle hero__circle--small"
      src="@/assets/img/small-circle.svg"
      alt=""
    />
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();
  const wrapper = ref(null);

  defineExpose({
    wrapper,
  });

  onMounted(() => {
    const { width } = useWindowSize();

    if (width.value > 768) {
      $gsap.to('.hero__circle--big', {
        rotation: -180, // Вращение на 360 градусов
        duration: 10, // Длительность анимации в секундах
        ease: 'expo.out', // Линейная анимация для равномерного вращения
      });
    }

    $gsap.to('.hero__circle--small', {
      rotation: 180, // Вращение на 360 градусов
      duration: 10, // Длительность анимации в секундах
      ease: 'expo.out', // Линейная анимация для равномерного вращения
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .hero {
    position: relative;
    padding: 13rem 2rem 2.5rem;

    @mixin tablet {
      padding: 0rem 2.4rem;
    }

    &__wrapper {
      margin: auto;

      @mixin tablet {
        max-width: 40vw;
      }

      @mixin desktop {
        max-width: 32vw;
      }
    }

    &__title {
      position: relative;
      z-index: 2;
      color: $softOrange;
      max-width: 60vw;
      margin: 0 auto;
    }

    &__star {
      position: absolute;
      top: -1rem;
      right: 40%;
      transform: translate(50%, -100%);
    }

    &__description {
      font-size: 1.4rem;
      font-weight: 400;
      line-height: 1.5;
      color: $lightGrayOrange;
      text-align: center;
      margin-top: 4.2rem;

      @mixin tablet {
        font-size: 1.8rem;
      }

      @mixin desktop {
        font-size: 2rem;
      }
    }

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
  }
</style>
