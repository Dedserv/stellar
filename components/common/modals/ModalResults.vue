<template>
  <div class="modal-results">
    <VButton
      class="modal-results__button"
      size="s"
      type="transparent"
      color="gray"
      @click="closeModalHandler"
    >
      <UseIcon class="modal-results__arrow" name="exit" :width="3.3" :height="2.4" />
      Выход
    </VButton>

    <NatalLoader v-if="!natalResult" />
    <TarotDeck v-else :natal-result="natalResult" />
  </div>
</template>

<script setup>
  const emit = defineEmits(['closeModal']);
  const props = defineProps({
    natalResult: {
      type: String,
      default: '',
    },
  });

  const parseNatalResult = (text) => {
    const sections = text
      .split('###')
      .filter(Boolean)
      .map((section) => {
        const [title, ...content] = section.trim().split('\n');
        const contentText = content.join('\n');

        // Определяем иконку на основе заголовка
        const getIcon = (title) => {
          const icons = {
            'Основы натальной карты': 'ph:planet-bold',
            'Анализ личности': 'mdi:account-details',
            Прогнозирование: 'mdi:crystal-ball',
            Персонализация: 'mdi:account-cog',
          };
          return icons[title.trim()] || 'mdi:star';
        };

        // Парсим подразделы
        const subsections = contentText
          .split('####')
          .filter(Boolean)
          .map((sub) => {
            if (sub.includes(':')) {
              const [subTitle, ...subContent] = sub.trim().split('\n');
              const items = subContent
                .join('\n')
                .split('-')
                .filter(Boolean)
                .map((item) => ({
                  text: item.trim(),
                  icon: 'mdi:chevron-right',
                }));

              return {
                title: subTitle.trim(),
                icon: 'mdi:subdirectory-arrow-right',
                items,
              };
            }
            return { text: sub.trim() };
          });

        return {
          title: title.trim(),
          icon: getIcon(title),
          subsections,
        };
      });

    return sections;
  };

  const parsedResult = computed(() => parseNatalResult(props.natalResult));

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
    padding-top: 50px;

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
