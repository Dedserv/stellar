<template>
  <div class="modal-loader">
    <div ref="textContainer">
      <span v-for="(word, index) in words" :key="index" class="word">{{ word }}</span>
    </div>
    <div class="progress-container">
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();
  const textContainer = ref(null);
  const words = [
    'Идет',
    'составление',
    'Натальной',
    'Карты',
    'это',
    'займет',
    'несколько',
    'минут',
    '.',
    '.',
    '.',
  ];

  const props = defineProps({
    progress: {
      type: Number,
      default: 0,
    },
  });

  onMounted(() => {
    const words = textContainer.value.querySelectorAll('.word');

    $gsap.fromTo(
      words,
      {
        opacity: 0,
        y: '50vh',
      },
      {
        opacity: 1,
        y: '0',
        duration: 0.4,
        stagger: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          // Анимация для последних трех точек
          const dots = Array.from(words).slice(-3);
          $gsap.to(dots, {
            y: '-=1', // Двигаем точки вверх
            duration: 0.5,
            repeat: -1, // Бесконечное повторение
            yoyo: true, // Движение вверх и вниз
            ease: 'power1.inOut',
          });
        },
      }
    );
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal-loader {
    position: relative;
    text-align: center;
    color: $lightGrayOrange;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }

  .word {
    display: inline-block;
    margin-right: 8px;
    vertical-align: center;
    color: $lightGrayOrange;
  }

  .progress-container {
    width: 80%;
    max-width: 400px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: $softOrange;
    border-radius: 2px;
    transition: width 0.3s ease-out;
  }
</style>
