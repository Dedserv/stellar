<template>
  <main class="main">
    <section class="main__hero layout-pattern" ref="hero">
      <Hero v-show="isShowHero" ref="hero-component" />
    </section>

    <section id="horoscope">
      <Horoscope class="main__horoscope" />
    </section>

    <section id="questionnaire">
      <AboutQuestionnaire />
    </section>
    <section id="taro">
      <AboutProduct />
    </section>
  </main>
</template>

<script setup>
  const { y } = useWindowScroll();
  const hero = templateRef('hero');
  const { height } = useElementSize(hero);

  const isShowHero = computed(() => y.value < height.value + 140);

  useHead({
    title: 'Stellara - Персональная натальная карта и астрологический прогноз',
    meta: [
      {
        name: 'description',
        content:
          'Получите свою персональную натальную карту и узнайте, как звезды влияют на вашу судьбу. Точный астрологический прогноз и рекомендации для вашего развития.',
      },
      {
        name: 'keywords',
        content:
          'натальная карта, астрология, гороскоп, астрологический прогноз, составление натальной карты, персональный гороскоп',
      },
      {
        property: 'og:title',
        content: 'Stellara - Персональная натальная карта и астрологический прогноз',
      },
      {
        property: 'og:description',
        content:
          'Получите свою персональную натальную карту и узнайте, как звезды влияют на вашу судьбу. Точный астрологический прогноз и рекомендации для вашего развития.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://www.stellara.ru',
      },
      {
        property: 'og:image',
        content: 'https://www.stellara.ru/img/articles/astrology.webp',
      },
      {
        property: 'og:site_name',
        content: 'Stellara',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Stellara - Персональная натальная карта и астрологический прогноз',
      },
      {
        name: 'twitter:description',
        content:
          'Получите свою персональную натальную карту и узнайте, как звезды влияют на вашу судьбу. Точный астрологический прогноз и рекомендации для вашего развития.',
      },
      {
        name: 'twitter:image',
        content: 'https://www.stellara.ru/img/articles/astrology.webp',
      },
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Stellara - Персональная натальная карта',
          description:
            'Получите свою персональную натальную карту и узнайте, как звезды влияют на вашу судьбу',
          url: 'https://www.stellara.ru',
          mainEntity: {
            '@type': 'Service',
            name: 'Составление натальной карты',
            description: 'Персональный астрологический анализ и прогноз',
            provider: {
              '@type': 'Organization',
              name: 'Stellara',
            },
            areaServed: 'RU',
            serviceType: 'Астрологические услуги',
          },
        }),
      },
    ],
  });
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
      height: 44dvh;
      min-height: 36rem;

      &::after {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        content: '';
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.33));
      }

      @mixin tablet {
        height: 44dvh;
        min-height: auto;
      }

      @mixin desktop {
        height: 80vh;
      }
    }

    &__horoscope {
      position: relative;
      z-index: 2;
      margin-top: max(46rem, 40dvh + 8.2rem);

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
