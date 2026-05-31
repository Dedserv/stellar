<template>
  <section v-if="items.length" class="chart-big-three container" aria-label="Большая тройка">
    <div class="chart-big-three__track">
      <article v-for="item in items" :key="item.key" class="chart-big-three__card">
        <span class="chart-big-three__symbol" :aria-label="item.ariaLabel">{{ item.symbol }}</span>
        <p class="chart-big-three__sign">{{ item.signLabel }}</p>
        <p v-if="item.short" class="chart-big-three__short">{{ item.short }}</p>
        <p v-else class="chart-big-three__placeholder">Описание появится позже</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { AstroApiResponse, NestedDescription } from '~/types/natal';
  import { canShowFullDescription } from '~/types/natal';

  const props = defineProps<{
    data: AstroApiResponse;
  }>();

  const SIGN_LABELS_RU: Record<string, string> = {
    aries: 'Овен',
    taurus: 'Телец',
    gemini: 'Близнецы',
    cancer: 'Рак',
    leo: 'Лев',
    virgo: 'Дева',
    libra: 'Весы',
    scorpio: 'Скорпион',
    sagittarius: 'Стрелец',
    capricorn: 'Козерог',
    aquarius: 'Водолей',
    pisces: 'Рыбы',
  };

  function signLabel(sign?: string) {
    if (!sign) return '';
    return SIGN_LABELS_RU[sign.toLowerCase()] ?? sign;
  }

  const items = computed(() => {
    const data = props.data;
    if (!data) return [];

    const sun = data.planets?.find((p) => p.name === 'sun');
    const moon = data.planets?.find((p) => p.name === 'moon');
    const asc = data.ascendant;

    function buildItem(
      key: string,
      symbol: string,
      ariaLabel: string,
      sign?: string,
      description?: { sign?: NestedDescription | null; house?: NestedDescription | null } | null
    ) {
      const signNested = description?.sign;
      const short =
        signNested && canShowFullDescription(signNested)
          ? signNested.description?.short
          : undefined;

      return {
        key,
        symbol,
        ariaLabel,
        signLabel: signLabel(sign),
        short,
      };
    }

    return [
      buildItem('sun', '☉', 'Солнце', sun?.sign, sun?.description),
      buildItem('moon', '☽', 'Луна', moon?.sign, moon?.description),
      buildItem('asc', '↑', 'Асцендент', asc?.sign, asc?.description),
    ];
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-big-three {
    margin-bottom: 2.4rem;
  }

  .chart-big-three__track {
    display: flex;
    gap: 1.2rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding: 0 1.6rem;
    margin: 0 -1.6rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @mixin desktop {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      overflow: visible;
      padding: 0;
      margin: 0;
    }
  }

  .chart-big-three__card {
    flex: 0 0 85%;
    scroll-snap-align: center;
    padding: 1.6rem;
    border-radius: 0.8rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

    @mixin desktop {
      flex: unset;
    }
  }

  .chart-big-three__symbol {
    display: block;
    margin-bottom: 0.8rem;
    font-size: 2.6rem;
    line-height: 1;
    color: $softOrange;
  }

  .chart-big-three__sign {
    margin: 0 0 0.8rem;
    font-size: 1.8rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .chart-big-three__short,
  .chart-big-three__placeholder {
    margin: 0;
    font-size: 1.3rem;
    line-height: 1.5;
  }

  .chart-big-three__short {
    color: $lightGrayOrange;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;

    @mixin desktop {
      display: block;
      -webkit-line-clamp: unset;
      overflow: visible;
    }
  }

  .chart-big-three__placeholder {
    color: $gray;
  }
</style>
