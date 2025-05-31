<template>
  <div class="modal-results">
    <ModalHeader
      v-if="natalResultCards.length"
      class="modal-results__header"
      :count="cardsCount"
      :currentSlideIndex="currentCard"
      @close-modal="clickExitButton"
    />

    <VButton
      v-else="natalResultCards.length"
      class="modal-results__button"
      size="s"
      type="transparent"
      color="gray"
      @click="closeModalHandler"
    >
      <UseIcon class="modal-results__arrow" name="exit" :width="3.3" :height="2.4" />
      Выход
    </VButton>
    <Transition>
      <NatalLoader v-if="!natalResultCards.length" />
      <TarotDeck v-else :natal-result="natalResultCards" @card-change="cardChange" />
    </Transition>
  </div>
</template>

<script setup>
  import scrollLock from '@/composables/scrollLock.js';
  import { modalStore } from '@/stores/modal';

  const emit = defineEmits(['closeModal']);
  const props = defineProps({
    natalResult: {
      type: String,
      default: '',
    },
  });

  import { questionsStore } from '@/stores/questions';

  const questionStores = questionsStore();

  const modal = modalStore();

  const { parseResultToCards } = useTarotDeck();
  const currentCard = ref(0);

  const natalResultCards = computed(() => parseResultToCards(props.natalResult));

  const cardsCount = computed(() =>
    natalResultCards.value.reduce((acc, deck) => acc + deck.cards.length, 0)
  );

  const cardChange = (e) => {
    currentCard.value = e.activeIndex;
  };

  const clickExitButton = () => {
    scrollLock(false);
    questionStores.setSlideIndex(0);
    modal.closeModal();
  };

  const closeModalHandler = () => emit('closeModal');
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .natal-content {
    padding: 2rem;
    max-height: 80vh;
    overflow-y: auto;
    text-align: left;
  }

  .section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
    color: $softOrange;
    margin: 0;
  }

  .subsection {
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  .subsection h3 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.2rem;
    color: $lightGrayOrange;
    margin-bottom: 1rem;
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
  }

  .item span {
    flex: 1;
  }

  .modal-results {
    position: relative;
    text-align: center;
    color: $lightGrayOrange;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    padding-top: 20px;

    &__header {
      position: fixed;
      left: 16px;
      right: 16px;
      top: 0;
      padding: 3.2rem 0;
      color: $lightGrayOrange;

      @mixin tablet {
        display: none;
      }

      :deep(.modal-header__counter) {
        opacity: 1;
        visibility: visible;
      }
    }

    &__button {
      position: absolute;
      top: 2.4rem;
      left: 2.4rem;
      color: $gray;
      opacity: 0;
    }

    &__arrow {
      color: $softOrange;
    }
  }

  .word {
    display: inline-block;
    margin-right: 8px;
    vertical-align: center;
  }

  .image {
    max-width: 100%;
    margin: 20px auto 0;
  }
</style>
