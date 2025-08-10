<template>
  <div class="hero" ref="wrapper">
    <div class="hero__wrapper container layout-upper">
      <div class="hero__title">
        <UseIcon class="hero__star" name="star" :width="6" :height="6" />
        <img loading="lazy" src="/img/logo.svg" />
      </div>
      <p class="hero__description">
        Ваш мистический путеводитель по Вселенной. Получайте персонализированные ежедневные
        гороскопы, отчеты о совместимости и мистические озарения
      </p>
    </div>
    <img class="hero__image hero__image--left layout-upper" src="/img/dark-girl.png" alt="" />
    <img class="hero__image hero__image--right layout-upper" src="/img/bright-girl.png" alt="" />
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();
  const wrapper = ref(null);
  const { width } = useWindowSize();

  defineExpose({
    wrapper,
  });

  onMounted(() => {
    const isMobile = width.value < 1024;
    const starSize = isMobile ? 3 : 6;

    $gsap.to('.hero__star', {
      y: '-100%',
      x: '50%',
      width: `${starSize}rem`,
      height: `${starSize}rem`,
      duration: 1.4,
      ease: 'power1.inOut',

      onComplete: () => {
        const page = document.querySelector('.page');
        page.classList.remove('scroll-lock');
      },
    });

    const isOpacityValue = isMobile ? 0.5 : 1;

    $gsap.to('.hero__image', {
      opacity: isOpacityValue,
      duration: 2,
      ease: 'power1.inOut',
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .hero {
    position: relative;
    padding: 13rem 2rem 2.5rem;
    width: 100%;
    height: 100%;
    display: flex;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        60deg,
        rgba(0, 0, 29, 1) 0%,
        rgba(0, 0, 49, 0) 30%,
        rgba(255, 219, 196, 0) 58%,
        rgba(255, 173, 101, 1) 100%
      );
      opacity: 0.33;
    }

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
      right: 49.5%;
      transform: translate(50%, -1000%);
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

    &__image {
      position: absolute;
      bottom: 8px;
      max-height: 30dvh;
      opacity: 0;
      z-index: -10;

      @mixin small-mobile {
        bottom: -10%;
        max-height: 30dvh;
      }

      @mixin tablet {
        display: block;
        bottom: 0;
        max-height: 32dvh;
      }

      @mixin desktop {
        max-height: 70vh;
      }

      &--left {
        left: -6%;

        @mixin tablet {
          left: 0;
        }
      }

      &--right {
        right: -6%;

        @mixin tablet {
          right: 0;
        }
      }
    }
  }
</style>
