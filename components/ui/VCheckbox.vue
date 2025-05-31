<template>
  <label :class="['v-checkbox', classList]" role="checkbox" :aria-checked="isChecked">
    <span class="v-checkbox__input" :class="{ 'v-checkbox__input--native': native }">
      <input
        v-model="proxyModel"
        :type="type"
        :name="name"
        :value="trueValue"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </span>

    <div class="v-checkbox__label">
      <slot />
    </div>
  </label>
</template>

<script setup>
  const props = defineProps({
    modelValue: {
      type: [Array, String, Number, Boolean],
      required: true,
    },
    type: {
      type: String,
      default: 'checkbox',
      validator: (value) => ['checkbox', 'radio'].includes(value),
    },
    trueValue: {
      type: [String, Number, Boolean],
      default: true,
    },
    falseValue: {
      type: [String, Number, Boolean],
      default: false,
    },
    name: String,
    native: {
      type: Boolean,
      default: true,
    },
    size: String,
    color: String,
  });

  const emit = defineEmits(['update:modelValue']);

  const isFocused = ref(false);

  const isRadio = computed(() => props.type === 'radio');

  const proxyModel = computed({
    get() {
      if (isRadio.value) {
        return props.modelValue === props.trueValue;
      } else {
        if (Array.isArray(props.modelValue)) {
          return props.modelValue.includes(props.trueValue);
        } else {
          return props.modelValue === props.trueValue;
        }
      }
    },
    set(value) {
      if (isRadio.value) {
        value && emit('update:modelValue', props.trueValue);
      } else {
        if (Array.isArray(props.modelValue)) {
          const newArray = [...props.modelValue];
          const index = newArray.indexOf(props.trueValue);
          if (value && index === -1) {
            newArray.push(props.trueValue);
          } else if (!value && index !== -1) {
            newArray.splice(index, 1);
          }
          emit('update:modelValue', newArray);
        } else {
          emit('update:modelValue', value ? props.trueValue : props.falseValue);
        }
      }
    },
  });

  const isChecked = computed(() => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.includes(props.trueValue);
    }
    return props.modelValue === props.trueValue;
  });

  const classList = computed(() => [
    props.color ? `v-checkbox--${props.color}` : 'v-checkbox--blue',
    props.size ? `v-checkbox--${props.size}` : 'v-checkbox--medium',
    {
      'v-checkbox--native': props.native,
      'v-checkbox--checked': isChecked.value,
      'v-checkbox--focused': isFocused.value,
    },
  ]);
</script>
<style scoped>
  .v-checkbox {
    color: aliceblue;
    display: inline-flex;
    align-items: center;
    user-select: none;
    outline: none;
    cursor: pointer;
    flex: 1 1;
    opacity: 1;
    outline: 1px solid transparent;
    transition: all 0.3s ease;
    border-radius: 1.2rem;
    border: 1px solid transparent;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      opacity: 0.8;
    }

    &__input {
      display: block;
      position: relative;
      flex-shrink: 0;
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 2px;
      transition: background-color 0.2s ease;

      &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 1rem;
        height: 1rem;
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
        opacity: 0;
        transform: translate(-50%, -50%) scale(0);
        transition:
          opacity 0.3s ease,
          transform 0.3s ease;
      }

      &--native {
        display: none;
      }
    }

    &__label {
      text-align: center;
    }

    &--checked {
      filter: drop-shadow(0 4px 6px #bcbcbc80);

      :deep(.card__icon) {
        opacity: 1;
      }
    }
  }
</style>
