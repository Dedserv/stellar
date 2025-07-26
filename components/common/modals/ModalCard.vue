<template>
  <Teleport to="#teleports">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-card">
        <div class="modal-card__overlay" @click="closeModal"></div>
        <div class="modal-card__content">
          <div class="modal-card__header">
            <h3 v-if="cardData.title" class="modal-card__title">
              {{ cardData.title }}
            </h3>
            <VButton
              class="modal-card__close-btn"
              size="s"
              type="transparent"
              color="gray"
              @click="closeModal"
            >
              <UseIcon name="close" :width="3.3" :height="2.4" />
            </VButton>
          </div>

          <div class="modal-card__body">
            <div class="modal-card__image-wrapper">
              <img
                loading="lazy"
                class="modal-card__image"
                :src="cardData.img"
                :alt="cardData.title"
              />
            </div>

            <div class="modal-card__info">
              <p v-if="cardData.description" class="modal-card__description">
                {{ cardData.description }}
              </p>

              <div v-if="cardData.text" class="modal-card__text" v-html="cardData.text"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import scrollLock from '@/composables/scrollLock.js';

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false,
    },
    cardData: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['close']);

  const closeModal = () => {
    scrollLock(false);
    emit('close');
  };

  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue) {
        console.log('open');
        scrollLock(true);
      }
    }
  );

  onUnmounted(() => {
    scrollLock(false);
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal-card {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.6rem;

    &__overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(4px);
    }

    &__content {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 40rem;
      max-height: 90vh;
      background-color: $darkBlue;
      border-radius: 1.2rem;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.6rem;
      border-bottom: 1px solid rgba(233, 168, 124, 0.2);
    }

    &__close-btn {
      font-size: 1.4rem;
    }

    &__body {
      flex: 1;
      overflow-y: auto;
      padding: 1.6rem;
    }

    &__image-wrapper {
      width: 100%;
      height: 20rem;
      border-radius: 0.8rem;
      overflow: hidden;
      margin-bottom: 1.6rem;
      background-color: rgba(233, 168, 124, 0.1);
    }

    &__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &__info {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    &__title {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1.3;
      color: $primaryWhite;
    }

    &__description {
      margin: 0;
      font-size: 1.6rem;
      line-height: 1.5;
      color: $gray;
    }

    &__text {
      font-size: 1.6rem;
      line-height: 1.5;
      color: $lightGrayOrange;
    }
  }

  /* Анимации */
  .modal-enter-active,
  .modal-leave-active {
    transition: all 0.3s ease;
  }

  .modal-enter-from {
    opacity: 0;
    transform: scale(0.9);
  }

  .modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
  }

  .modal-enter-to,
  .modal-leave-from {
    opacity: 1;
    transform: scale(1);
  }
</style>
