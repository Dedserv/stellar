<template>
  <span class="element-glyph" aria-hidden="true">
    <svg viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="15" class="glyph-circle" />

      <template v-if="element === 'fire'">
        <polygon points="18,8 11,22 25,22" class="glyph-shape" />
        <path d="M11 13 Q14 10.5 18 8 Q22 10.5 25 13" class="glyph-shape" />
      </template>

      <template v-else-if="element === 'earth'">
        <polygon points="18,25 11,11 25,11" class="glyph-shape" />
        <line x1="13" y1="18" x2="23" y2="18" class="glyph-shape" />
      </template>

      <template v-else-if="element === 'air'">
        <circle cx="13" cy="22" r="1.5" class="glyph-dot" />
        <circle cx="18" cy="18" r="1.5" class="glyph-dot" />
        <circle cx="23" cy="14" r="1.5" class="glyph-dot" />
      </template>

      <template v-else-if="element === 'water'">
        <path d="M11 16 Q18 11 25 16" class="glyph-shape" />
        <path d="M11 22 Q18 27 25 22" class="glyph-shape" />
      </template>
    </svg>
  </span>
</template>

<script setup lang="ts">
  import type { ElementKey } from '~/types/personality';

  defineProps<{
    element: ElementKey;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .element-glyph {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
  }

  .element-glyph svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .glyph-circle {
    fill: none;
    stroke: $color-glyph-gold;
    stroke-width: $glyph-stroke;
    opacity: $glyph-circle-opacity-rest;
    transition:
      opacity 0.2s ease,
      stroke-width 0.2s ease;
  }

  .glyph-shape {
    fill: none;
    stroke: $color-glyph-gold;
    stroke-width: $glyph-stroke;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .glyph-dot {
    fill: $color-glyph-gold;
  }
</style>
