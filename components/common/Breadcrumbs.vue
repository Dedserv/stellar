<template>
  <nav class="breadcrumbs" aria-label="Хлебные крошки">
    <ol class="breadcrumbs__list">
      <li class="breadcrumbs__item" v-for="(item, index) in items" :key="index">
        <NuxtLink v-if="index < items.length - 1" :to="item.path" class="breadcrumbs__link">
          {{ item.name }}
        </NuxtLink>
        <span v-else class="breadcrumbs__current" aria-current="page">
          {{ item.name }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
  defineProps({
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .breadcrumbs {
    margin-bottom: 2rem;
  }

  .breadcrumbs__list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 1.4rem;
    color: $lightGrayOrange;
  }

  .breadcrumbs__item {
    display: flex;
    align-items: center;
  }

  .breadcrumbs__item:not(:last-child)::after {
    content: '/';
    margin: 0 0.8rem;
    color: $softOrange;
  }

  .breadcrumbs__link {
    color: $softOrange;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .breadcrumbs__link:hover {
    color: $primaryWhite;
  }

  .breadcrumbs__current {
    color: $primaryWhite;
    font-weight: 500;
  }
</style>
