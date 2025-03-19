<template>
  <div class="modal-loader">
    <div ref="textContainer">
      <span v-for="(word, index) in words" :key="index" class="word">{{ word }}</span>
    </div>
  </div>
</template>

<script setup>
  const { $gsap } = useNuxtApp();
  const textContainer = ref(null);
  const showImage = ref(false);
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
        duration: 1,
        stagger: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          // Анимация для последних трех точек
          const dots = Array.from(words).slice(-3);
          $gsap.to(dots, {
            y: '-=2', // Двигаем точки вверх
            duration: 0.5,
            repeat: -1, // Бесконечное повторение
            yoyo: true, // Движение вверх и вниз
            ease: 'power1.inOut',
          });

          //   $gsap.delayedCall(2, () => {
          //     showImage.value = true;
          //     $gsap.to('.word', { opacity: 0, translateY: -600, duration: 0.3 });
          //   });
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
  }

  .word {
    display: inline-block;
    margin-right: 8px;
    vertical-align: center;
    color: $lightGrayOrange;
  }
</style>
