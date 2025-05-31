<template>
  <div class="about">
    <div class="container layout-upper">
      <h2 class="about__title title">О мистике</h2>
      <p v-html="mistyc.text"></p>
      <div class="about__cards">
        <SliderAdaptive :cards="data" size="large" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import mistyc from '~/assets/js/mockMystic.js';

  const { data } = await useFetch('/api/article');
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .about {
    position: relative;
    z-index: 2;
    background-color: $darkBlack;
    padding: 6rem 1.6rem 8rem;
    border-radius-top: 1.6rem;

    @mixin tablet {
      padding: 4rem 1.6rem;
      border-radius-top: 2.6rem;
    }

    @mixin desktop {
      padding: 6rem 10rem 8rem;
      border-radius-top: 4rem;
    }

    &__title {
      margin-bottom: 4rem;

      @mixin tablet {
        margin-bottom: 3.6rem;
      }
    }

    p {
      font-size: 1.8rem;
      line-height: 1.4;
      font-weight: 400;
      color: $lightGrayOrange;
      margin: 0;
      margin-bottom: 3.2rem;

      @mixin tablet {
        margin-bottom: 4.2rem;
      }

      @mixin desktop {
        margin-bottom: 5.8rem;
        max-width: 50%;
      }
    }
  }
</style>
