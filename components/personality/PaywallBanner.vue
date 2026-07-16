<template>
  <section id="paywall" class="paywall-block">
    <div class="paywall">
      <div class="paywall__bg" aria-hidden="true" />
      <div class="paywall__nebula" aria-hidden="true" />
      <div class="paywall__glow" aria-hidden="true" />
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
        <p class="paywall__subtitle">299&nbsp;₽ · единоразово · без подписок</p>
        <p class="paywall__teaser">
          Ты видишь только начало. За этой дымкой —
          <span>зоны роста</span>, <span>стиль конфликтов</span>,
          <span>язык дружбы</span> и твой уникальный
          <span>стиль принятия решений</span>. Готов(а) узнать себя до конца?
        </p>

        <div class="paywall__cards" aria-label="Что входит в полный портрет">
          <article
            v-for="card in valueCards"
            :key="card.title"
            class="paywall__card"
          >
            <div class="paywall__card-icon" aria-hidden="true">
              <ResultSectionIcon :name="card.icon" />
            </div>
            <h3 class="paywall__card-title">{{ card.title }}</h3>
            <p class="paywall__card-desc">{{ card.desc }}</p>
          </article>
        </div>

        <div class="paywall__cta">
          <button
            type="button"
            class="paywall__cta-btn layout-upper"
            aria-label="Открыть полный портрет за 299 рублей"
            @click="$emit('purchase')"
          >
            Открыть полный портрет · 299&nbsp;₽
          </button>
          <p class="paywall__reassurance">
            Оплата в один клик · без автопродлений · доступ навсегда
          </p>
          <p class="paywall__reassurance paywall__reassurance--secondary">
            После оплаты ты получишь полный портрет на 12+ страниц с практическими
            рекомендациями
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ResultIconName } from '~/components/personality/ResultSectionIcon.vue';

  defineEmits<{ purchase: [] }>();

  const valueCards: { icon: ResultIconName; title: string; desc: string }[] = [
    {
      icon: 'growth',
      title: 'Зоны роста',
      desc: 'Узнай, какие сферы жизни готовы к прорыву уже сейчас',
    },
    {
      icon: 'zap',
      title: 'Конфликты',
      desc: 'Пойми, откуда берутся трения с близкими и как их смягчить',
    },
    {
      icon: 'people',
      title: 'Дружба',
      desc: 'Какие люди усиливают твою энергию, а какие — истощают',
    },
    {
      icon: 'compass',
      title: 'Стиль решений',
      desc: 'Твой уникальный способ выбирать — и как перестать сомневаться',
    },
  ];
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .paywall-block {
    margin: 3.2rem 0;
  }

  .paywall {
    position: relative;
    padding: 4rem 1.6rem;
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

  .paywall__glow {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(ellipse 45% 55% at 15% 50%, rgba(179, 136, 255, 0.08), transparent),
      radial-gradient(ellipse 45% 55% at 85% 50%, rgba(233, 168, 124, 0.06), transparent);
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
    margin-bottom: 1.2rem;
    font-size: 3.2rem;
    line-height: 1;
    color: $softPurple;
  }

  .paywall__title {
    margin: 0 0 0.6rem;
    font-size: 2rem;
    font-weight: 400;
    color: $softOrange;
  }

  .paywall__subtitle {
    margin: 0 0 1.6rem;
    font-size: 1.4rem;
    color: rgba(240, 236, 228, 0.7);
  }

  .paywall__teaser {
    max-width: 36rem;
    margin: 0 auto 2.4rem;
    font-size: 1.4rem;
    line-height: 1.5;
    color: $gray;
  }

  .paywall__teaser span {
    color: $softPurple;
  }

  .paywall__cards {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    max-width: 96rem;
    margin: 0 auto 2.4rem;
    text-align: left;

    @mixin desktop {
      grid-template-columns: repeat(4, 1fr);
      gap: 1.6rem;
    }
  }

  .paywall__card {
    padding: 1.2rem 1rem;
    border-radius: 1.4rem;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .paywall__card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.6rem;
    height: 3.6rem;
    margin-bottom: 0.8rem;
    border-radius: 50%;
    background: rgba(233, 168, 124, 0.1);
    color: $softOrange;

    @mixin desktop {
      width: 4rem;
      height: 4rem;
    }
  }

  .paywall__card-icon :deep(.result-icon) {
    width: 1.8rem;
    height: 1.8rem;
  }

  .paywall__card-title {
    margin: 0 0 0.4rem;
    font-size: 1.4rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: $softOrange;
  }

  .paywall__card-desc {
    margin: 0;
    font-size: 1.2rem;
    line-height: 1.4;
    color: rgba(240, 236, 228, 0.6);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .paywall__cta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
  }

  .paywall__cta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 32rem;
    padding: 1.4rem 2.8rem;
    border: none;
    border-radius: 2.4rem;
    background: linear-gradient(135deg, $softOrange, #d4956a);
    color: $blackBlue;
    font-family: inherit;
    font-size: 1.6rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(233, 168, 124, 0.2);
    transition:
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  .paywall__cta-btn:hover {
    box-shadow: 0 6px 28px rgba(233, 168, 124, 0.35);
    transform: scale(1.02);
  }

  @media (prefers-reduced-motion: reduce) {
    .paywall__cta-btn {
      transition: none;
    }

    .paywall__cta-btn:hover {
      transform: none;
    }
  }

  .paywall__reassurance {
    margin: 0;
    max-width: 32rem;
    font-size: 1.2rem;
    line-height: 1.4;
    color: rgba(240, 236, 228, 0.4);
  }

  .paywall__reassurance--secondary {
    font-size: 1.1rem;
    color: rgba(240, 236, 228, 0.35);
  }
</style>
