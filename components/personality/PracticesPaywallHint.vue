<template>
  <div class="practices-hint">
    <div class="practices-hint__divider" aria-hidden="true" />

    <div class="practices-hint__body">
      <div class="practices-hint__heading">
        <span class="practices-hint__lock" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <h4 class="practices-hint__title">Практическая часть</h4>
      </div>
      <p class="practices-hint__subtitle">Как усилить и проявить эти дары в жизни</p>
      <button
        type="button"
        class="practices-hint__cta layout-upper"
        @click="$emit('unlock-hint')"
      >
        Открыть практики · 299&nbsp;₽
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineEmits<{ 'unlock-hint': [] }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .practices-hint {
    margin-top: 2.4rem;
  }

  .practices-hint__divider {
    width: calc(100% - 4.8rem);
    max-width: 100%;
    height: 0;
    margin: 0 auto 2.4rem;
    border-top: 1px dashed rgba(233, 168, 124, 0.25);
  }

  .practices-hint__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
  }

  .practices-hint__heading {
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  .practices-hint__lock {
    display: flex;
    color: rgba(233, 168, 124, 0.7);
  }

  .practices-hint__lock svg {
    stroke: currentColor;
    fill: none;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .practices-hint__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 500;
    color: $softOrange;
  }

  .practices-hint__subtitle {
    margin: 0 0 0.8rem;
    font-size: 1.3rem;
    line-height: 1.4;
    color: rgba(240, 236, 228, 0.6);
  }

  .practices-hint__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 1.4rem 2.8rem;
    border: none;
    border-radius: 2.4rem;
    background: linear-gradient(135deg, $softOrange, #d4956a);
    color: $blackBlue;
    font-family: inherit;
    font-size: 1.5rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(233, 168, 124, 0.2);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  .practices-hint__cta:hover {
    transform: scale(1.03);
    box-shadow: 0 6px 28px rgba(233, 168, 124, 0.35);
  }

  @media (prefers-reduced-motion: reduce) {
    .practices-hint__cta {
      transition: none;
    }

    .practices-hint__cta:hover {
      transform: none;
    }
  }
</style>
