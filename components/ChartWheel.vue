<template>
  <div class="chart-wheel">
    <div v-if="$slots.overlay" class="chart-wheel__overlay">
      <slot name="overlay" />
    </div>
    <svg
      class="chart-wheel__svg"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      role="img"
      aria-label="Натальная карта"
    >
      <!-- Background rings -->
      <circle :cx="CX" :cy="CY" :r="OUTER_R" class="chart-wheel__ring chart-wheel__ring--outer" />
      <circle :cx="CX" :cy="CY" :r="INNER_R" class="chart-wheel__ring chart-wheel__ring--inner" />

      <!-- Zodiac sign sectors -->
      <path
        v-for="sector in signSectors"
        :key="`sign-${sector.index}`"
        :d="sector.path"
        class="chart-wheel__sign-sector"
        :class="{ 'chart-wheel__sign-sector--alt': sector.index % 2 === 1 }"
      />

      <!-- Zodiac boundary ticks -->
      <line
        v-for="tick in signTicks"
        :key="`tick-${tick.longitude}`"
        :x1="tick.x1"
        :y1="tick.y1"
        :x2="tick.x2"
        :y2="tick.y2"
        class="chart-wheel__sign-tick"
      />

      <!-- House cusp lines -->
      <line
        v-for="house in houseLines"
        :key="`house-${house.number}`"
        :x1="CX"
        :y1="CY"
        :x2="house.x"
        :y2="house.y"
        class="chart-wheel__house-line"
      />

      <!-- Ascendant marker -->
      <line
        :x1="CX"
        :y1="CY"
        :x2="ascendantLine.x"
        :y2="ascendantLine.y"
        class="chart-wheel__asc-line"
      />
      <text
        :x="ascendantLabel.x"
        :y="ascendantLabel.y"
        class="chart-wheel__angle-label"
        :class="{ 'chart-wheel__angle-label--highlighted': highlightTarget === 'ascendant' }"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ASC
      </text>

      <!-- MC marker -->
      <template v-if="mcLine">
        <line :x1="CX" :y1="CY" :x2="mcLine.x" :y2="mcLine.y" class="chart-wheel__mc-line" />
        <text
          :x="mcLabel!.x"
          :y="mcLabel!.y"
          class="chart-wheel__angle-label chart-wheel__angle-label--mc"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          MC
        </text>
      </template>

      <!-- Aspect lines -->
      <line
        v-for="aspect in aspectLines"
        :key="aspect.id"
        :x1="aspect.x1"
        :y1="aspect.y1"
        :x2="aspect.x2"
        :y2="aspect.y2"
        :class="[
          'chart-wheel__aspect',
          `chart-wheel__aspect--${aspect.category}`,
          {
            'chart-wheel__aspect--focus':
              aspectLegendCategory && aspect.category === aspectLegendCategory,
            'chart-wheel__aspect--muted':
              aspectLegendCategory && aspect.category !== aspectLegendCategory,
          },
        ]"
      />

      <!-- Sign symbols -->
      <text
        v-for="sign in signLabels"
        :key="`label-${sign.index}`"
        :x="sign.x"
        :y="sign.y"
        class="chart-wheel__sign-label"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {{ sign.symbol }}
      </text>

      <!-- Planets (подсвеченная рисуется в foreground) -->
      <g
        v-for="planet in backgroundPlanetMarkers"
        :key="planet.name"
        class="chart-wheel__planet"
        role="button"
        tabindex="0"
        :aria-label="planet.label"
        @click="onPlanetClick(planet.name, planet.label)"
        @keydown.enter="onPlanetClick(planet.name, planet.label)"
        @keydown.space.prevent="onPlanetClick(planet.name, planet.label)"
      >
        <circle :cx="planet.x" :cy="planet.y" r="14" class="chart-wheel__planet-hit" />
        <text
          :x="planet.x"
          :y="planet.y"
          class="chart-wheel__planet-icon"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ planet.icon }}
        </text>
        <text
          v-if="planet.retrograde"
          :x="planet.x + 10"
          :y="planet.y - 10"
          class="chart-wheel__retrograde"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ℞
        </text>
      </g>

      <!-- Foreground: подсвеченная планета поверх остальных -->
      <g
        v-if="foregroundPlanet"
        class="chart-wheel__planets-foreground"
        aria-hidden="false"
      >
        <g
          class="chart-wheel__planet chart-wheel__planet--highlighted chart-wheel__planet--foreground"
          role="button"
          tabindex="0"
          :aria-label="foregroundPlanet.label"
          @click="onPlanetClick(foregroundPlanet.name, foregroundPlanet.label)"
          @keydown.enter="onPlanetClick(foregroundPlanet.name, foregroundPlanet.label)"
          @keydown.space.prevent="onPlanetClick(foregroundPlanet.name, foregroundPlanet.label)"
        >
          <circle
            :cx="foregroundPlanet.x"
            :cy="foregroundPlanet.y"
            r="14"
            class="chart-wheel__planet-hit"
          />
          <text
            :x="foregroundPlanet.x"
            :y="foregroundPlanet.y"
            class="chart-wheel__planet-icon"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ foregroundPlanet.icon }}
          </text>
          <text
            v-if="foregroundPlanet.retrograde"
            :x="foregroundPlanet.x + 10"
            :y="foregroundPlanet.y - 10"
            class="chart-wheel__retrograde"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            ℞
          </text>
        </g>
      </g>

      <!-- Tour / legend highlight layer -->
      <g class="chart-wheel__highlight-layer" pointer-events="none" aria-hidden="true">
        <circle v-if="dimmed" class="chart-wheel__dim" cx="200" cy="200" r="185" />
        <circle
          v-if="highlightRing"
          :cx="highlightRing.cx"
          :cy="highlightRing.cy"
          :r="highlightRing.r"
          :class="['chart-wheel__highlight-ring', highlightRing.className]"
        />
        <line
          v-if="highlightAscLine"
          :x1="CX"
          :y1="CY"
          :x2="highlightAscLine.x"
          :y2="highlightAscLine.y"
          class="chart-wheel__highlight-asc-line"
        />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
  import type { AstroApiResponse, AspectCategory } from '~/types/natal';
  import type { ChartWheelHighlightTarget } from '~/types/chartWheel';
  import { PLANET_ICONS, PLANET_LABELS, SIGN_SYMBOLS } from '~/constants/chartWheelSymbols';

  const props = withDefaults(
    defineProps<{
      data: AstroApiResponse;
      highlightTarget?: ChartWheelHighlightTarget | null;
      dimmed?: boolean;
    }>(),
    {
      highlightTarget: null,
      dimmed: false,
    }
  );

  const emit = defineEmits<{
    'select-planet': [payload: { name: string; label: string }];
  }>();

  const SIZE = 400;
  const CX = 200;
  const CY = 200;
  const OUTER_R = 185;
  const INNER_R = 95;
  const SIGN_LABEL_R = 168;
  const PLANET_R = 128;
  const ASPECT_R = 78;
  const ANGLE_LABEL_R = 72;

  const ascendantLongitude = computed(() => props.data.ascendant.longitude);

  function longitudeToAngle(longitude: number): number {
    return 180 - (longitude - ascendantLongitude.value);
  }

  function polarToCartesian(r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.round((CX + r * Math.cos(rad)) * 100) / 100,
      y: Math.round((CY - r * Math.sin(rad)) * 100) / 100,
    };
  }

  function describeDonutSector(startLng: number, endLng: number): string {
    const startAngle = longitudeToAngle(startLng);
    const endAngle = longitudeToAngle(endLng);
    const outerStart = polarToCartesian(OUTER_R, startAngle);
    const outerEnd = polarToCartesian(OUTER_R, endAngle);
    const innerEnd = polarToCartesian(INNER_R, endAngle);
    const innerStart = polarToCartesian(INNER_R, startAngle);
    const span = Math.abs(endAngle - startAngle);
    const largeArc = span > 180 ? 1 : 0;
    const sweep = endAngle < startAngle ? 1 : 0;

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} ${sweep} ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${INNER_R} ${INNER_R} 0 ${largeArc} ${1 - sweep} ${innerStart.x} ${innerStart.y}`,
      'Z',
    ].join(' ');
  }

  const signSectors = computed(() =>
    Array.from({ length: 12 }, (_, index) => ({
      index,
      path: describeDonutSector(index * 30, (index + 1) * 30),
    }))
  );

  const signTicks = computed(() =>
    Array.from({ length: 12 }, (_, index) => {
      const angle = longitudeToAngle(index * 30);
      const outer = polarToCartesian(OUTER_R, angle);
      const inner = polarToCartesian(INNER_R, angle);
      return { longitude: index * 30, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
    })
  );

  const signLabels = computed(() =>
    SIGN_SYMBOLS.map((symbol, index) => {
      const midLng = index * 30 + 15;
      const pos = polarToCartesian(SIGN_LABEL_R, longitudeToAngle(midLng));
      return { index, symbol, ...pos };
    })
  );

  const houseLines = computed(() =>
    (props.data.houses ?? []).map((house) => {
      const pos = polarToCartesian(OUTER_R, longitudeToAngle(house.cusp));
      return { number: house.number, ...pos };
    })
  );

  const ascendantLine = computed(() =>
    polarToCartesian(OUTER_R, longitudeToAngle(ascendantLongitude.value))
  );

  const ascendantLabel = computed(() =>
    polarToCartesian(ANGLE_LABEL_R, longitudeToAngle(ascendantLongitude.value))
  );

  const mcLine = computed(() => {
    if (!props.data.mc) return null;
    return polarToCartesian(OUTER_R, longitudeToAngle(props.data.mc.longitude));
  });

  const mcLabel = computed(() => {
    if (!props.data.mc) return null;
    return polarToCartesian(ANGLE_LABEL_R, longitudeToAngle(props.data.mc.longitude));
  });

  function getAspectCategory(type: string): AspectCategory {
    if (type === 'conjunction') return 'conjunction';
    if (type === 'trine' || type === 'sextile') return 'harmonious';
    if (type === 'square' || type === 'opposition') return 'tense';
    return 'other';
  }

  const planetPositions = computed(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const planet of props.data.planets ?? []) {
      map.set(planet.name, polarToCartesian(PLANET_R, longitudeToAngle(planet.longitude)));
    }
    return map;
  });

  const aspectLines = computed(
    () =>
      (props.data.aspects ?? [])
        .map((aspect, index) => {
          const p1 = planetPositions.value.get(aspect.planet1);
          const p2 = planetPositions.value.get(aspect.planet2);
          if (!p1 || !p2) return null;

          const a1 = longitudeToAngle(
            props.data.planets.find((p) => p.name === aspect.planet1)?.longitude ?? 0
          );
          const a2 = longitudeToAngle(
            props.data.planets.find((p) => p.name === aspect.planet2)?.longitude ?? 0
          );
          const pos1 = polarToCartesian(ASPECT_R, a1);
          const pos2 = polarToCartesian(ASPECT_R, a2);

          return {
            id: `${aspect.planet1}-${aspect.planet2}-${index}`,
            x1: pos1.x,
            y1: pos1.y,
            x2: pos2.x,
            y2: pos2.y,
            category: getAspectCategory(aspect.type),
          };
        })
        .filter(Boolean) as Array<{
        id: string;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        category: AspectCategory;
      }>
  );

  const planetMarkers = computed(() =>
    (props.data.planets ?? []).map((planet) => {
      const pos = polarToCartesian(PLANET_R, longitudeToAngle(planet.longitude));
      return {
        name: planet.name,
        label: PLANET_LABELS[planet.name] ?? planet.name,
        icon: PLANET_ICONS[planet.name] ?? '✦',
        retrograde: planet.retrograde,
        ...pos,
      };
    })
  );

  function onPlanetClick(name: string, label: string) {
    emit('select-planet', { name, label });
  }

  const aspectLegendCategory = computed(() => {
    const target = props.highlightTarget;
    if (target === 'aspects-harmonious') return 'harmonious';
    if (target === 'aspects-tense') return 'tense';
    if (target === 'aspects-conjunction') return 'conjunction';
    return null;
  });

  function resolvePlanetHighlight(name: string) {
    const marker = planetMarkers.value.find((p) => p.name === name);
    if (!marker) return null;
    const className =
      name === 'sun'
        ? 'chart-wheel__highlight-ring--sun'
        : name === 'moon'
          ? 'chart-wheel__highlight-ring--moon'
          : 'chart-wheel__highlight-ring--planet';
    return { cx: marker.x, cy: marker.y, r: 22, className };
  }

  const highlightRing = computed(() => {
    const target = props.highlightTarget;
    if (!target || aspectLegendCategory.value) return null;

    if (target === 'wheel') {
      return {
        cx: CX,
        cy: CY,
        r: OUTER_R + 6,
        className: 'chart-wheel__highlight-ring--wheel',
      };
    }

    if (target === 'sun' || target === 'moon') {
      return resolvePlanetHighlight(target);
    }

    if (target.startsWith('planet:')) {
      return resolvePlanetHighlight(target.slice(7));
    }

    if (target.startsWith('sign:')) {
      const index = Number(target.slice(5));
      const sign = signLabels.value.find((s) => s.index === index);
      if (!sign) return null;
      return {
        cx: sign.x,
        cy: sign.y,
        r: 18,
        className: 'chart-wheel__highlight-ring--sign',
      };
    }

    if (target === 'ascendant') {
      const pos = ascendantLabel.value;
      return {
        cx: pos.x,
        cy: pos.y,
        r: 20,
        className: 'chart-wheel__highlight-ring--asc',
      };
    }

    return null;
  });

  const highlightAscLine = computed(() => {
    if (props.highlightTarget !== 'ascendant') return null;
    return ascendantLine.value;
  });

  const highlightedPlanetName = computed(() => {
    const target = props.highlightTarget;
    if (!target) return null;
    if (target === 'sun' || target === 'moon') return target;
    if (target.startsWith('planet:')) return target.slice(7);
    return null;
  });

  const foregroundPlanet = computed(() => {
    const name = highlightedPlanetName.value;
    if (!name) return null;
    return planetMarkers.value.find((p) => p.name === name) ?? null;
  });

  const backgroundPlanetMarkers = computed(() => {
    const name = highlightedPlanetName.value;
    if (!name) return planetMarkers.value;
    return planetMarkers.value.filter((p) => p.name !== name);
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel {
    position: relative;
    box-sizing: border-box;
    width: min(100%, 400px);
    max-width: 400px;
    margin: 0 auto 2.4rem;
    padding: 0;
  }

  .chart-wheel__overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  .chart-wheel__overlay :deep(.chart-wheel-help),
  .chart-wheel__overlay :deep(.chart-wheel-tour-panel) {
    pointer-events: auto;
  }

  .chart-wheel__svg {
    display: block;
    width: 400px;
    max-width: 100%;
    height: auto;
    aspect-ratio: 1;
  }

  .chart-wheel__ring {
    fill: none;
    stroke: rgba(255, 255, 255, 0.06);
    stroke-width: 1;
  }

  .chart-wheel__ring--outer {
    fill: $darkGrayBlue;
  }

  .chart-wheel__ring--inner {
    fill: $blackBlue;
  }

  .chart-wheel__sign-sector {
    fill: rgba(255, 255, 255, 0.02);
    stroke: none;
  }

  .chart-wheel__sign-sector--alt {
    fill: rgba(255, 255, 255, 0.04);
  }

  .chart-wheel__sign-tick {
    stroke: rgba(255, 255, 255, 0.08);
    stroke-width: 0.75;
  }

  .chart-wheel__house-line {
    stroke: rgba(190, 190, 201, 0.25);
    stroke-width: 0.75;
  }

  .chart-wheel__asc-line {
    stroke: $softOrange;
    stroke-width: 2;
  }

  .chart-wheel__mc-line {
    stroke: $softOrangeTrans;
    stroke-width: 1.5;
    stroke-dasharray: 4 3;
  }

  .chart-wheel__angle-label {
    fill: $softOrange;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .chart-wheel__angle-label--mc {
    fill: $softOrangeTrans;
  }

  .chart-wheel__angle-label--highlighted {
    fill: $primaryWhite;
    font-size: 10px;
  }

  .chart-wheel__sign-label {
    fill: $lightGrayOrange;
    font-size: 14px;
    user-select: none;
    pointer-events: none;
  }

  .chart-wheel__aspect {
    stroke-width: 1;
    opacity: 0.65;
  }

  .chart-wheel__aspect--harmonious {
    stroke: rgba(100, 180, 130, 0.7);
  }

  .chart-wheel__aspect--tense {
    stroke: rgba(210, 95, 95, 0.75);
  }

  .chart-wheel__aspect--conjunction {
    stroke: $softOrange;
    opacity: 0.8;
  }

  .chart-wheel__aspect--other {
    stroke: $gray;
    opacity: 0.4;
  }

  .chart-wheel__aspect--focus {
    stroke-width: 2;
    opacity: 1;
  }

  .chart-wheel__aspect--muted {
    opacity: 0.12;
  }

  .chart-wheel__highlight-ring--planet {
    stroke: $softOrange;
    animation: chart-wheel-pulse 1.8s ease-in-out infinite;
  }

  .chart-wheel__highlight-ring--sign {
    stroke: $lightGrayOrange;
    animation: chart-wheel-pulse 1.8s ease-in-out infinite;
  }

  .chart-wheel__planets-foreground {
    pointer-events: none;
  }

  .chart-wheel__planets-foreground .chart-wheel__planet {
    pointer-events: auto;
  }

  .chart-wheel__planet {
    cursor: pointer;
    outline: none;
  }

  .chart-wheel__planet--foreground {
    outline: none;
  }

  .chart-wheel__planet:focus-visible .chart-wheel__planet-hit {
    stroke: $softOrange;
    stroke-width: 2;
  }

  .chart-wheel__planet-hit {
    fill: rgba(33, 36, 41, 0.85);
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 1;
    transition:
      stroke 0.15s ease,
      fill 0.15s ease;
  }

  .chart-wheel__planet:hover .chart-wheel__planet-hit,
  .chart-wheel__planet:focus .chart-wheel__planet-hit,
  .chart-wheel__planet--highlighted .chart-wheel__planet-hit {
    stroke: $softOrangeTrans;
    fill: rgba(233, 168, 124, 0.12);
  }

  .chart-wheel__planet-icon {
    font-size: 13px;
    pointer-events: none;
    user-select: none;
  }

  .chart-wheel__retrograde {
    fill: $gray;
    font-size: 8px;
    font-weight: 600;
    pointer-events: none;
  }

  .chart-wheel__highlight-layer {
    pointer-events: none;
  }

  .chart-wheel__dim {
    fill: rgba(13, 8, 4, 0.55);
  }

  .chart-wheel__highlight-ring {
    fill: none;
    stroke-width: 2.5;
    opacity: 0.95;
  }

  .chart-wheel__highlight-ring--wheel {
    stroke: $softOrangeTrans;
    animation: chart-wheel-pulse 1.8s ease-in-out infinite;
  }

  .chart-wheel__highlight-ring--sun {
    stroke: #d4a853;
    animation: chart-wheel-pulse 1.8s ease-in-out infinite;
  }

  .chart-wheel__highlight-ring--moon {
    stroke: $lightGray;
    animation: chart-wheel-pulse 1.8s ease-in-out infinite;
  }

  .chart-wheel__highlight-ring--asc {
    stroke: $primaryWhite;
    animation: chart-wheel-pulse 1.8s ease-in-out infinite;
  }

  .chart-wheel__highlight-asc-line {
    stroke: $primaryWhite;
    stroke-width: 3;
    opacity: 0.9;
    animation: chart-wheel-pulse-line 1.8s ease-in-out infinite;
  }

  @keyframes chart-wheel-pulse {
    0%,
    100% {
      stroke-opacity: 0.45;
      stroke-width: 2;
    }

    50% {
      stroke-opacity: 1;
      stroke-width: 3.5;
    }
  }

  @keyframes chart-wheel-pulse-line {
    0%,
    100% {
      opacity: 0.5;
    }

    50% {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .chart-wheel__highlight-ring,
    .chart-wheel__highlight-asc-line {
      animation: none;
      stroke-opacity: 1;
      opacity: 1;
    }
  }
</style>
