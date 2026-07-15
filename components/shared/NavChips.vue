<template>
  <nav class="nav-chips" :aria-label="ariaLabel">
    <div class="container">
      <ul class="nav-chips__list">
        <li v-for="chip in chips" :key="chip.id" class="nav-chips__item">
          <button
            type="button"
            class="nav-chips__chip"
            :class="{
              'nav-chips__chip--active': activeSection === chip.id,
              'nav-chips__chip--paid': chip.paid,
            }"
            :aria-current="activeSection === chip.id ? 'location' : undefined"
            @click="onNavigate(chip.id)"
          >
            {{ chip.label }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
  export interface NavChipItem {
    id: string;
    label: string;
    paid?: boolean;
  }

  withDefaults(
    defineProps<{
      chips: NavChipItem[];
      activeSection?: string;
      ariaLabel?: string;
    }>(),
    {
      activeSection: '',
      ariaLabel: 'Навигация по разделам',
    }
  );

  const emit = defineEmits<{ navigate: [id: string] }>();

  function onNavigate(id: string) {
    emit('navigate', id);
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .nav-chips {
    position: sticky;
    top: 8rem;
    z-index: 9;
    margin-bottom: 2.4rem;
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    @mixin tablet {
      margin-left: 0;
      margin-right: 0;
    }
  }

  .nav-chips__list {
    display: flex;
    justify-content: flex-start;
    gap: 0.8rem;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }

    @mixin tablet {
      justify-content: center;
    }
  }

  .nav-chips__item {
    flex: 0 0 auto;
  }

  .nav-chips__chip {
    position: relative;
    display: block;
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
      color 0.25s ease,
      border-color 0.25s ease,
      background-color 0.25s ease;

    &:hover {
      color: $lightGrayOrange;
      border-color: $softOrangeTrans;
      background: rgba(233, 168, 124, 0.12);
    }

    &--active {
      color: $lightGrayOrange;
      border-color: $softOrangeTrans;
      background: rgba(233, 168, 124, 0.12);
    }

    &--paid::after {
      content: '';
      position: absolute;
      top: 0.55rem;
      right: 0.55rem;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: $softPurple;
    }
  }
</style>
