<template>
  <svg
    ref="iconRef"
    :class="classNames"
    :viewBox="`0 0 ${width} ${height}`"
    :style="`width: ${width}rem; height: ${height}rem;`"
  >
    <use :xlink:href="`#${name}`"></use>
  </svg>
</template>

<script setup>
  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      default: 24,
    },
    height: {
      type: Number,
      default: 24,
    },
  });

  const classNames = computed(() => ['icon', `icon_${props.name}`]);

  const iconRef = ref(null);
  defineExpose({ iconRef });
</script>

<style scoped>
  .icon {
    display: block;
  }
</style>
