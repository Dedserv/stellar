<template>
  <div class="article">
    <div class="container">
      <div class="article__content">
        <!-- <img :src="data?.image" :alt="data?.title" class="article__image" />
        <h1 class="article__title">{{ data?.title }}</h1>
        <div class="article__text" v-html="data?.content"></div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
  onMounted(async () => {
    // const route = useRoute();
    const { data } = await useFetch(`/api/article`, {
      // query: {
      //   key: route.params.id,
      // },
    });

    console.log('🚀 ~ data:', data);
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .article {
    background-color: $darkBlack;
    padding: 2rem 1.6rem;
    min-height: 100vh;

    @mixin tablet {
      padding: 3rem 1.6rem;
    }

    @mixin desktop {
      padding: 4rem 10rem;
    }

    &__content {
      max-width: 900px;
      margin: 0 auto;
    }

    &__image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 1.6rem;
      margin-bottom: 2rem;

      @mixin tablet {
        height: 300px;
        margin-bottom: 3rem;
      }

      @mixin desktop {
        height: 400px;
        margin-bottom: 4rem;
      }
    }

    &__title {
      color: $primaryWhite;
      font-weight: 700;
      margin-bottom: 2rem;
      @mixin responsive-font-size 2.4rem, 3.2rem, 4rem;
    }

    &__text {
      color: $lightGrayOrange;
      line-height: 1.6;
      @mixin responsive-font-size 1.6rem, 1.8rem, 2rem;

      p {
        margin-bottom: 1.6rem;

        @mixin tablet {
          margin-bottom: 2rem;
        }
      }
    }
  }
</style>
