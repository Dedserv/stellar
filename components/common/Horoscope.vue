<template>
  <div class="horoscope layout-pattern">
    <div class="container">
      <h2 class="horoscope__title">Гороскоп на день</h2>
      <MainCatergory class="layout-upper" />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
  @import '~/assets/css/variables.css';

  .horoscope {
    padding: 4rem 1.6rem;
    background-color: $darkBlack;
    border-radius: 1.6rem;

    @mixin tablet {
      padding: 4rem 1.6rem;
      border-radius: 2.6rem;
    }

    @mixin desktop {
      padding: 8rem 10rem;
      border-radius: 4rem;
    }

    &__title {
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      margin-bottom: 2rem;
      font-size: 3.2rem;
      line-height: 4.1rem;
      color: $lightGrayOrange;
      font-weight: 300;

      &::before,
      &::after {
        content: '';
        flex: 1; /* Линии адаптируются по ширине */
        height: 0.1rem;
        opacity: 0.4;
        background-color: $whiteOrange;
      }

      &::before {
        margin-right: 0.6em; /* Отступ между линией и текстом */
      }

      &::after {
        margin-left: 0.6em;
      }
    }
  }
</style>
