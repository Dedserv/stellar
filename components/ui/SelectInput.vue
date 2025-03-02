<template>
  <VueSelect
    v-model="address"
    class="select-input"
    :options="suggestions"
    :filterable="false"
    :placeholder="placeholder"
    @search="onSearch"
    @option-selected="isSelectedOption = true"
  >
    <template #no-options>
      <div class="no-options">Ничего не найдено</div>
    </template>
  </VueSelect>
</template>

<script setup>
  import VueSelect from 'vue3-select-component';

  defineProps({
    placeholder: {
      type: String,
      default: 'Выберите адрес',
    },
  });

  const address = ref('');
  const suggestions = ref([]);

  const isSelectedOption = ref(false);

  const fetchSuggestions = useDebounceFn(async (query) => {
    if (isSelectedOption.value) {
      return;
    }

    if (!query || query.length < 3) {
      suggestions.value = [];
      return;
    }

    try {
      const { results } = await $fetch('/api/suggest', {
        query: {
          text: query,
        },
      });

      suggestions.value =
        results.map((item) => ({
          label: item.title.text,
          value: item.title.text,
        })) || [];
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      suggestions.value = [];
    }
  }, 300);

  const onSearch = async (query) => {
    await fetchSuggestions(query);
    isSelectedOption.value = false;
  };
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .select-input {
    @mixin tablet {
      width: 100%;
    }

    @mixin desktop {
      width: 50%;
    }
  }

  :deep(.vue-select) {
    --vs-menu-offset-top: 2;
  }

  :deep(#vue-select-1-listbox) {
    &::-webkit-scrollbar {
      width: 4px; /* Ширина вертикальной полосы */
      height: 2px; /* Ширина горизонтальной полосы */
    }

    &::-webkit-scrollbar-track {
      margin: 8px 0;
      background: transparent; /* Прозрачный фон трека */
    }

    &::-webkit-scrollbar-thumb {
      background: $greyMiddle; /* Цвет бегунка */
      border-radius: 2px; /* Скругление углов */
    }

    &::-webkit-scrollbar-thumb:hover {
      background: $grayDark; /* Цвет бегунка при наведении */
    }

    /* Для Firefox */
    &* {
      scrollbar-width: thin; /* Автоматическая тонкая полоса */
      scrollbar-color: $greyMiddle transparent; /* Цвет бегунка и трека */
    }
  }
</style>
