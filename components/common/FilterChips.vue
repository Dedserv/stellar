<template>
  <div class="filter-chips">
    <p v-if="label" class="filter-chips__label">{{ label }}</p>
    <div
      class="filter-chips__group"
      role="group"
      :aria-label="ariaLabel"
    >
      <div class="filter-chips__list">
        <template v-if="toggle">
          <button
            type="button"
            class="filter-chips__chip"
            :class="{ 'filter-chips__chip--active': modelValue }"
            :aria-pressed="modelValue ? 'true' : 'false'"
            @click="onToggle"
          >
            {{ toggleLabel }}
          </button>
        </template>
        <template v-else>
          <button
            v-for="option in options"
            :key="option.value || '__all__'"
            type="button"
            class="filter-chips__chip"
            :class="{ 'filter-chips__chip--active': modelValue === option.value }"
            :name="name"
            :aria-pressed="modelValue === option.value ? 'true' : 'false'"
            @click="onSelect(option.value)"
          >
            {{ option.label }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface FilterChipOption {
  value: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    modelValue: string | boolean;
    options?: FilterChipOption[];
    ariaLabel: string;
    name?: string;
    label?: string;
    toggle?: boolean;
    toggleLabel?: string;
  }>(),
  {
    options: () => [],
    name: undefined,
    label: undefined,
    toggle: false,
    toggleLabel: '',
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | boolean): void;
}>();

function onSelect(value: string) {
  emit('update:modelValue', value);
}

function onToggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<style scoped>
@import '~/assets/css/variables.css';

.filter-chips {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  contain: inline-size;
}

.filter-chips__label {
  margin: 0;
  font-size: 1.1rem;
  color: $gray;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-chips__group {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @mixin desktop {
    overflow-x: visible;
  }
}

.filter-chips__list {
  display: inline-flex;
  flex-wrap: nowrap;
  gap: 0.8rem;
  width: max-content;
  max-width: none;
  min-width: min(100%, max-content);

  &::-webkit-scrollbar {
    display: none;
  }

  @mixin desktop {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    max-width: 100%;
  }
}

.filter-chips__chip {
  flex: 0 0 auto;
  margin: 0;
  padding: 0.8rem 1.4rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  background: $darkGrayBlue;
  color: $gray;
  font-family: inherit;
  font-size: 1.3rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    color: $lightGrayOrange;
  }

  &--active {
    color: $lightGrayOrange;
    border-color: $softOrangeTrans;
    background: rgba(233, 168, 124, 0.12);
  }
}
</style>
