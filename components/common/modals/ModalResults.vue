<template>
  <div class="modal-results">
    <VButton
      class="modal-results__button"
      size="s"
      type="transparent"
      color="gray"
      @click="closeModalHandler"
    >
      <UseIcon class="modal-results__arrow" name="exit" :width="3.3" :height="2.4" />
      Выход
    </VButton>
    <NatalLoader v-if="!natalResult"></NatalLoader>
    <div v-else>
      {{ natalResult }}
    </div>
    <!-- <span v-if="showImage" class="finaltext">У Вас КАМЫШ!!!</span>
    <img v-if="showImage" src="@/assets/img/gorin.webp" class="image" /> -->
  </div>
</template>

<script setup>
  // const { $gsap } = useNuxtApp();
  // const textContainer = ref(null);
  // const showImage = ref(false);
  // const words = ['Идет', 'составление', 'Натальной', 'Карты', '.', '.', '.'];

  const emit = defineEmits(['closeModal']);
  const props = defineProps({
    natalResult: {
      type: String,
      default: '',
    },
  });

  const closeModalHandler = () => emit('closeModal');

  // onMounted(() => {
  //   const words = textContainer.value.querySelectorAll('.word');

  //   $gsap.fromTo(
  //     words,
  //     {
  //       opacity: 0,
  //       y: '50vh',
  //     },
  //     {
  //       opacity: 1,
  //       y: '50vh',
  //       duration: 1,
  //       stagger: 0.6,
  //       ease: 'power2.out',
  //       onComplete: () => {
  //         $gsap.delayedCall(2, () => {
  //           showImage.value = true;
  //           $gsap.to('.word', { opacity: 0, translateY: -600, duration: 0.3 });
  //           nextTick(() => {
  //             // $gsap.fromTo('.finaltext', { opacity: 0 }, { opacity: 1, duration: 1 });
  //             // $gsap.fromTo('.image', { opacity: 0 }, { opacity: 1, duration: 1 });
  //             $gsap.fromTo('.modal-results__button', { opacity: 0 }, { opacity: 1, duration: 1.4 });
  //           });
  //         });
  //       },
  //     }
  //   );
  // });
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .modal-results {
    position: relative;
    text-align: center;
    color: $lightGrayOrange;

    &__button {
      position: absolute;
      top: 2.4rem;
      left: 2.4rem;
      color: $gray;
      opacity: 0;
    }

    &__arrow {
      color: $softOrange;
    }
  }

  .word {
    display: inline-block;
    margin-right: 8px;
    vertical-align: center;
  }

  .image {
    max-width: 100%;
    margin: 20px auto 0;
  }
</style>
