<template>
  <div class="tarot-card" :class="{ 'is-flipped': isFlipped || isMobile }" ref="card">
    <div class="tarot-card__inner">
      <div class="tarot-card__front">
        <!-- <img :src="`/img/zodiacs/${image}`" :alt="title" /> -->
        <img src="/img/cards/bg-card2.png" :alt="title" />
        <div class="tarot-card__category">{{ category }}</div>
        <!-- <div class="tarot-card__title">
          <Icon name="ph:sun-bold" class="title-icon" />
          {{ title }}
        </div> -->
      </div>
      <div class="tarot-card__back">
        <!-- <img :src="`/img/cards/stroke-bg4.png`" :alt="title" /> -->
        <div class="tarot-card__header">
          <Icon :name="icon" class="header-icon" />
          <h3>{{ title }}</h3>
        </div>
        <div class="tarot-card__content" v-html="content"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();

  const props = defineProps({
    title: String,
    content: String,
    image: String,
    isFlipped: Boolean,
    category: String,
    icon: {
      type: String,
      default: 'ph:sun-bold',
    },
  });

  const card = ref(null);
  const isMobile = ref(false);

  onMounted(() => {
    isMobile.value = window.innerWidth <= 768;

    $gsap.set(card.value, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      duration: 0.6,
    });

    // Анимация появления
    $gsap.to(card.value, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .tarot-card {
    width: 100%;
    min-width: 340px;
    height: 70dvh;
    position: absolute;
    transform: none;
    /* margin: 0 auto; */
    scroll-snap-align: center;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    transition:
      transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1),
      opacity 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);

    @mixin tablet {
      height: 480px;
      width: 290px;
      min-width: auto;
    }
  }

  .tarot-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);

    @media (max-width: 768px) {
      transform: none;
    }
  }

  .tarot-card__inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 1s cubic-bezier(0.645, 0.045, 0.355, 1);
    backface-visibility: hidden;
  }

  .tarot-card.is-flipped .tarot-card__inner {
    transform: rotateY(180deg);
  }

  .tarot-card__front,
  .tarot-card__back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 20px;
    overflow: hidden;
    box-shadow:
      0 8px 20px rgba(0, 0, 0, 0.15),
      0 2px 8px rgba(0, 0, 0, 0.1);
    transform-style: preserve-3d;
  }

  .tarot-card__front {
    background: $blackBlue;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0.7;
    }

    .tarot-card__title {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 20px;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
      color: white;
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      gap: 10px;

      .title-icon {
        font-size: 24px;
      }
    }
  }

  .tarot-card__back {
    background: linear-gradient(135deg, #ffd3b6, #c49373);
    transform: rotateY(180deg);
    padding: 18px 12px;
    color: $blackBlue;
    position: relative;

    @mixin tablet {
      padding: 20px 16px;
    }

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
    }
  }

  .tarot-card__back::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.45;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  .tarot-card__header,
  .tarot-card__content {
    position: relative;
    z-index: 1;
  }

  .tarot-card__header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    width: 80%;

    @media (max-width: 768px) {
      width: 100%;
    }

    .header-icon {
      font-size: 24px;
      color: $blackBlue;
    }

    h3 {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      color: $blackBlue;

      @media (max-width: 768px) {
        font-size: 2rem;
      }
    }
  }

  .tarot-card__content {
    font-size: 1.4rem;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    @media (max-width: 768px) {
      font-size: 1.8rem;
    }

    :deep(p) {
      margin-bottom: 1em;
    }

    :deep(strong) {
      color: darken($blackBlue, 10%);
      font-weight: 600;
    }

    :deep(h4) {
      font-size: 1.6rem;
      margin: 1.2em 0 0.6em;
      font-size: 1.8rem;
      margin: 1.5em 0 0.8em;
      color: darken($blackBlue, 15%);

      @media (max-width: 768px) {
        font-size: 1.4rem;
        margin: 1em 0 0.5em;
      }
    }
  }

  .tarot-card__category {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: $softOrange;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 1.2rem;
    font-weight: 600;
    text-align: center;
    width: auto;
    white-space: nowrap;
    z-index: 2;
  }

  @media (max-width: 768px) {
    .tarot-card {
      width: 100%;
      min-width: 30px;
      height: 70dvh;
      position: relative;
      transform: none;
      margin: 0 auto;
      scroll-snap-align: center;
    }

    .tarot-card__category {
      font-size: 1rem;
      padding: 6px 12px;
    }
  }
</style>
