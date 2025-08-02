<template>
  <div class="slider-adaptive">
    <ClientOnly>
      <VSlider v-if="!isDesktop" :options="SLIDER_OPTIONS">
        <swiper-slide
          v-for="(card, index) in cards"
          :key="`slide_${index + uId}`"
          class="slider-adaptive__slider"
        >
          <VCard
            v-bind="card"
            :type="type"
            :size="size"
            :bordered="bordered"
            @cardClick="openCardModal"
          />
        </swiper-slide>
      </VSlider>

      <div v-else class="slider-adaptive__cards">
        <VCard
          v-for="(card, index) in cards"
          :key="`card_${index + uId}`"
          v-bind="card"
          :type="type"
          :size="size"
          :bordered="bordered"
          @cardClick="openCardModal"
        />
      </div>

      <ModalCard :is-open="isCardModalOpen" :card-data="selectedCardData" @close="closeCardModal" />
    </ClientOnly>
  </div>
</template>

<script setup>
  import { uid } from 'uid';
  const uId = uid();

  const SLIDER_OPTIONS = {
    spaceBetween: 12,
  };

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
  const isDesktop = computed(() => width.value > 1023);

  // Состояние для модалки карточки
  const isCardModalOpen = ref(false);
  const selectedCardData = ref({});

  // Открытие модалки карточки
  const openCardModal = (cardData) => {
    selectedCardData.value = cardData;
    isCardModalOpen.value = true;
  };

  // Закрытие модалки карточки
  const closeCardModal = () => {
    isCardModalOpen.value = false;
    selectedCardData.value = {};
  };
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
