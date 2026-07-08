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

  watch(isModalShow, (isOpen) => {
    if (!isOpen) {
      navigateTo('/');
    }
  });
</script>

<style scoped>
  .personality-test-page {
    min-height: 50vh;
  }
</style>
