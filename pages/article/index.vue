<template>
  <section class="articles container">
    <Breadcrumbs class="articles__breadcrumbs" :items="breadcrumbItems" />
    <ul class="articles__list">
      <li v-for="(card, index) in data" :key="`${index}_card`" class="articles__card">
        <VCard v-bind="card" type="default" size="medium" textPosition="left" />
      </li>
    </ul>
  </section>
</template>

<script setup>
  const { data } = await useFetch('/api/article');
  const route = useRoute();

  const breadcrumbItems = computed(() => [
    { name: 'Главная', path: '/' },
    { name: 'Статьи', path: '/article' },
  ]);

  onMounted(async () => {
    nextTick(() => {
      const page = document.querySelector('.page');
      page.classList.remove('scroll-lock');
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';
  .articles {
    margin-top: 8.2rem;
    padding: 1.8rem 1.6rem;
    position: relative;
    z-index: 1;

    @mixin tablet {
      padding: 4rem 1.6rem;
    }

    @mixin desktop {
      padding: 2.4rem 0;
    }

    &__breadcrumbs {
      margin-bottom: 3rem;
    }

    &__list {
      display: flex;
      flex-direction: column;
      gap: 2.4rem;

      @mixin tablet {
        flex-direction: row;
        gap: 2.4rem;
        row-gap: 3.4rem;
        flex-wrap: wrap;
      }

      @mixin desktop {
        gap: 2.6rem;
        row-gap: 4.6rem;
      }
    }

    &__card {
      @mixin tablet {
        flex-basis: calc(50% - 2.4rem);
      }

      @mixin desktop {
        flex-basis: calc(33.9% - 2.6rem);
      }

      :deep(.card__bg) {
        object-fit: contain;
      }
    }
  }
</style>
