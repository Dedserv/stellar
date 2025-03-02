<template>
  <svg ref="circleRef" class="circle-divider" :viewBox="`0 0 ${diameter} ${diameter}`">
    <!-- Центрируем группу в середине SVG -->
    <g :transform="`translate(${radius}, ${radius})`">
      <!-- Рендерим дуги -->
      <path
        v-for="(segment, index) in segments"
        class="circle-divider__segment"
        :key="`path_${index}`"
        :d="segment.path"
        fill="none"
        :stroke="index <= activeIndex ? strokeColor : inactiveColor"
        :stroke-width="borderWidth"
        stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<script setup>
  const ANGLE_OFFSET = -Math.PI;

  const props = defineProps({
    segmentsCount: { type: Number, default: 10 },
    activeIndex: { type: Number, default: 0 },
    radius: { type: Number, default: 100 },
    strokeColor: { type: String, default: '#3498db' },
    inactiveColor: { type: String, default: 'transparent' },
    borderWidth: { type: Number, default: 2 },
    gap: { type: Number, default: 8 },
  });

  // Диаметр окружности
  const diameter = computed(() => props.radius * 2);

  // Переводим зазор в угол (в радианах)
  const gapAngle = props.gap / props.radius;

  /*
  Генерация дуговых сегментов по окружности.
  Для каждого сегмента вычисляем:
  - startAngle и endAngle с учётом зазора,
  - координаты начала и конца дуги,
  - путь (path) SVG для отрисовки дуги.
*/
  const segments = computed(() => {
    const segs = [];
    const totalAngle = Math.PI; // Половина окружности
    const segmentAngle = totalAngle / props.segmentsCount;

    for (let i = 0; i < props.segmentsCount; i++) {
      const startAngle = i * segmentAngle + gapAngle / 2;
      const endAngle = (i + 1) * segmentAngle - gapAngle / 2;

      const x1 = props.radius * Math.cos(startAngle + ANGLE_OFFSET);
      const y1 = props.radius * Math.sin(startAngle + ANGLE_OFFSET);
      const x2 = props.radius * Math.cos(endAngle + ANGLE_OFFSET);
      const y2 = props.radius * Math.sin(endAngle + ANGLE_OFFSET);

      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

      const d = [
        `M ${x1.toFixed(2)} ${y1.toFixed(2)}`,
        `A ${props.radius} ${props.radius} 0 ${largeArcFlag} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      ].join(' ');

      segs.push({ path: d });
    }
    return segs;
  });
</script>

<style scoped>
  .circle-divider {
    padding: 1px;
    overflow-clip-margin: border-box;
    opacity: 0;
    animation: fadeIn 0.8s ease-in-out forwards;
    animation-delay: 4s; /* Задержка перед началом анимации */

    &__segment {
      transition: stroke 0.7s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  }
</style>
