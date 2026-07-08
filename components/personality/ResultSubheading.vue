<template>
  <h4 class="result-subheading">{{ title }}</h4>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .result-subheading {
    margin: 1.6rem 0 0.8rem;
    font-size: 1.3rem;
    font-weight: 600;
    color: $lightGrayOrange;
  }

  .result-subheading:first-child {
    margin-top: 0;
  }
</style>
