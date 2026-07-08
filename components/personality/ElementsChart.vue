<template>
  <div class="elements-chart">
    <p class="elements-chart__hint">12 ответов + бонус знака · макс. {{ maxScore }} баллов на стихию</p>
    <div v-for="item in rows" :key="item.key" class="elements-chart__row">
      <div class="elements-chart__header">
        <span class="elements-chart__label">{{ item.emoji }} {{ item.name }}</span>
        <span class="elements-chart__score">{{ item.score }}/{{ maxScore }}</span>
      </div>
      <div class="elements-chart__bar">
        <div
          class="elements-chart__fill"
          :style="{ width: `${(item.score / maxScore) * 100}%`, background: item.color }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { ElementScores } from '~/types/personality';

  const props = defineProps<{
    elements: ElementScores;
    maxScore?: number;
  }>();

  const maxScore = computed(() => props.maxScore ?? 14);

  const rows = computed(() => [
    {
      key: 'fire',
      name: 'Огонь',
      emoji: '🔥',
      score: props.elements.fire,
      color: 'linear-gradient(90deg, #f97316, #fbbf24)',
    },
    {
      key: 'earth',
      name: 'Земля',
      emoji: '🌿',
      score: props.elements.earth,
      color: 'linear-gradient(90deg, #65a30d, #a3e635)',
    },
    {
      key: 'air',
      name: 'Воздух',
      emoji: '💨',
      score: props.elements.air,
      color: 'linear-gradient(90deg, #7c3aed, #c4b5fd)',
    },
    {
      key: 'water',
      name: 'Вода',
      emoji: '🌊',
      score: props.elements.water,
      color: 'linear-gradient(90deg, #2563eb, #93c5fd)',
    },
  ]);
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .elements-chart {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
  }

  .elements-chart__hint {
    margin: 0 0 0.4rem;
    font-size: 1.1rem;
    color: $gray;
    line-height: 1.4;
  }

  .elements-chart__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.6rem;
    font-size: 1.3rem;
    color: $lightGrayOrange;
  }

  .elements-chart__bar {
    height: 0.8rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .elements-chart__fill {
    height: 100%;
    border-radius: inherit;
    transition: width 0.6s ease;
  }
</style>
