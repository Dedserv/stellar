<template>
  <label
    ref="label"
    :class="['c-checkbox', classList]"
    role="checkbox"
    :aria-checked="isChecked"
    :aria-disabled="disabled"
  >
    <span class="c-checkbox__input" :class="`${props.native ? 'c-checkbox__input--native' : ''}`">
      <input
        v-model="modelValue"
        type="checkbox"
        :name="name"
        :value="modelValue"
        :true-value="trueValue"
        :false-value="falseValue"
        :disabled="disabled || readonly"
        :required="required"
        @keydown.enter.stop.prevent="$refs.label.click()"
        @focus="onFocus"
        @blur="onBlur"
      />
    </span>

    <div v-if="$slots.default" class="c-checkbox__label">
      <slot></slot>
    </div>
  </label>
</template>

<script setup>
  const props = defineProps({
    name: String,
    value: {
      type: [Array, String, Number, Boolean],
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
    trueValue: {
      type: [String, Number, Boolean],
      default: 'true',
    },
    falseValue: {
      type: [String, Number, Boolean],
      default: '',
    },
    native: {
      type: Boolean,
      default: true,
    },
    size: String,
    color: String,
    coloredLabel: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    required: Boolean,
  });

  const label = ref(null);
  const isFocused = ref(false);
  const modelValue = ref(props.value);

  const emit = defineEmits(['input']);

  watch(
    () => modelValue.value,
    (value) => emit('input', value)
  );

  const classList = computed(() => [
    props.color ? `c-checkbox--${props.color}` : 'c-checkbox--blue',
    props.size ? `c-checkbox--${props.size}` : 'c-checkbox--medium',
    {
      'c-checkbox--disabled': props.disabled,
      'c-checkbox--native': props.native,
      'c-checkbox--error': props.error && !isChecked.value,
      'c-checkbox--checked': isChecked.value,
      'c-checkbox--focused': isFocused.value,
      'is-colored-label': props.coloredLabel,
    },
  ]);

  const isChecked = computed(() => {
    if (Array.isArray(modelValue.value)) {
      return modelValue.value.includes(props.trueValue);
    } else {
      if (typeof modelValue.value === 'string') {
        return modelValue.value.toLowerCase() === props.trueValue.toString().toLowerCase();
      }
      return modelValue.value === props.trueValue;
    }
  });

  const onFocus = () => {
    isFocused.value = true;
  };

  const onBlur = () => {
    isFocused.value = false;
  };
</script>

<style scoped>
  .c-checkbox {
    color: aliceblue;
    display: inline-flex;
    align-items: center;
    user-select: none;
    outline: none;
    cursor: pointer;
    flex: 1 1;

    &__input {
      display: block;
      position: relative;
      flex-shrink: 0;
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 2px;
      transition:
        border-color 0.2s ease,
        background-color 0.2s ease;

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
      outline: 2px solid red;
    }
  }
</style>
