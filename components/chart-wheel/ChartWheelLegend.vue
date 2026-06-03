<template>
  <section id="chart-wheel-legend" class="chart-wheel-legend container">
    <button
      type="button"
      class="chart-wheel-legend__toggle"
      :aria-expanded="isOpen"
      aria-controls="chart-wheel-legend-panel"
      @click="toggleOpen()"
    >
      <span class="chart-wheel-legend__toggle-label">Что значат символы?</span>
      <span
        class="chart-wheel-legend__chevron"
        :class="{ 'chart-wheel-legend__chevron--open': isOpen }"
        aria-hidden="true"
      />
    </button>

    <div v-show="isOpen" id="chart-wheel-legend-panel" class="chart-wheel-legend__panel">
      <div class="chart-wheel-legend__track">
        <div v-for="group in legendGroups" :key="group.id" class="chart-wheel-legend__group">
          <h3 class="chart-wheel-legend__group-title">{{ group.title }}</h3>
          <ul class="chart-wheel-legend__list">
            <li
              v-for="item in group.items"
              :key="item.key"
              class="chart-wheel-legend__item"
              @mouseenter="onItemEnter(item.highlight)"
              @mouseleave="onItemLeave()"
            >
              <span
                v-if="item.swatchClass"
                :class="['chart-wheel-legend__swatch', item.swatchClass]"
              />
              <span v-else-if="item.icon" class="chart-wheel-legend__icon">{{ item.icon }}</span>
              <span v-else-if="item.symbol" class="chart-wheel-legend__symbol">
                {{ item.symbol }}
              </span>
              <div class="chart-wheel-legend__text">
                <span class="chart-wheel-legend__name">{{ item.name }}</span>
                <span v-if="item.chip" :class="['chart-wheel-legend__chip', item.chipClass]">
                  {{ item.chip }}
                </span>
                <p class="chart-wheel-legend__desc">{{ item.description }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { ChartWheelHighlightTarget } from '~/types/chartWheel';
  import {
    ASPECT_LEGEND_ITEMS,
    PLANET_ICONS,
    PLANET_LABELS,
    PLANET_LEGEND_DESCRIPTIONS,
    PLANET_LEGEND_ORDER,
    SIGN_ELEMENT_CHIP_CLASS,
    SIGN_ELEMENT_LABELS,
    SIGN_ELEMENTS,
    SIGN_KEYS,
    SIGN_LABELS_RU,
    SIGN_SYMBOLS,
  } from '~/constants/chartWheelSymbols';

  const props = defineProps<{
    isOpen: boolean;
    enableHover: boolean;
  }>();

  const emit = defineEmits<{
    toggle: [];
    hover: [target: ChartWheelHighlightTarget | null];
  }>();

  function toggleOpen() {
    emit('toggle');
  }

  function onItemEnter(target: ChartWheelHighlightTarget | null) {
    if (!props.enableHover || !target) return;
    emit('hover', target);
  }

  function onItemLeave() {
    if (!props.enableHover) return;
    emit('hover', null);
  }

  const planetItems = PLANET_LEGEND_ORDER.map((name) => ({
    key: name,
    icon: PLANET_ICONS[name],
    name: PLANET_LABELS[name],
    description: PLANET_LEGEND_DESCRIPTIONS[name] ?? '',
    highlight: `planet:${name}` as ChartWheelHighlightTarget,
    swatchClass: null,
    symbol: null,
    chip: null,
    chipClass: null,
  }));

  const signItems = SIGN_KEYS.map((key, index) => {
    const element = SIGN_ELEMENTS[index];
    return {
      key,
      icon: null,
      symbol: SIGN_SYMBOLS[index],
      name: SIGN_LABELS_RU[key],
      description: `Знак зодиака · стихия ${SIGN_ELEMENT_LABELS[element].toLowerCase()}`,
      highlight: `sign:${index}` as ChartWheelHighlightTarget,
      swatchClass: null,
      chip: SIGN_ELEMENT_LABELS[element],
      chipClass: SIGN_ELEMENT_CHIP_CLASS[element],
    };
  });

  const aspectItems = ASPECT_LEGEND_ITEMS.map((aspect) => ({
    key: aspect.id,
    icon: null,
    symbol: null,
    name: aspect.label,
    description: aspect.description,
    highlight: aspect.highlight,
    swatchClass: aspect.swatchClass,
    chip: null,
    chipClass: null,
  }));

  const legendGroups = [
    { id: 'planets', title: 'Планеты', items: planetItems },
    { id: 'signs', title: 'Знаки зодиака', items: signItems },
    { id: 'aspects', title: 'Линии аспектов', items: aspectItems },
  ];
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel-legend {
    width: 100%;
    margin-top: 0.8rem;
    padding-inline: 1.6rem;

    @mixin desktop {
      width: 900px;
    }
  }

  .chart-wheel-legend__toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1.2rem 1.6rem;
    cursor: pointer;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.8rem;
    transition: background 0.15s ease;

    &:hover {
      background: rgba(33, 36, 41, 0.95);
    }
  }

  .chart-wheel-legend__toggle-label {
    font-size: 1.5rem;
    font-weight: 500;
    color: $lightGrayOrange;
    text-align: left;
  }

  .chart-wheel-legend__chevron {
    flex-shrink: 0;
    width: 0.6rem;
    height: 0.6rem;
    border-right: 2px solid $gray;
    border-bottom: 2px solid $gray;
    transform: rotate(45deg);
    transition: transform 0.2s ease;
  }

  .chart-wheel-legend__chevron--open {
    transform: rotate(-135deg);
  }

  .chart-wheel-legend__panel {
    margin-top: 0.8rem;
  }

  .chart-wheel-legend__track {
    display: flex;
    gap: 1.2rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 0.4rem;

    &::-webkit-scrollbar {
      display: none;
    }

    @mixin desktop {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.6rem;
      overflow: visible;
      padding-bottom: 0;
    }
  }

  .chart-wheel-legend__group {
    flex: 0 0 88%;
    scroll-snap-align: center;
    padding: 1.6rem;
    background: $darkGrayBlue;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 0.8rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);

    @mixin desktop {
      flex: unset;
      scroll-snap-align: unset;
    }
  }

  .chart-wheel-legend__group-title {
    margin: 0 0 1.2rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .chart-wheel-legend__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .chart-wheel-legend__item {
    display: flex;
    gap: 0.8rem;
    align-items: flex-start;
    padding: 0.4rem;
    margin: -0.4rem;
    border-radius: 0.4rem;
    transition: background 0.15s ease;

    @mixin desktop {
      &:hover {
        background: rgba(233, 168, 124, 0.08);
      }
    }
  }

  .chart-wheel-legend__icon,
  .chart-wheel-legend__symbol {
    flex-shrink: 0;
    width: 2rem;
    font-size: 1.6rem;
    line-height: 1.4;
    text-align: center;
  }

  .chart-wheel-legend__swatch {
    flex-shrink: 0;
    width: 2rem;
    height: 3px;
    margin-top: 0.7rem;
    border-radius: 2px;
  }

  .chart-wheel-legend__swatch--harmonious {
    background: rgba(100, 180, 130, 0.9);
  }

  .chart-wheel-legend__swatch--tense {
    background: rgba(210, 95, 95, 0.9);
  }

  .chart-wheel-legend__swatch--conjunction {
    background: $softOrange;
  }

  .chart-wheel-legend__text {
    flex: 1;
    min-width: 0;
  }

  .chart-wheel-legend__name {
    display: inline;
    margin-right: 0.5rem;
    font-size: 1.3rem;
    font-weight: 500;
    color: $primaryWhite;
  }

  .chart-wheel-legend__chip {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    font-size: 1rem;
    vertical-align: middle;
    border-radius: 0.4rem;
  }

  .chart-wheel-legend__chip--fire {
    color: $softOrange;
    background: rgba(233, 168, 124, 0.1);
    border: 1px solid $softOrangeTrans;
  }

  .chart-wheel-legend__chip--earth {
    color: $innertOrange;
    background: rgba(102, 74, 55, 0.25);
    border: 1px solid rgba(102, 74, 55, 0.5);
  }

  .chart-wheel-legend__chip--air {
    color: $gray;
    background: rgba(190, 190, 201, 0.12);
    border: 1px solid rgba(190, 190, 201, 0.35);
  }

  .chart-wheel-legend__chip--water {
    color: $grayBlue;
    background: rgba(61, 64, 74, 0.35);
    border: 1px solid rgba(61, 64, 74, 0.6);
  }

  .chart-wheel-legend__desc {
    margin: 0.25rem 0 0;
    font-size: 1.2rem;
    line-height: 1.45;
    color: $gray;
  }
</style>
