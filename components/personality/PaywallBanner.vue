<template>
  <section id="paywall" class="paywall-block">
    <div class="paywall">
      <div class="paywall__bg" aria-hidden="true" />
      <div class="paywall__nebula" aria-hidden="true" />
      <div class="paywall__stars" aria-hidden="true">
        <svg viewBox="0 0 400 300" width="400" height="300">
          <circle cx="60" cy="40" r="1" fill="#fafafa" opacity="0.6" />
          <circle cx="180" cy="70" r="0.8" fill="#fafafa" opacity="0.3" />
          <circle cx="320" cy="30" r="1.2" fill="#fafafa" opacity="0.5" />
          <circle cx="100" cy="140" r="0.7" fill="#fafafa" opacity="0.4" />
          <circle cx="260" cy="180" r="1" fill="#fafafa" opacity="0.3" />
          <circle cx="50" cy="220" r="0.9" fill="#fafafa" opacity="0.5" />
          <circle cx="340" cy="250" r="0.8" fill="#fafafa" opacity="0.4" />
          <circle cx="200" cy="260" r="1.1" fill="#e9a87c" opacity="0.5" />
        </svg>
      </div>

      <div class="paywall__content">
        <div class="paywall__icon" aria-hidden="true">✦</div>
        <h2 class="paywall__title">Твой полный портрет</h2>
        <p class="paywall__teaser">
          Ты видишь только начало. За этой дымкой —
          <span>зоны роста</span>, <span>стиль конфликтов</span>,
          <span>язык дружбы</span> и твой уникальный
          <span>стиль принятия решений</span>. Готов(а) узнать себя до конца?
        </p>
        <div class="paywall__cta">
          <button
            type="button"
            class="paywall__cta-btn layout-upper"
            aria-label="Открыть полный портрет за 299 рублей"
            @click="$emit('purchase')"
          >
            Открыть полный портрет
          </button>
          <span class="paywall__cta-price">разовый доступ · 299 ₽</span>
        </div>
        <div class="paywall__features">
          <div v-for="feature in features" :key="feature" class="paywall__feature">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ feature }}
          </div>
        </div>
      </div>
    </div>

    <div v-if="stubs.length" class="paid-stubs" aria-hidden="true">
      <div class="paid-stubs__grid">
        <div v-for="stub in stubs" :key="stub.title" class="paid-stubs__card">
          <p v-if="stub.label" class="paid-stubs__label">{{ stub.label }}</p>
          <h4 class="paid-stubs__title">{{ stub.title }}</h4>
          <p class="paid-stubs__desc">{{ stub.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  export interface PaywallStub {
    label?: string;
    title: string;
    desc: string;
  }

  withDefaults(
    defineProps<{
      stubs?: PaywallStub[];
    }>(),
    {
      stubs: () => [],
    }
  );

  defineEmits<{ purchase: [] }>();

  const features = ['Зоны роста', 'Конфликты', 'Дружба', 'Стиль решений'];
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .paywall-block {
    margin: 3.2rem 0;
  }

  .paywall {
    position: relative;
    padding: 4.8rem 1.6rem;
    border-radius: 0.8rem;
    border: 1px solid rgba(179, 136, 255, 0.2);
    text-align: center;
    overflow: hidden;
  }

  .paywall__bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(20, 21, 32, 0.3) 0%,
      rgba(179, 136, 255, 0.06) 30%,
      rgba(233, 168, 124, 0.08) 60%,
      rgba(20, 21, 32, 0.3) 100%
    );
  }

  .paywall__nebula {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 60% 40% at 30% 20%, rgba(179, 136, 255, 0.12), transparent),
      radial-gradient(ellipse 50% 30% at 70% 60%, rgba(233, 168, 124, 0.1), transparent),
      radial-gradient(ellipse 80% 50% at 50% 80%, rgba(179, 136, 255, 0.06), transparent);
  }

  .paywall__stars {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    border-radius: inherit;
  }

  .paywall__stars svg {
    position: absolute;
    top: 0;
    left: 50%;
    opacity: 0.2;
    transform: translateX(-50%);
  }

  .paywall__content {
    position: relative;
    z-index: 2;
  }

  .paywall__icon {
    margin-bottom: 1.6rem;
    font-size: 3.2rem;
    line-height: 1;
    color: $softPurple;
  }

  .paywall__title {
    margin: 0 0 1.2rem;
    font-size: 2.4rem;
    font-weight: 400;
    color: $lightGrayOrange;
  }

  .paywall__teaser {
    max-width: 32rem;
    margin: 0 auto 2rem;
    font-size: 1.4rem;
    line-height: 1.5;
    color: $gray;
  }

  .paywall__teaser span {
    color: $softPurple;
  }

  .paywall__cta {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .paywall__cta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 28rem;
    padding: 1.2rem 2.4rem;
    border: none;
    border-radius: 999px;
    background: linear-gradient(135deg, $softPurple, $softOrange);
    color: $primaryWhite;
    font-family: inherit;
    font-size: 1.4rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(179, 136, 255, 0.2);
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  .paywall__cta-btn:hover {
    box-shadow: 0 6px 28px rgba(179, 136, 255, 0.35);
    transform: translateY(-1px);
  }

  @media (prefers-reduced-motion: reduce) {
    .paywall__cta-btn {
      transition: none;
    }

    .paywall__cta-btn:hover {
      transform: none;
    }
  }

  .paywall__cta-price {
    font-size: 1.1rem;
    color: $grayDark;
  }

  .paywall__features {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1.2rem 2.4rem;
    margin-top: 2rem;
    padding-top: 1.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
  }

  .paywall__feature {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    font-size: 1.1rem;
    color: $grayDark;
  }

  .paywall__feature svg {
    width: 14px;
    height: 14px;
    stroke: $softOrange;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .paid-stubs {
    position: relative;
    margin-top: 1.6rem;
    opacity: 0.35;
    filter: blur(4px);
    pointer-events: none;
    user-select: none;
  }

  .paid-stubs__grid {
    display: grid;
    gap: 1.2rem;
    grid-template-columns: 1fr;

    @mixin tablet {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .paid-stubs__card {
    padding: 1.6rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    text-align: left;
  }

  .paid-stubs__label {
    margin: 0 0 0.4rem;
    font-size: 1.1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $softOrange;
  }

  .paid-stubs__title {
    margin: 0 0 0.8rem;
    font-size: 1.5rem;
    font-weight: 500;
    color: $lightGrayOrange;
  }

  .paid-stubs__desc {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.45;
    color: $gray;
  }
</style>
