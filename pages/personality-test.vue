<template>
  <div class="personality-test-page page" />
</template>

<script setup lang="ts">
  import { storeToRefs } from 'pinia';
  import { modalStore } from '~/stores/modal';

  useHead({
    title: 'Астрологический тест — Stellara',
  });

  const modal = modalStore();
  const { isModalShow } = storeToRefs(modal);

  onMounted(() => {
    nextTick(() => {
      modal.openModal();
    });
  });

  const route = useRoute();

  watch(isModalShow, (isOpen) => {
    // Only bounce home on dismiss — success flow already navigated to result
    if (!isOpen && route.path === '/personality-test') {
      navigateTo('/');
    }
  });
</script>

<style scoped>
  .personality-test-page {
    min-height: 50vh;
  }
</style>
