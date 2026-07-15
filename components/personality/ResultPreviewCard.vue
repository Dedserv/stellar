<template>
  <article class="preview-card" :class="{ 'preview-card--teaser': teaser }">
    <div v-if="icon" class="preview-card__icon" aria-hidden="true">
      <ResultSectionIcon :name="icon" />
    </div>
    <p v-if="label" class="preview-card__label">{{ label }}</p>
    <h3 class="preview-card__title">{{ title }}</h3>
    <p v-if="text" class="preview-card__text">{{ text }}</p>
    <ul v-if="list?.length" class="preview-card__list">
      <li v-for="(item, index) in list" :key="index">{{ item }}</li>
    </ul>
  </article>
</template>

<script setup lang="ts">
  import type { ResultIconName } from '~/components/personality/ResultSectionIcon.vue';

  withDefaults(
    defineProps<{
      label?: string;
      title: string;
      text?: string;
      list?: string[];
      icon?: ResultIconName;
      teaser?: boolean;
    }>(),
    {
      label: '',
      text: '',
      list: () => [],
      teaser: true,
    }
  );
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .preview-card {
    position: relative;
    padding: 2rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    overflow: hidden;
  }

  .preview-card--teaser::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(20, 21, 32, 0.95), transparent);
    pointer-events: none;
    border-radius: 0 0 0.8rem 0.8rem;
  }

  .preview-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    margin-bottom: 1.2rem;
    border-radius: 50%;
    background: rgba(233, 168, 124, 0.08);
    color: $softOrange;
  }

  .preview-card__label {
    margin: 0 0 0.4rem;
    font-size: 1.1rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: $softOrange;
  }

  .preview-card__title {
    margin: 0 0 0.8rem;
    font-size: 2rem;
    font-weight: 400;
    line-height: 1.2;
    color: $lightGrayOrange;
  }

  .preview-card__text {
    margin: 0;
    font-size: 1.4rem;
    line-height: 1.45;
    color: $gray;
  }

  .preview-card__list {
    margin: 1.2rem 0 0;
    padding: 0;
    list-style: none;
  }

  .preview-card__list li {
    position: relative;
    padding: 0.8rem 0 0.8rem 2rem;
    font-size: 1.2rem;
    color: $gray;
  }

  .preview-card__list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: $softOrange;
    opacity: 0.5;
    transform: translateY(-50%);
  }
</style>
