<template>
  <div class="questionnaire">
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
          rounded
          fullsized
          >Пройти тест</VButton
        >
      </div>
      <div>
        <img loading="lazy" class="questionnaire__img" src="@/assets/img/about.png" alt="" />
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
  import { gsap } from 'gsap';
  import stars from '~/assets/js/questionnaireStars';

  const isTablet = useMediaQuery('(min-width: 768px) and ( max-width: 1023px)', { ssrWidth: 768 });
  const isMobile = useMediaQuery('(max-width: 767px)', { ssrWidth: 395 });
  const star = ref([]);
  let animationInterval;

  const starsList = computed(() => {
    return stars.filter((star) => {
      if (isMobile.value) return star.positionMobile;
      if (isTablet.value && star.hideOn === 'tablet') return false;
      return star.position;
    });
  });

  const rotationCount = ref({}); // Счетчик прокруток для каждой иконки

  const animateIcons = () => {
    const icons = [...star.value]; // Получаем все иконки через ref
    const count = Math.floor(Math.random() * 3) + 1; // Случайное количество иконок (1, 2 или 3)
    const shuffledIcons = gsap.utils.shuffle(icons); // Перемешиваем иконки

    let selectedIcons = [];
    let selectedCount = 0;

    // Выбираем иконки, которые не прокручивались более 2 раз подряд
    for (const icon of shuffledIcons) {
      if (selectedCount >= count) break; // Если уже выбрали нужное количество иконок

      const iconId = icon.$el.id || icon.$el.dataset.id; // Уникальный идентификатор иконки
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
      gsap.to(icon.$el, {
        rotation: `${direction}90`, // Вращение на +90 или -90 градусов
        duration: 0.4, // Длительность анимации
        ease: 'easeOutElastic',
        transformOrigin: 'center center', // Вращение вокруг центра
        onComplete: () => {
          // Сбрасываем счетчик прокруток для этой иконки через 3 секунды
          const iconId = icon.$el.id || icon.$el.dataset.id;
          setTimeout(() => {
            if (rotationCount.value[iconId]) {
              rotationCount.value[iconId] = 0; // Сбрасываем счетчик
            }
          }, 1000);
        },
      });
    });
  };

  onMounted(() => {
    animateIcons();
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

    &__img {
      display: none;

      @mixin tablet {
        flex: 1 1 50%;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    &__button {
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
