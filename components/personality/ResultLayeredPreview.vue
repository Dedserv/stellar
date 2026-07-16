<template>
  <div class="layered-preview">
    <div class="layered-preview__summary">
      <slot />
      <div class="layered-preview__fade" aria-hidden="true" />
    </div>

    <div class="layered-preview__footer">
      <div class="layered-preview__divider" aria-hidden="true" />
      <p class="layered-preview__microcopy">{{ microcopy }}</p>
      <button
        type="button"
        class="layered-preview__cta"
        @click="$emit('unlock-hint')"
      >
        {{ ctaLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      microcopy?: string;
      ctaLabel?: string;
    }>(),
    {
      microcopy: 'Продолжение — в полном портрете',
      ctaLabel: 'Открыть портрет',
    }
  );

  defineEmits<{ 'unlock-hint': [] }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .layered-preview {
    position: relative;
  }

  .layered-preview__summary {
    position: relative;
    overflow: hidden;
    padding-bottom: 1.2rem;
  }

  .layered-preview__fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 10rem;
    pointer-events: none;
    background: linear-gradient(
      to top,
      $blackBlue 0%,
      rgba(20, 21, 32, 0.85) 35%,
      rgba(20, 21, 32, 0.4) 65%,
      transparent 100%
    );

    @mixin desktop {
      height: 12rem;
    }
  }

  .layered-preview__footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0.4rem 0 0.8rem;
    text-align: center;
  }

  .layered-preview__divider {
    width: 60%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(233, 168, 124, 0.55) 50%,
      transparent 100%
    );
  }

  .layered-preview__microcopy {
    margin: 0;
    font-size: 1.3rem;
    line-height: 1.4;
    color: rgba(240, 236, 228, 0.45);
  }

  .layered-preview__cta {
    padding: 0;
    border: none;
    background: none;
    font-family: inherit;
    font-size: 1.4rem;
    color: $softPurple;
    text-decoration: underline;
    cursor: pointer;
  }

  .layered-preview__cta:hover {
    color: $softOrange;
  }
</style>
