<template>
  <div class="article">
    <div class="container layout-upper">
      <div class="article__content">
        <img
          :src="data?.img"
          :alt="data?.title"
          class="article__image"
          :class="{ 'article__image--top': data?.position }"
        />
        <h1 class="article__title">{{ data?.title }}</h1>
        <div class="article__text" v-html="data?.content"></div>
        <VButton
          class="article__button"
          type="bordered"
          color="secondary"
          iconName="thinStar"
          rounded
          @click="openModalHandler"
        >
          Составить натальную карту
        </VButton>
        <VButton class="article__back" color="bright" rounded @click="backToMainPage">
          <Icon name="lets-icons:back" />
        </VButton>
      </div>
    </div>
  </div>
</template>

<script setup>
  const route = useRoute();
  const isModalShow = modalStore();
  const { $gsap } = useNuxtApp();
  const backButton = ref(null);

  let scrollTimeout;

  const { data } = await useFetch(`/api/article`, {
    query: {
      id: route.params.id,
    },
  });

  useHead({
    title: `${data.value?.title} | Stellara`,
    meta: [
      {
        name: 'description',
        content:
          data.value?.description ||
          'Узнайте свою натальную карту и получите персональный астрологический прогноз',
      },
      {
        property: 'og:title',
        content: `${data.value?.title} | Stellara`,
      },
      {
        property: 'og:description',
        content:
          data.value?.description ||
          'Узнайте свою натальную карту и получите персональный астрологический прогноз',
      },
      {
        property: 'og:image',
        content: data.value?.img || '/img/articles/astrology.webp',
      },
      {
        property: 'og:url',
        content: `https://stellara.ru/article/${route.params.id}`,
      },
    ],
  });

  onMounted(() => {
    backButton.value = document.querySelector('.article__back');
    const page = document.querySelector('.page');
    page.classList.remove('scroll-lock');

    window.addEventListener('scroll', handleScroll);
    scrollTimeout = setTimeout(showBackButton, 400);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
    clearTimeout(scrollTimeout);
  });

  const handleScroll = () => {
    // Hide button on scroll
    $gsap.to(backButton.value, { opacity: 0, y: -20, duration: 0.2 });

    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(showBackButton, 1000);
  };

  const showBackButton = () => {
    $gsap.to(backButton.value, { opacity: 1, y: 10, duration: 0.2 });
  };

  const openModalHandler = () => {
    isModalShow.openModal(true);
  };

  const backToMainPage = () => {
    navigateTo('/');
  };
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .article {
    background-color: $darkBlack;
    padding: 8.3rem 1.6rem 4rem;
    min-height: 100vh;

    @mixin desktop {
      padding: 8.3rem 10rem;
    }

    &__content {
      position: relative;
      margin: 0 auto;
    }

    &__image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 1.6rem;
      margin-bottom: 2rem;

      &--top {
        object-position: top top;
      }

      @mixin tablet {
        height: 300px;
        margin-bottom: 3rem;

        &--top {
          object-position: 0 18%;
        }
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

    &__button {
      width: 100%;
      margin-top: 4rem;

      @mixin desktop {
        width: auto;
        min-width: 28rem;
      }
    }

    &__back {
      position: fixed;
      left: 16px;
      top: 88px;
      transition: transform 0.3s ease;
      opacity: 0;

      @mixin desktop {
        position: fixed;
        left: 160px;
        top: 80px;
      }
    }
  }
</style>
