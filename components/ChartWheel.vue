<template>
  <div class="chart-wheel">
    <svg
      class="chart-wheel__svg"
      :viewBox="`0 0 ${SIZE} ${SIZE}`"
      role="img"
      aria-label="Натальная карта"
    >
      <!-- Background rings -->
      <circle
        :cx="CX"
        :cy="CY"
        :r="OUTER_R"
        class="chart-wheel__ring chart-wheel__ring--outer"
      />
      <circle
        :cx="CX"
        :cy="CY"
        :r="INNER_R"
        class="chart-wheel__ring chart-wheel__ring--inner"
      />

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
        text-anchor="middle"
        dominant-baseline="middle"
      >
        ASC
      </text>

      <!-- MC marker -->
      <template v-if="mcLine">
        <line
          :x1="CX"
          :y1="CY"
          :x2="mcLine.x"
          :y2="mcLine.y"
          class="chart-wheel__mc-line"
        />
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
        :class="['chart-wheel__aspect', `chart-wheel__aspect--${aspect.category}`]"
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

      <!-- Planets -->
      <g
        v-for="planet in planetMarkers"
        :key="planet.name"
        class="chart-wheel__planet"
        role="button"
        tabindex="0"
        :aria-label="planet.label"
        @click="onPlanetClick(planet.name, planet.label)"
        @keydown.enter="onPlanetClick(planet.name, planet.label)"
        @keydown.space.prevent="onPlanetClick(planet.name, planet.label)"
      >
        <circle
          :cx="planet.x"
          :cy="planet.y"
          r="14"
          class="chart-wheel__planet-hit"
        />
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
    </svg>
  </div>
</template>

<script setup lang="ts">
  import type { AstroApiResponse, AspectCategory } from '~/types/natal';

  const props = defineProps<{
    data: AstroApiResponse;
  }>();

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

  const SIGN_SYMBOLS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

  const PLANET_LABELS: Record<string, string> = {
    sun: 'Солнце',
    moon: 'Луна',
    mercury: 'Меркурий',
    venus: 'Венера',
    mars: 'Марс',
    jupiter: 'Юпитер',
    saturn: 'Сатурн',
    uranus: 'Уран',
    neptune: 'Нептун',
    pluto: 'Плутон',
  };

  const PLANET_ICONS: Record<string, string> = {
    sun: '☀️',
    moon: '🌙',
    mercury: '☿️',
    venus: '♀️',
    mars: '♂️',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
  };

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

  const aspectLines = computed(() =>
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
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-wheel {
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 100%;
    margin: 0 auto 2.4rem;
    padding: 0 0.4rem;
  }

  .chart-wheel__svg {
    width: 100%;
    max-width: 340px;
    height: auto;
    display: block;

    @mixin desktop {
      max-width: 480px;
    }
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

  .chart-wheel__planet {
    cursor: pointer;
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
    transition: stroke 0.15s ease, fill 0.15s ease;
  }

  .chart-wheel__planet:hover .chart-wheel__planet-hit,
  .chart-wheel__planet:focus .chart-wheel__planet-hit {
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
</style>
