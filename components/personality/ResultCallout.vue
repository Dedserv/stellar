<template>
  <div class="result-callout" :class="`result-callout--${variant}`">
    <p v-if="heading" class="result-callout__heading">
      <span v-if="icon" class="result-callout__icon" aria-hidden="true">{{ icon }}</span>
      {{ heading }}
    </p>
    <p class="result-callout__text">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
  type CalloutVariant = 'tip' | 'action' | 'warning' | 'money' | 'ritual' | 'challenge' | 'practice' | 'rule';

  const props = withDefaults(
    defineProps<{
      variant: CalloutVariant;
      text?: string;
      heading?: string;
    }>(),
    {
      text: '',
      heading: '',
    }
  );

  const DEFAULT_HEADINGS: Record<CalloutVariant, string> = {
    tip: 'Как усилить',
    action: 'Задание на неделю',
    warning: 'Берегись',
    money: 'Деньги',
    ritual: 'Твои 10 минут утром',
    challenge: 'Вызов на месяц',
    practice: 'Что почитать / попробовать',
    rule: 'Твоё правило',
  };

  const DEFAULT_ICONS: Partial<Record<CalloutVariant, string>> = {
    action: '✓',
    warning: '⚠️',
    money: '💰',
    ritual: '🌅',
    challenge: '🎯',
    practice: '📖',
    rule: '🧭',
  };

  const heading = computed(() => props.heading || DEFAULT_HEADINGS[props.variant]);
  const icon = computed(() => DEFAULT_ICONS[props.variant] ?? '');
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .result-callout {
    margin-top: 1.2rem;
    padding: 1.2rem 1.4rem;
    border-radius: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
  }

  .result-callout--tip {
    border-color: rgba(233, 168, 124, 0.25);
    background: rgba(233, 168, 124, 0.08);
  }

  .result-callout--action {
    border-color: rgba(233, 168, 124, 0.3);
    background: rgba(233, 168, 124, 0.1);
  }

  .result-callout--warning {
    border-color: rgba(233, 168, 124, 0.35);
    background: rgba(233, 168, 124, 0.12);
  }

  .result-callout--money {
    border-color: rgba(233, 168, 124, 0.3);
    background: rgba(233, 168, 124, 0.09);
  }

  .result-callout--ritual {
    border-color: color-mix(in srgb, $softPurple 25%, transparent);
    background: color-mix(in srgb, $softPurple 8%, transparent);
  }

  .result-callout--challenge {
    border-color: rgba(233, 168, 124, 0.35);
    background: rgba(233, 168, 124, 0.11);
  }

  .result-callout--practice {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
  }

  .result-callout--rule {
    border-color: rgba(233, 168, 124, 0.4);
    background: rgba(233, 168, 124, 0.12);
  }

  .result-callout__heading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 0.6rem;
    font-size: 1.2rem;
    font-weight: 600;
    color: $softOrange;
  }

  .result-callout__icon {
    flex-shrink: 0;
  }

  .result-callout__text {
    margin: 0;
    font-size: 1.35rem;
    line-height: 1.55;
    color: $primaryWhite;
  }
</style>
