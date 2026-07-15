<template>
  <div class="cosmic-advice">
    <div class="cosmic-advice__stars" aria-hidden="true">
      <span class="cosmic-advice__star cosmic-advice__star--1" />
      <span class="cosmic-advice__star cosmic-advice__star--2" />
      <span class="cosmic-advice__star cosmic-advice__star--3" />
      <span class="cosmic-advice__star cosmic-advice__star--4" />
      <span class="cosmic-advice__star cosmic-advice__star--5" />
    </div>
    <p class="cosmic-advice__text">{{ text }}</p>
    <p class="cosmic-advice__attr">— вселенная</p>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    text: string;
  }>();
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .cosmic-advice {
    position: relative;
    padding: 2.4rem 1.6rem;
    border-radius: 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: linear-gradient(
      135deg,
      rgba(233, 168, 124, 0.06),
      rgba(179, 136, 255, 0.04)
    );
    text-align: center;
    overflow: hidden;
  }

  .cosmic-advice__stars {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .cosmic-advice__star {
    position: absolute;
    border-radius: 50%;
    opacity: 0.3;
  }

  .cosmic-advice__star--1 {
    top: 18%;
    left: 12%;
    width: 4px;
    height: 4px;
    background: $softOrange;
  }

  .cosmic-advice__star--2 {
    top: 28%;
    right: 16%;
    width: 3px;
    height: 3px;
    background: $softPurple;
  }

  .cosmic-advice__star--3 {
    bottom: 24%;
    left: 22%;
    width: 3px;
    height: 3px;
    background: $softOrange;
  }

  .cosmic-advice__star--4 {
    bottom: 18%;
    right: 24%;
    width: 5px;
    height: 5px;
    background: $softPurple;
  }

  .cosmic-advice__star--5 {
    top: 48%;
    left: 48%;
    width: 2px;
    height: 2px;
    background: $softOrange;
  }

  .cosmic-advice__text {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: 2rem;
    font-weight: 300;
    font-style: italic;
    line-height: 1.4;
    color: $lightGrayOrange;
  }

  .cosmic-advice__attr {
    position: relative;
    z-index: 1;
    margin: 1.2rem 0 0;
    font-size: 1.1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $grayDark;
  }
</style>
