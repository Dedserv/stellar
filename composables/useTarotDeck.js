import { ref, computed } from 'vue';

export const useTarotDeck = () => {
  const cardRefs = ref([]);
  const cardDecks = ref([]);
  const selectedDeckIndex = ref(null);
  const selectedDeck = computed(() =>
    selectedDeckIndex.value !== null ? cardDecks.value[selectedDeckIndex.value] : null
  );

  // Разбиваем текст на части по ~680 символов
  const splitContent = (content) => {
    // Сначала обработаем текст между ^ и сделаем его жирным
    content = content.replace(/\^(.*?)\^/g, '<b>$1</b>');

    const maxLength = 680;
    const parts = [];
    let currentPart = '';

    // Split by newlines first to preserve formatting
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // If adding this line would exceed maxLength
      if ((currentPart + line).length > maxLength) {
        // If we have content in currentPart, add it
        if (currentPart) {
          parts.push(currentPart.trim());
          currentPart = '';
        }

        // If single line is longer than maxLength, split it at **
        if (line.length > maxLength) {
          const segments = line.split('**');
          let tempSegment = '';

          for (let j = 0; j < segments.length; j++) {
            const segment = segments[j];
            if (j % 2 === 0) {
              // Regular text
              if ((tempSegment + segment).length > maxLength) {
                if (tempSegment) parts.push(tempSegment.trim());
                tempSegment = segment;
              } else {
                tempSegment += segment;
              }
            } else {
              // Bold text (between **)
              if ((tempSegment + '**' + segment + '**').length > maxLength) {
                if (tempSegment) parts.push(tempSegment.trim());
                tempSegment = '**' + segment + '**';
              } else {
                tempSegment += '**' + segment + '**';
              }
            }
          }

          if (tempSegment) {
            currentPart = tempSegment;
          }
        } else {
          currentPart = line;
        }
      } else {
        currentPart += (currentPart ? '\n' : '') + line;
      }
    }

    // Add any remaining content
    if (currentPart) {
      parts.push(currentPart.trim());
    }

    return parts;
  };

  // Парсим результат в карты
  const parseResultToCards = (text) => {
    const sections = text.split('*').filter(Boolean);
    const decks = [];

    sections.forEach((section) => {
      const [titlePart, ...contentSections] = section.trim().split('#');
      const title = titlePart
        .split(':')[0]
        .replace(/^\d+\.\s*/, '')
        .trim();

      const deck = {
        title,
        cards: [],
      };

      const fullContent = contentSections.join('\n').trim();
      const splitParts = splitContent(fullContent);

      splitParts.forEach((part) => {
        deck.cards.push({
          title,
          content: part.trim(),
          isFlipped: false,
        });
      });

      if (deck.cards.length > 0) {
        decks.push(deck);
      }
    });

    return decks;
  };

  // Получаем изображение для карты
  const getZodiacImage = (title) => {
    const zodiacMap = {
      'Основы натальной карты': 'fish.webp',
      'Анализ личности': 'aries.webp',
      Прогнозирование: 'scorpio.webp',
      Персонализация: 'leo.webp',
    };

    return zodiacMap[title] || 'scorpio.webp';
  };

  const selectDeck = (deckIndex, gsap) => {
    selectedDeckIndex.value = deckIndex;
    cardRefs.value = [];

    // Сбрасываем состояние карт
    cardDecks.value.forEach((deck) => {
      deck.cards.forEach((card) => (card.isFlipped = false));
    });

    // Анимируем карты
    nextTick(() => {
      if (selectedDeck.value) {
        selectedDeck.value.cards.forEach((_, index) => {
          setTimeout(() => dealCard(index, gsap), index * 200);
        });
      }
    });
  };

  // Анимация выдачи карты
  const dealCard = (index, gsap) => {
    const card = cardRefs.value[index];
    if (!card || !selectedDeck.value) return;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (index - selectedDeck.value.cards.length / 2) * 300;
    const offsetY = (index - selectedDeck.value.cards.length / 2) * 2;
    // const offsetX = (index - selectedDeck.value.cards.length / 2) * 300;
    // const offsetY = (index - selectedDeck.value.cards.length / 2) * 10;

    gsap.fromTo(
      card.$el,
      {
        x: centerX,
        y: centerY,
        scale: 0.5,
        opacity: 0,
        zIndex: 0,
      },
      {
        x: centerX + offsetX,
        y: centerY - 400 + offsetY,
        scale: 1,
        opacity: 1,
        zIndex: index,
        duration: 2,
        ease: 'power2.out',
        onComplete: () => {
          setTimeout(() => {
            if (selectedDeck.value) {
              selectedDeck.value.cards[index].isFlipped = true;
            }
          }, 500);
        },
      }
    );
  };

  return {
    cardRefs,
    cardDecks,
    selectedDeckIndex,
    selectedDeck,
    parseResultToCards,
    getZodiacImage,
    selectDeck,
    dealCard,
  };
};
