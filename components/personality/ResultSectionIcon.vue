<template>
  <svg class="result-icon" viewBox="0 0 24 24" aria-hidden="true">
    <template v-if="name === 'user'">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </template>
    <template v-else-if="name === 'crystal'">
      <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
    </template>
    <template v-else-if="name === 'star'">
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      />
    </template>
    <template v-else-if="name === 'check'">
      <polyline points="20 6 9 17 4 12" />
    </template>
    <template v-else-if="name === 'heart'">
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
      />
    </template>
    <template v-else-if="name === 'briefcase'">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </template>
    <template v-else-if="name === 'chart'">
      <path d="M12 20V10" />
      <path d="M18 20V4" />
      <path d="M6 20v-4" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </template>
    <template v-else-if="name === 'people'">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </template>
    <template v-else-if="name === 'share'">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </template>
    <template v-else-if="name === 'growth'">
      <path d="M12 22V8" />
      <path d="M5 12l7-7 7 7" />
      <path d="M5 19h14" />
    </template>
    <template v-else-if="name === 'zap'">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </template>
    <template v-else-if="name === 'compass'">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </template>
  </svg>
</template>

<script lang="ts">
  export type ResultIconName =
    | 'user'
    | 'crystal'
    | 'star'
    | 'check'
    | 'heart'
    | 'briefcase'
    | 'chart'
    | 'clock'
    | 'people'
    | 'share'
    | 'growth'
    | 'zap'
    | 'compass';
</script>

<script setup lang="ts">
  defineProps<{
    name: ResultIconName;
  }>();
</script>

<style scoped>
  .result-icon {
    width: 1.8rem;
    height: 1.8rem;
    stroke: currentColor;
    fill: none;
    stroke-width: 1.6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
