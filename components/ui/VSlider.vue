<template>
  <ClientOnly>
    <swiper-container :init="false" ref="container" :key="uid()" class="swiper-container">
      <slot />
    </swiper-container>
  </ClientOnly>
</template>

<script setup>
  import { useWindowSize } from '@vueuse/core';
  import { uid } from 'uid';
  import { globalStore } from '@/stores/global';

  const isSwiperLoaded = globalStore();

  const { width } = useWindowSize();

  const props = defineProps({
    options: {
      type: Object,
      default: () => ({}),
    },
    controls: {
      type: Boolean,
      default: false,
    },
  });

  const container = ref(null);

  const emit = defineEmits(['slideChange']);

  useSwiper(container, {
    effect: 'slide',
    slidesPerView: 'auto',
    // spaceBetween: 12,
    on: {
      afterInit: () => {
        isSwiperLoaded.swiperLoaded(true);
      },

      slideChange: (slide) => {
        emit('slideChange', slide);
      },
    },
    ...props.options, // Передача дополнительных опций
  });

  // Слежение за изменением ширины окна
  watch(width, (newWidth) => {
    if (container.value.swiper && newWidth > 1024) {
      container.value.swiper.destroy();
      container.value.swiper = null;
      isSwiperLoaded.swiperLoaded(false);
    }
  });

  // Уничтожение слайдера при анмаунте
  onBeforeUnmount(() => {
    if (container.value && container.value.swiper) {
      container.value.swiper.destroy();
      container.value.swiper = null;
      isSwiperLoaded.swiperLoaded(false);
    }
  });
</script>

<style scoped>
  .swiper {
    width: 100%;
    height: 100%;
  }

  .swiper-container {
    display: flex;
    overflow: hidden;
    width: 100%;
  }

  :deep(.swiper-slide) {
    width: auto;
    height: auto;
  }
</style>
