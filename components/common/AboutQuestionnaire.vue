<template>
  <div ref="container" class="questionnaire">
    <div class="questionnaire__wrapper container layout-upper">
      <div class="questionnaire__text-wrapper">
        <h2 class="questionnaire__title">Узнайте, что звезды говорят о вас</h2>
        <p class="questionnaire__text">
          Звёзды знают о вас больше, чем вы думаете. Пройдите короткий тест и получите персональную
          натальную карту с детальной расшифровкой ваших сильных сторон, скрытых талантов и
          жизненных направлений.
        </p>
        <VButton
          class="questionnaire__button"
          aria-label="Пройти астрологический тест"
          type="bordered"
          color="secondary"
          rounded
          fullsized
          @click="openModalHandler"
        >
          Пройти тест
        </VButton>
      </div>
      <div class="questionnaire__img-wrapper">
        <img
          ref="moon"
          loading="lazy"
          class="questionnaire__moon"
          src="@/assets/img/moon.webp"
          alt=""
        />
        <img loading="lazy" class="questionnaire__img" src="@/assets/img/about.webp" alt="" />
      </div>
      <div v-if="starsList?.length" class="questionnaire__icons">
        <UseIcon
          v-for="(star, idx) in starsList"
          :key="`star_${star.size}_${idx}`"
          ref="star"
          name="star"
          class="questionnaire__icon"
          :data-id="`star_${star.size}_${idx}`"
          :style="{
            top: `${isMobile ? star.positionMobile.y : star.position.y}%`,
            left: `${isTablet && idx === starsList.length - 1 ? star.position.x + 37 : isMobile ? star.positionMobile.x : star.position.x}%`,
          }"
          :width="star.size"
          :height="star.size"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import scrollLock from '@/composables/scrollLock.js';
  import { modalStore } from '@/stores/modal';

  import stars from '~/assets/js/questionnaireStars';

  const { $gsap } = useNuxtApp();

  const isTablet = useMediaQuery('(min-width: 768px) and ( max-width: 1023px)', { ssrWidth: 768 });
  const isMobile = useMediaQuery('(max-width: 767px)', { ssrWidth: 395 });
  const starRefs = templateRef('star');
  const moon = ref(null);
  const container = ref(null);

  let animationInterval;

  const modal = modalStore();

  const openModalHandler = () => {
    scrollLock(false);
    modal.openModal();
  };

  const starsList = computed(() => {
    return stars.filter((star) => {
      if (isMobile.value) return star.positionMobile;
      if (isTablet.value && star.hideOn === 'tablet') return false;
      return star.position;
    });
  });

  const rotationCount = ref({}); // Счетчик прокруток для каждой иконки

  function animateIcons() {
    const icons = [...starRefs.value]; // Получаем все иконки через ref
    const count = Math.floor(Math.random() * 3) + 1; // Случайное количество иконок (1, 2 или 3)
    const shuffledIcons = $gsap.utils.shuffle(icons); // Перемешиваем иконки

    let selectedIcons = [];
    let selectedCount = 0;

    // Выбираем иконки, которые не прокручивались более 2 раз подряд
    for (const icon of shuffledIcons) {
      if (selectedCount >= count) break; // Если уже выбрали нужное количество иконок

      const iconId = icon.$el.dataset.id; // Уникальный идентификатор иконки
      if (!iconId) continue; // Если у иконки нет идентификатора, пропускаем

      // Если иконка уже прокручивалась 2 раза подряд, пропускаем её
      if (rotationCount.value[iconId] >= 1) continue;

      selectedIcons.push(icon);
      selectedCount++;

      // Увеличиваем счетчик прокруток для этой иконки
      rotationCount.value[iconId] = (rotationCount.value[iconId] || 0) + 1;
    }

    // Анимация для выбранных иконок
    selectedIcons.forEach((icon) => {
      const direction = Math.random() > 0.5 ? '+=' : '-='; // Случайное направление вращения
      $gsap.to(icon.$el, {
        rotation: `${direction}90`, // Вращение на +90 или -90 градусов
        duration: 0.4, // Длительность анимации
        ease: 'easeOutElastic',
        transformOrigin: 'center center', // Вращение вокруг центра
        onComplete: () => {
          // Сбрасываем счетчик прокруток для этой иконки через 3 секунды
          const iconId = icon.$el.dataset.id;
          setTimeout(() => {
            if (rotationCount.value[iconId]) {
              rotationCount.value[iconId] = 0; // Сбрасываем счетчик
            }
          }, 1000);
        },
      });
    });
  }

  const animateMoon = () => {
    const topOffset = isTablet.value ? '4%' : '10%';

    $gsap.to(moon.value, {
      top: topOffset,
      duration: 3, // Длительность анимации
      rotation: '+=180',
      ease: 'power1.inOut',
      onComplete: () => {
        $gsap.to(moon.value, {
          rotation: '+=360', // Вращение на 360 градусов
          duration: 40, // Длительность анимации
          ease: 'linear',
          repeat: -1, // Повторять бесконечно
        });
      },
    });
  };

  onMounted(() => {
    animateIcons();
    useIntersectionObserver(container.value, ([entry]) => {
      if (entry.isIntersecting) {
        animateMoon();
      }
    });
    animationInterval = setInterval(() => {
      animateIcons();
    }, 1000);
  });

  onUnmounted(() => {
    clearInterval(animationInterval);
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .questionnaire {
    position: relative;
    z-index: 1;
    overflow: hidden;
    background-color: $blackBlue;
    color: $lightGrayOrange;
    padding: 14rem 1.6rem;

    @mixin tablet {
      padding: 0 1.6rem;
    }

    &__wrapper {
      position: relative;

      @mixin tablet {
        display: flex;
        align-items: center;
        padding: 5rem 0;
      }

      @mixin desktop {
        min-height: 64rem;
      }
    }

    &__text-wrapper {
      @mixin tablet {
        flex: 1 1 50%;
      }

      @mixin desktop {
        flex: 1 1 36%;
      }
    }

    &__title {
      font-size: 3.6rem;
      line-height: 1.2;
      font-weight: 700;
      margin: 0;
      margin-bottom: 1.6rem;
    }

    &__text {
      font-size: 1.6rem;
      line-height: 1.4;
      margin: 0;
      margin-bottom: 4rem;

      @mixin tablet {
        margin-bottom: 6rem;
      }

      @mixin desktop {
        margin-bottom: 10rem;
      }
    }

    &__img-wrapper {
      position: relative;

      @mixin tablet {
        flex: 1 1 50%;
      }
    }

    &__moon {
      display: none;

      @mixin tablet {
        display: block;
        position: absolute;
        top: 4%;
        left: 4%;
        width: 140px;
        height: 140px;
        filter: drop-shadow(0 0 20px $softOrangeTrans);
      }

      @mixin desktop {
        top: -60%;
        left: 6%;
        width: 220px;
        height: 220px;
        filter: drop-shadow(0 0 34px $softOrangeTrans);
      }
    }

    &__img {
      display: none;

      @mixin tablet {
        position: relative;
        bottom: -8rem;
        display: block;
        width: 120%;
        height: 100%;
        object-fit: contain;
      }

      @mixin desktop {
        position: relative;
        bottom: -16rem;
        width: 100%;
      }
    }

    &__button {
      position: relative;
      z-index: 10;
      max-width: 44rem;
    }

    &__icons {
      color: $softOrange;
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
    }

    &__icon {
      position: absolute;
    }
  }
</style>
