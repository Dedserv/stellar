<template>
  <ul class="category">
    <li v-for="(zodiac, index) in horoscope" :key="`zodiac_${index}`" class="category__item">
      <div class="category__title">
        <h3>{{ dictionaryElements[zodiac.element] }}</h3>
        <UseIcon class="category__icon" :name="zodiac.element" :width="2.4" :height="2.4"></UseIcon>
      </div>
      <SliderAdaptive :cards="zodiac.signs" :type="horoscope[0].type" bordered />
    </li>
  </ul>
</template>

<script setup>
  const dictionaryElements = {
    fire: 'Огонь',
    water: 'Вода',
    earth: 'Земля',
    air: 'Воздух',
  };

  const horoscope = ref([]);

  onMounted(async () => {
    horoscope.value = await $fetch('/api/horoscope');
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .category {
    padding: 2rem 0;

    &__slider {
      max-height: 80dvh;
      height: 100%;
      display: flex;
      flex: 1 1;
    }

    &__item {
      padding: 2rem 0 3rem;
      margin-bottom: 2rem;

      border-bottom: 1px solid $blackOrange;
    }

    &__cards {
      display: flex;
      gap: 0.6rem;
    }

    &__title {
      display: flex;
      align-items: center;
      margin-bottom: 1.6rem;

      h3 {
        margin: 0;
        margin-right: 0.6rem;
        font-size: 2.4rem;
        line-height: 1.2;
        color: $lightGrayOrange;
        font-weight: 400;
      }

      :deep(.icon_fire) {
        color: #8a382a;
      }
      :deep(.icon_water) {
        color: #324476;
      }
      :deep(.icon_earth) {
        color: #35452f;
      }
      :deep(.icon_air) {
        color: #266b7a;
      }
    }

    :deep(.card__title-wrapper) {
      justify-content: flex-start;
    }
  }
</style>
