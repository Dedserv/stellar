<template>
  <div class="roles-grid">
    <ResultSubheading title="Идеальные роли" />
    <div class="roles-grid__list">
      <div v-for="role in roles" :key="role.role" class="roles-grid__item">
        <p class="roles-grid__role">{{ role.role }}</p>
        <p class="roles-grid__why">{{ role.why }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IdealRole } from '~/types/personality';

  defineProps<{
    roles: IdealRole[];
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .roles-grid__list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @mixin desktop {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .roles-grid__item {
    padding: 1.2rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
  }

  .roles-grid__role {
    margin: 0 0 0.5rem;
    font-size: 1.35rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .roles-grid__why {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.5;
    color: $gray;
  }
</style>
