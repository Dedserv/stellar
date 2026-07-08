<template>
  <section class="archetype-hero">
    <HoroCircle compact />
    <div class="archetype-hero__content">
      <p class="archetype-hero__eyebrow">★ Ваш архетип ★</p>
      <h1 class="archetype-hero__title">{{ result.archetype }}</h1>
      <p class="archetype-hero__meta">
        <template v-if="formattedBirthDate">{{ result.zodiacSign }} · {{ formattedBirthDate }}</template>
        <template v-else>{{ result.zodiacSign }}</template>
      </p>
      <div class="archetype-hero__badges">
        <span class="archetype-hero__badge archetype-hero__badge--element">
          {{ elementEmoji }} {{ result.element.name }}
        </span>
        <span class="archetype-hero__badge">{{ result.modality }}</span>
      </div>
      <ChartShareButton
        :label="shareLabel"
        :live-message="shareLiveMessage"
        @share="$emit('share')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { PersonalityTestResponse } from '~/types/personality';

  const props = defineProps<{
    result: PersonalityTestResponse;
    formattedBirthDate: string;
    shareLabel?: string;
    shareLiveMessage?: string;
  }>();

  defineEmits<{ share: [] }>();

  const elementEmoji = computed(() => {
    const map: Record<string, string> = {
      Огонь: '🔥',
      Земля: '🌿',
      Воздух: '💨',
      Вода: '🌊',
    };
    return map[props.result.element.name] ?? '✨';
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .archetype-hero {
    position: relative;
    overflow: hidden;
    margin-bottom: 2.4rem;
    padding: 3.2rem 1.6rem 2.4rem;
    border-radius: 0.8rem;
    background: linear-gradient(180deg, rgba(20, 21, 32, 0.9), rgba(33, 36, 41, 0.6));
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .archetype-hero__content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.2rem;
    text-align: center;
  }

  .archetype-hero__eyebrow {
    margin: 0;
    font-size: 1.2rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $softOrange;
  }

  .archetype-hero__title {
    margin: 0;
    font-size: 3.6rem;
    line-height: 1.1;
    font-weight: 600;
    background: linear-gradient(135deg, $primaryWhite 0%, $lightGrayOrange 45%, $softOrange 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .archetype-hero__meta {
    margin: 0;
    font-size: 1.5rem;
    color: $gray;
  }

  .archetype-hero__badges {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
  }

  .archetype-hero__badge {
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: $lightGrayOrange;
    font-size: 1.2rem;

    &--element {
      border-color: $softOrangeTrans;
      background: rgba(233, 168, 124, 0.1);
      color: $softOrange;
    }
  }
</style>
