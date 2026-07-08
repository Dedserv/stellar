<template>
  <section class="paywall">
    <div class="paywall__icon">🔒</div>
    <p class="paywall__text">
      Полный портрет: сильные стороны с практиками,
      <br />
      зоны роста с планом действий,
      <br />
      любовь и совместимость, карьера и деньги,
      <br />
      ритуалы, конфликты, дружба и стиль решений —
      <br />
      8 глубоких блоков
    </p>
    <button
      type="button"
      class="paywall__cta paywall__cta--primary layout-upper"
      @click="$emit('purchase')"
    >
      Открыть полный портрет — 299 ₽
    </button>
    <p class="paywall__sub">или подписка 399 ₽/мес — всё включено</p>
  </section>
</template>

<script setup lang="ts">
  defineEmits<{ purchase: [] }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .paywall {
    margin: 2.4rem 0;
    padding: 2.4rem 1.6rem;
    border-radius: 0.8rem;
    border: 1px dashed rgba(179, 136, 255, 0.35);
    background: linear-gradient(135deg, rgba(179, 136, 255, 0.08), rgba(233, 168, 124, 0.06));
    text-align: center;
  }

  .paywall__icon {
    font-size: 2.4rem;
    margin-bottom: 1rem;
  }

  .paywall__text {
    margin: 0 0 1.6rem;
    color: $lightGrayOrange;
    font-size: 1.4rem;
    line-height: 1.5;
  }

  .paywall__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 32rem;
    margin: 0 auto 0.8rem;
    padding: 1.2rem 1.6rem;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, #b388ff, $softOrange);
    color: $primaryWhite;
    font-family: inherit;
    font-size: 1.4rem;
    font-weight: 600;
    cursor: pointer;
  }

  .paywall__sub {
    margin: 0;
    font-size: 1.2rem;
    color: $gray;
  }
</style>
