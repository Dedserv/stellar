<template>
  <div class="tarot-deck">
    <div v-if="selectedDeck || $isMobile" class="tarot-deck__selected">
      <h2 class="tarot-deck__title">
        {{ $isMobile ? 'Ваша натальная карта' : selectedDeck?.title }}
      </h2>
      <div v-if="!$isMobile" class="tarot-deck__cards" ref="cards">
        <TarotCard
          v-for="(card, index) in $isMobile ? allCards : selectedDeck?.cards"
          :ref="(el) => (cardRefs[index] = el)"
          :id="index"
          :key="index"
          :title="card.title"
          :content="card.content"
          :image="getZodiacImage(card.title)"
          :is-flipped="card.isFlipped"
          :category="card.category || selectedDeck?.title"
        />
      </div>
      <VSlider v-else @slide-change="cardChange">
        <swiper-slide
          v-for="(card, index) in $isMobile ? allCards : selectedDeck?.cards"
          :key="`slide_${index + uId}`"
          :class="{ 'tarot-deck__cards--mobile': $isMobile }"
        >
          <TarotCard
            :ref="(el) => (cardRefs[index] = el)"
            :title="card.title"
            :content="card.content"
            :image="getZodiacImage(card.title)"
            :is-flipped="card.isFlipped"
            :category="card.category || selectedDeck?.title"
          />
        </swiper-slide>
      </VSlider>
    </div>
    <div
      v-if="!$isMobile"
      class="tarot-deck__sections"
      :class="{ 'tarot-deck__sections--bottom': selectedDeck }"
    >
      <div
        v-for="(deck, deckIndex) in cardDecks"
        :key="deckIndex"
        class="tarot-deck__section"
        :class="{ 'is-selected': selectedDeckIndex === deckIndex }"
        @click="selectDeck(deckIndex)"
      >
        <img class="tarot-deck__section-image" src="/img/cards/bg-card.png" alt="" />
        <div class="tarot-deck__section-title">{{ deck.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { uid } from 'uid';
  const uId = uid();
  import { useTarotDeck } from '~/composables/useTarotDeck';
  const { $gsap } = useNuxtApp();

  const props = defineProps({
    natalResult: {
      type: Array,
      required: true,
    },
  });

  const {
    cardRefs,
    cardDecks,
    selectedDeckIndex,
    selectedDeck,
    getZodiacImage,
    selectDeck: selectDeckFn,
  } = useTarotDeck();

  const allCards = ref([]);

  const selectDeck = (deckIndex) => {
    selectDeckFn(deckIndex, $gsap);
  };

  const emit = defineEmits(['cardChange']);

  const cardChange = (e) => emit('cardChange', e);

  const cards = ref(null);

  const { $isMobile } = useNuxtApp();

  // Инициализация колоды
  onMounted(() => {
    cardDecks.value = props.natalResult;

    // Собираем все карты для мобильной версии
    allCards.value = cardDecks.value.reduce((acc, deck) => [...acc, ...deck.cards], []);

    // Анимация для мобильной версии
    // if ($isMobile.value) {
    //   nextTick(() => {
    //     [...cards.value?.children].forEach((card, index) => {
    //       if (card) {
    //         $gsap.fromTo(
    //           card,
    //           {
    //             opacity: 0,
    //             x: 100,
    //             scale: 0.8,
    //           },
    //           {
    //             opacity: 1,
    //             x: 0,
    //             scale: 1,
    //             duration: 0.6,
    //             delay: index * 0.2,
    //             ease: 'power2.out',
    //           }
    //         );
    //       }
    //     });
    //   });
    // }
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .tarot-deck {
    position: relative;
    width: 100%;
    height: 100dvh;
    display: flex;
    flex-direction: column;

    @mixin desktop {
      width: calc(100vw - 3.2rem);
    }
  }

  .tarot-deck__selected {
    position: absolute;
    top: 8rem;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .tarot-deck__title {
    font-size: 2.2rem;
    color: $softOrange;
    margin: 0;
    margin-bottom: 1.8rem;
    text-align: center;

    @mixin tablet {
      font-size: 2rem;
      margin-bottom: 0;
    }
  }

  .tarot-deck__cards {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;

    &--mobile {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 16px;
      padding: 0 16px;
      min-height: 70dvh;
      height: 80%;
      max-height: 880px;
      width: 100%;
      max-width: calc(360px + 10vw);

      &::-webkit-scrollbar {
        display: none;
      }

      .tarot-card {
        scroll-snap-align: center;
        margin: 0 auto;
      }
    }
  }

  .tarot-deck__sections {
    position: fixed;
    bottom: 50%;
    left: 0;
    width: 100%;
    height: 412px;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 2rem;
    transform-origin: bottom center;
    transform: perspective(6000px) rotateX(30deg) translateY(50%);
    will-change: transform;
    transition:
      transform 0.6s ease,
      bottom 0.6s ease;

    &--bottom {
      bottom: -110px;
      transform: perspective(1000px) rotateX(30deg) translateY(0);
    }
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
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.6;
  }

  .tarot-deck__section-title {
    position: absolute;
    z-index: 10;
    top: 7%;
    left: 50%;
    width: 82%;
    color: $softOrange;
    font-size: 2.2rem;
    transform: rotateX(-30deg) translateX(-50%);
  }
</style>
