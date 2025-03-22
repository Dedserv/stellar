<template>
  <div class="tarot-deck">
    <div v-if="selectedDeck" class="tarot-deck__selected">
      <h2 class="tarot-deck__title">{{ selectedDeck.title }}</h2>
      <div class="tarot-deck__cards">
        <TarotCard
          v-for="(card, index) in selectedDeck.cards"
          :key="index"
          :title="card.title"
          :content="card.content"
          :image="getZodiacImage(card.title)"
          :is-flipped="card.isFlipped"
          :ref="(el) => (cardRefs[index] = el)"
        />
      </div>
    </div>
    <div class="tarot-deck__sections">
      <div
        v-for="(deck, deckIndex) in cardDecks"
        :key="deckIndex"
        class="tarot-deck__section"
        :class="{ 'is-selected': selectedDeckIndex === deckIndex }"
        @click="selectDeck(deckIndex)"
      >
        <img class="tarot-deck__section-image" src="/img/about.png" alt="" />
        <div class="tarot-deck__section-title">{{ deck.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { useTarotDeck } from '~/composables/useTarotDeck';
  const { $gsap } = useNuxtApp();

  const props = defineProps({
    natalResult: String,
  });

  const {
    cardRefs,
    cardDecks,
    selectedDeckIndex,
    selectedDeck,
    parseResultToCards,
    getZodiacImage,
    selectDeck: selectDeckFn,
    dealCard,
    cleanTitle,
  } = useTarotDeck();

  const selectDeck = (deckIndex) => {
    selectDeckFn(deckIndex, $gsap);
  };

  // Инициализация колоды
  onMounted(() => {
    cardDecks.value = parseResultToCards(props.natalResult);
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .tarot-deck {
    position: relative;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .tarot-deck__selected {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tarot-deck__title {
    font-size: 2rem;
    color: $softOrange;
    margin-bottom: 1rem;
    text-align: center;
  }

  .tarot-deck__cards {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  .tarot-deck__sections {
    position: fixed;
    bottom: -110px;
    left: 0;
    width: 100%;
    height: 36vh;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 2rem;
    transform-origin: bottom center;
    transform: perspective(1000px) rotateX(30deg);
  }

  .tarot-deck__section {
    width: 280px;
    height: 480px;
    margin: 0 1rem;
    background: $blackBlue;
    border-radius: 15px;
    cursor: pointer;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
    transform-origin: bottom center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6) 0%, transparent 100%);
      border-radius: 15px;
      pointer-events: none;
    }

    &:hover {
      transform: translateY(-20px);
    }

    &.is-selected {
      transform: translateY(-20px);
      box-shadow: 0 0 30px rgba(255, 165, 0, 0.5);
    }
  }

  .tarot-deck__section-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 1;
  }

  .tarot-deck__section-title {
    position: absolute;
    z-index: 10;
    top: 7%;
    left: 50%;
    width: 80%;
    color: $softOrange;
    font-size: 2.2rem;
    transform: rotateX(-30deg) translateX(-50%);
  }
</style>
