<template>
  <div class="compatibility-cards">
    <ResultSubheading title="Совместимость" />
    <div class="compatibility-cards__grid">
      <NuxtLink
        v-for="match in items"
        :key="match.archetypeId"
        class="compatibility-cards__card"
        :to="`/personality-result?archetypeId=${encodeURIComponent(match.archetypeId)}`"
      >
        <p class="compatibility-cards__name">
          {{ match.archetype }}
          <span class="compatibility-cards__sign">({{ getZodiacSign(match.archetypeId) }})</span>
        </p>
        <p class="compatibility-cards__why">{{ match.why }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ARCHETYPE_META } from '~/constants/archetypeMeta';
  import type { CompatibilityMatch } from '~/types/personality';

  defineProps<{
    items: CompatibilityMatch[];
  }>();

  function getZodiacSign(archetypeId: string): string {
    return ARCHETYPE_META[archetypeId]?.zodiacSign ?? '';
  }
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .compatibility-cards__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    @mixin desktop {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .compatibility-cards__card {
    display: block;
    padding: 1.2rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(233, 168, 124, 0.25);
    background: rgba(233, 168, 124, 0.06);
    text-decoration: none;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .compatibility-cards__card:hover {
    border-color: $softOrangeTrans;
    background: rgba(233, 168, 124, 0.12);
  }

  .compatibility-cards__name {
    margin: 0 0 0.6rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .compatibility-cards__sign {
    font-weight: 400;
    color: $gray;
  }

  .compatibility-cards__why {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.5;
    color: $primaryWhite;
  }
</style>
