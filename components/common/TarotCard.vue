<template>
  <div class="tarot-card" :class="{ 'is-flipped': isFlipped }" ref="card">
    <div class="tarot-card__inner">
      <div class="tarot-card__front">
        <img :src="`/img/zodiacs/${image}`" :alt="title" />
        <div class="tarot-card__title">{{ title }}</div>
      </div>
      <div class="tarot-card__back">
        <!-- <h3>{{ title }}</h3> -->
        <div class="tarot-card__content" v-html="formattedContent"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();

  const props = defineProps({
    title: String,
    content: String,
    image: String,
    isFlipped: Boolean,
  });

  const card = ref(null);

  const formattedContent = computed(() => {
    return props.content
      .replace(/^#\s+/gm, '') // Remove leading # from headers
      .replace(/\n/g, '<br>'); // Convert newlines to <br> tags
  });

  onMounted(() => {
    $gsap.set(card.value, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .tarot-card {
    width: 280px;
    height: 480px;
    position: absolute;
    z-index: 0;
    opacity: 0;
    cursor: pointer;
    transform-style: preserve-3d;
  }

  .tarot-card__inner {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
  }

  .tarot-card.is-flipped .tarot-card__inner {
    transform: rotateY(180deg);
  }

  .tarot-card__front,
  .tarot-card__back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
  }

  .tarot-card__front {
    background: $blackBlue;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .tarot-card__back {
    background: $softOrange;
    transform: rotateY(180deg);
    padding: 20px 12px;
    color: $blackBlue;
    overflow-y: auto;

    h3 {
      font-size: 1.6rem;
      margin-bottom: 15px;
      color: $blackBlue;
    }

    .tarot-card__content {
      font-size: 1.5rem;
      line-height: 1.25;

      :deep(br) {
        margin-bottom: 0.5rem;
      }
    }
  }
</style>
