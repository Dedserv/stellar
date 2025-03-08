<template>
  <div class="select">
    <input
      class="select-input"
      :class="isLoading ? 'select-input--loading' : ''"
      :placeholder="placeholder"
      name="address"
      v-model="address"
      @input="onSearch"
    />
    <Transition>
      <UseIcon
        v-show="address.length > 2"
        class="select-input__icon"
        name="close"
        :width="2"
        :height="2"
        @click="clearInput"
      />
    </Transition>
    <TransitionGroup
      v-show="suggestions.length && isShowSuggestion"
      class="select-input__options"
      tag="ul"
      name="fade"
      mode="out-in"
    >
      <li
        v-for="(item, index) in suggestions"
        class="select-input__option"
        :key="`suggestion_${index}`"
        :value="item.value"
        @click="onOptionClick(item)"
      >
        {{ item.label }}
      </li>
    </TransitionGroup>
  </div>
</template>

<script setup>
  defineProps({
    placeholder: {
      type: String,
      default: 'Выберите адрес',
    },

    modelValue: {
      type: String,
      default: '',
    },
  });

  const isMobile = useMediaQuery('(max-width: 767px)');
  const address = ref('');
  const suggestions = ref([]);
  const emit = defineEmits(['update:modelValue']);

  const isShowSuggestion = ref(false);

  const fetchSuggestions = useDebounceFn(async (text) => {
    if (!text || text.length < 3) {
      suggestions.value = [];
      isShowSuggestion.value = false;
      return;
    }

    try {
      isLoading.value = true;

      const { results } = await $fetch('/api/suggest', {
        query: {
          text: text,
        },
      });

      suggestions.value =
        results.map((item) => ({
          label: item.title.text,
          value: item.title.text,
        })) || [];

      isLoading.value = false;
    } catch (error) {
      console.error('Ошибка поиска адресов:', error);
      suggestions.value = [];
    }
  }, 300);

  const isLoading = ref(false);
  const isOptionSelected = ref(false);

  const onSearch = async (e) => {
    if (isMobile.value && !isOptionSelected.value) {
      address.value = e.target.value;
    }
    await fetchSuggestions(address.value);
    isShowSuggestion.value = !isOptionSelected.value ? true : false;
  };

  const onOptionClick = (item) => {
    isOptionSelected.value = true;
    address.value = item.value;
    emit('update:modelValue', item.value);
    isShowSuggestion.value = false;
  };

  const clearInput = async () => {
    isOptionSelected.value = false;
    address.value = '';
    await fetchSuggestions(address.value);
    emit('update:modelValue', '');
    isShowSuggestion.value = false;
  };
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .select {
    position: relative;
  }

  .select-input {
    position: relative;
    z-index: 1;
    background-color: $darkGrayBlue !important;
    border: 1px solid $orangeMuted;
    border-radius: 0.8rem;
    padding: 1.6rem 1.8rem;
    outline: none;
    color: $grayDark;
    overflow: hidden !important;
    transition: all 0.3s ease;

    &--loading {
      animation: rotate-border 1s linear infinite alternate;

      &:not(.select-input--loading) {
        animation: rotate-border 2s linear forwards;
      }
    }

    @keyframes rotate-border {
      0% {
        border-color: $darkOrange;
      }
      100% {
        border-color: $softOrange;
      }
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-text-fill-color: $grayDark !important;
      -webkit-background-clip: text;
      background-color: $darkGrayBlue !important;
      box-shadow: inset 0 0 0 1000px $darkGrayBlue;
      border-radius: 0.8rem;
      caret-color: $grayDark !important;
    }

    &:focus {
      color: $lightGrayOrange;
      border-color: $softOrange;
    }

    &__icon {
      position: absolute;
      top: 50%;
      right: 0;
      z-index: 2;
      transform: translate(-50%, -50%);
      color: $softOrange;
      padding: 0.4rem;
      cursor: pointer;
    }

    &__options {
      position: absolute;
      z-index: 0;
      background-color: $darkGrayBlue;
      color: $lightGrayOrange;
      top: 4.2rem;
      left: 0;
      right: 0;
      padding: 2rem 0 1.6rem;
      max-height: 20rem;
      overflow-y: auto;
      border-radius: 0 0 1.6rem 1.6rem;
      font-size: 1.4rem;
      line-height: 1.4;

      @mixin custom-scroll;
    }

    &__option {
      cursor: pointer;
      transition: background-color 0.2s ease;
      background-color: inherit;
      padding: 0 1.6rem;

      &:hover {
        background-color: $blueBlack;
      }
    }

    &__loading {
      position: absolute;
      z-index: 10;
      top: 0%;
      right: 10%;
      transform: translate(-50%, 50%);
    }
  }
</style>
