<template>
  <div ref="rootRef" class="elements-chart">
    <div v-for="(item, index) in rows" :key="item.key" class="elements-chart__row">
      <span class="elements-chart__label">{{ item.name }}</span>
      <div class="elements-chart__track">
        <div
          class="elements-chart__fill"
          :class="`elements-chart__fill--${item.key}`"
          :style="{
            width: animated ? `${(item.score / maxScore) * 100}%` : '0%',
            transitionDelay: animated ? `${index * 100}ms` : '0ms',
          }"
        />
      </div>
      <span class="elements-chart__value">{{ item.score }}</span>
    </div>
    <p class="elements-chart__total">
      {{ totalScore }} баллов · знак + ответы · макс. {{ maxScore }} на стихию
    </p>
  </div>
</template>

<script setup lang="ts">
  import type { ElementScores } from '~/types/personality';

  const props = defineProps<{
    elements: ElementScores;
    maxScore?: number;
  }>();

  const maxScore = computed(() => props.maxScore ?? 14);
  const animated = ref(false);
  const rootRef = ref<HTMLElement | null>(null);

  const rows = computed(() => [
    { key: 'fire', name: 'Огонь', score: props.elements.fire },
    { key: 'earth', name: 'Земля', score: props.elements.earth },
    { key: 'air', name: 'Воздух', score: props.elements.air },
    { key: 'water', name: 'Вода', score: props.elements.water },
  ]);

  const totalScore = computed(
    () =>
      props.elements.fire +
      props.elements.earth +
      props.elements.air +
      props.elements.water
  );

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!import.meta.client || !rootRef.value) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      animated.value = true;
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        animated.value = true;
        observer?.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(rootRef.value);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .elements-chart {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    padding: 1.6rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .elements-chart__row {
    display: grid;
    grid-template-columns: 7rem 1fr 3rem;
    align-items: center;
    gap: 0.8rem;
  }

  .elements-chart__label {
    font-size: 1.2rem;
    color: $gray;
    text-align: right;
  }

  .elements-chart__track {
    height: 0.8rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .elements-chart__fill {
    height: 100%;
    border-radius: inherit;
    width: 0;
    transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .elements-chart__fill--fire {
    background: linear-gradient(90deg, rgba(233, 168, 124, 0.6), $softOrange);
  }

  .elements-chart__fill--earth {
    background: linear-gradient(90deg, rgba(125, 108, 77, 0.6), #917f5a);
  }

  .elements-chart__fill--air {
    background: linear-gradient(90deg, rgba(179, 136, 255, 0.6), $softPurple);
  }

  .elements-chart__fill--water {
    background: linear-gradient(90deg, rgba(100, 160, 220, 0.6), #7eb8da);
  }

  .elements-chart__value {
    font-size: 1.2rem;
    color: $gray;
    text-align: left;
  }

  .elements-chart__total {
    margin: 0.4rem 0 0;
    font-size: 1.1rem;
    color: $grayDark;
  }

  @media (prefers-reduced-motion: reduce) {
    .elements-chart__fill {
      transition: none;
    }
  }
</style>
