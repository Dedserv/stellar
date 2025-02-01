<template>
  <div class="slider-adaptive">
    <VSlider v-if="!isDesktop && isMounted">
      <swiper-slide
        v-for="(card, index) in cards"
        :key="`slide_${index + uid()}`"
        class="slider-adaptive__slider"
      >
        <VCard v-bind="card" :type="type" :size="size" :bordered="bordered" />
      </swiper-slide>
    </VSlider>

    <div v-else class="slider-adaptive__cards">
      <VCard
        v-for="(card, index) in cards"
        :key="`card_${index + uid()}`"
        v-bind="card"
        :type="type"
        :size="size"
        :bordered="bordered"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { uid } from 'uid';

  const props = defineProps({
    cards: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: 'default',
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['medium', 'large'].includes(value),
    },
    bordered: {
      type: Boolean,
      default: false,
    },
  });

  const { width } = useWindowSize();
  const isMounted = ref(false);
  const isDesktop = computed(() => width.value > 1023);

  onMounted(() => {
    isMounted.value = true;
  });
</script>

<style scoped>
  .slider-adaptive {
    &__slider {
      max-height: 80dvh;
      height: 100%;
      display: flex;
      flex: 1 1;
    }

    &__cards {
      display: flex;
      gap: 0.6rem;

      @mixin desktop {
        gap: 2rem;
      }
    }
  }
</style>
