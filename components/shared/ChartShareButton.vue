<template>
  <div class="chart-share">
    <VButton
      class="chart-share__btn"
      type="bordered"
      color="secondary"
      rounded
      :disabled="disabled"
      @click="$emit('share')"
    >
      {{ label }}
    </VButton>
    <span class="chart-share__live" aria-live="polite" aria-atomic="true">
      {{ liveMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      label?: string;
      liveMessage?: string;
      disabled?: boolean;
    }>(),
    {
      label: 'Поделиться',
      liveMessage: '',
      disabled: false,
    }
  );

  defineEmits<{ share: [] }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .chart-share {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .chart-share__btn {
    display: flex;
  }

  .chart-share__live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
