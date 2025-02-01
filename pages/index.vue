<template>
  <main class="main">
    <section class="main__hero layout-pattern" ref="hero">
      <Hero v-show="isShowHero" ref="hero-component" />
    </section>

    <section>
      <Horoscope class="main__horoscope" />
    </section>

    <section>
      <AboutQuestionnaire />
    </section>
    <section>
      <AboutProduct />
    </section>
  </main>
</template>

<script setup>
  const { y } = useWindowScroll();
  const hero = templateRef('hero');
  const { height } = useElementSize(hero);

  const isShowHero = computed(() => y.value < height.value + 140);
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .main {
    position: relative;
    overflow: hidden;

    &__hero {
      position: fixed;
      z-index: 1;
      width: 100%;
      top: 8.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40dvh;

      @mixin tablet {
        height: 44dvh;
      }

      @mixin desktop {
        height: 80vh;
      }
    }

    &__horoscope {
      position: relative;
      z-index: 2;
      margin-top: calc(40dvh + 8.2rem);

      @mixin tablet {
        margin-top: calc(44dvh + 8.2rem);
      }

      @mixin desktop {
        margin-top: calc(80vh + 5.2rem);
      }
    }
  }

  .layout-pattern {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: url('@/assets/img/pattern.webp');
      background-repeat: repeat;
      opacity: 0.2;
      z-index: 1;
    }
  }
</style>
