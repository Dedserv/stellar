<template>
  <nav class="sticky-nav" aria-label="Навигация по разделам карты">
    <div class="sticky-nav__inner container">
      <ul class="sticky-nav__list">
        <li v-for="item in items" :key="item.id" class="sticky-nav__item">
          <button
            type="button"
            class="sticky-nav__btn"
            :class="{ 'sticky-nav__btn--active': activeId === item.id }"
            :aria-current="activeId === item.id ? 'location' : undefined"
            @click="onNavigate(item.id)"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
  const props = defineProps({
    items: {
      type: Array,
      required: true,
    },
    activeId: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['navigate']);

  function onNavigate(id) {
    emit('navigate', id);
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .sticky-nav {
    position: sticky;
    top: 8.2rem;
    z-index: 9;
    margin: 0 -1.6rem 2.4rem;
    padding: 0.8rem 0;
    background: rgba(13, 8, 4, 0.92);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(8px);

    @mixin tablet {
      margin-left: 0;
      margin-right: 0;
    }
  }

  .sticky-nav__inner {
    padding-left: 1.6rem;
    padding-right: 1.6rem;

    @mixin desktop {
      padding-left: 0;
      padding-right: 0;
    }
  }

  .sticky-nav__list {
    display: flex;
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

  .sticky-nav__item {
    flex: 0 0 auto;
  }

  .sticky-nav__btn {
    display: block;
    margin: 0;
    padding: 0.8rem 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    color: $gray;
    font-size: 1.3rem;
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    cursor: pointer;
    transition:
      color 0.2s ease,
      border-color 0.2s ease,
      background-color 0.2s ease;

    &:hover {
      color: $lightGrayOrange;
      border-color: rgba(233, 168, 124, 0.35);
    }

    &--active {
      color: $lightGrayOrange;
      border-color: $softOrangeTrans;
      background: rgba(233, 168, 124, 0.12);
    }
  }
</style>
