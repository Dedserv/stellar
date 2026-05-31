<template>
  <nav class="nav-chips" aria-label="Навигация по разделам карты">
    <div class="nav-chips__inner container">
      <ul class="nav-chips__list">
        <li v-for="chip in chips" :key="chip.id" class="nav-chips__item">
          <button
            type="button"
            class="nav-chips__chip"
            :class="{ 'nav-chips__chip--active': activeSection === chip.id }"
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

<script setup>
  const chips = [
    { id: 'portrait', label: 'Обзор' },
    { id: 'insights', label: 'Инсайты' },
    { id: 'planets', label: 'Планеты' },
    { id: 'aspects', label: 'Аспекты' },
  ];

  defineProps({
    activeSection: {
      type: String,
      default: 'portrait',
    },
  });

  const emit = defineEmits(['navigate']);

  function onNavigate(id) {
    emit('navigate', id);
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .nav-chips {
    position: sticky;
    top: 8.2rem;
    z-index: 9;
    margin: 0 -1.6rem 2.4rem;
    padding: 0.8rem 0;
    background: rgba($darkBlack, 0.92);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    @mixin tablet {
      margin-left: 0;
      margin-right: 0;
    }
  }

  .nav-chips__inner {
    padding-left: 1.6rem;
    padding-right: 1.6rem;

    @mixin desktop {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .nav-chips__list {
    display: flex;
    justify-content: center;
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
  }

  .nav-chips__item {
    flex: 0 0 auto;
  }

  .nav-chips__chip {
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
