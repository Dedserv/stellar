<template>
  <MainHeader />
  <slot />
  <MainFooter class="layout-upper" />
  <UseIcons style="display: none" />
  <div class="layout-pattern"></div>
  <LazyFullscreenModal v-if="modal.isModalShow"></LazyFullscreenModal>
  <div id="teleports"></div>
</template>
<script setup>
  import { modalStore } from '@/stores/modal';
  const modal = modalStore();
</script>
