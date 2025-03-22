import { ref, computed } from 'vue';

export const useTarotDeck = () => {
  const cardRefs = ref([]);
  const cardDecks = ref([]);
  const selectedDeckIndex = ref(null);
  const selectedDeck = computed(() =>
    selectedDeckIndex.value !== null ? cardDecks.value[selectedDeckIndex.value] : null
  );

  // Очищаем заголовок от цифр и двоеточия
  const cleanTitle = (title) => {
    // Убираем цифры и точку в начале
    let cleaned = title.replace(/^\d+\.\s*/, '');
    // Убираем двоеточие в конце
    cleaned = cleaned.replace(/:$/, '');
    // Убираем лишние пробелы
    cleaned = cleaned.trim();
    return cleaned;
  };

  // Разбиваем текст на части по ~680 символов
  const splitContent = (content) => {
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
    const sections = text.split('###').filter(Boolean);
    const decks = [];
    let currentDeck = { title: '', cards: [] };
    let currentContent = '';

    sections.forEach((section) => {
      const lines = section.trim().split('\n');

      lines.forEach((line) => {
        if (line.match(/^\d\./)) {
          if (currentDeck.title && currentContent) {
            const contentParts = splitContent(currentContent);
            contentParts.forEach((part) => {
              currentDeck.cards.push({
                title: cleanTitle(currentDeck.title),
                content: part,
                isFlipped: false,
              });
            });
            currentContent = '';
          }

          if (currentDeck.cards.length > 0) {
            decks.push({ ...currentDeck });
          }

          currentDeck = {
            title: cleanTitle(line.trim()),
            cards: [],
          };
        } else if (line.trim()) {
          currentContent += line + '\n';
        }
      });
    });

    if (currentDeck.title && currentContent) {
      const contentParts = splitContent(currentContent);
      contentParts.forEach((part) => {
        currentDeck.cards.push({
          title: cleanTitle(currentDeck.title),
          content: part,
          isFlipped: false,
        });
      });
      decks.push(currentDeck);
    }

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
    const offsetY = (index - selectedDeck.value.cards.length / 2) * 10;

    gsap.fromTo(
      card.$el,
      {
        x: centerX,
        y: centerY,
        rotation: 0,
        scale: 0.5,
        opacity: 0,
        zIndex: 0,
      },
      {
        x: centerX + offsetX,
        y: centerY - 400 + offsetY,
        rotation: -2 + index,
        scale: 1,
        opacity: 1,
        zIndex: index,
        duration: 1,
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
