<template>
  <div class="modal-header">
    <VButton class="modal-header__button" size="s" type="transparent" color="gray">
      <UseIcon class="modal-header__arrow" name="arrow" :width="10" :height="0.8" />
      вернуться на главную
    </VButton>
    <div class="modal-header__logo">
      <svg class="modal-header__circle" width="104" height="104" viewBox="0 0 104 104">
        <circle ref="circle" cx="51" cy="51" r="50" />
      </svg>
      <div ref="star" class="icon-wrapper">
        <UseIcon ref="star" class="modal-header__star" name="star" :width="8" :height="8" />
      </div>
    </div>
    <div class="modal-header__counter">1 / 10</div>
  </div>
</template>

<script setup>
  import gsap from 'gsap';

  const circle = ref(null);
  const star = ref(null);

  onMounted(() => {
    gsap.to(circle.value, {
      strokeDashoffset: 0, // Полностью отрисовываем круг
      duration: 3,
      delay: 3.2,
      ease: 'circ.in',
      opacity: 1,
    });

    gsap.to(star.value, {
      opacity: 1,
      scale: 1,
      duration: 3,
      delay: 0.2,
      ease: 'power3.in',
    });
  });
</script>

<style scoped>
  @import '~/assets/css/variables.css';
  .modal-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: $gray;
    padding-bottom: 2.4rem;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0.6rem;
      width: calc(100% - 1.2rem);
      height: 1px;
      background-color: $blackOrange;
    }

    &__arrow {
      color: $softOrange;
    }

    &__button {
      &:hover {
        opacity: 0.8;
      }
    }

    &__logo {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: $softOrange;
      width: 10.4rem;
      height: 10.4rem;
    }

    &__counter {
      padding: 0.6rem;
    }

    &__circle {
      position: absolute;
      top: 0;
      left: 0;

      circle {
        opacity: 0.4;
        fill: none;
        stroke: $softOrange;
        stroke-width: 1;
        stroke-linecap: round;
        stroke-dasharray: 502; /* Длина окружности (примерно 2πr) */
        stroke-dashoffset: 502; /* Начально скрываем круг */
      }
    }
  }

  .icon-wrapper {
    opacity: 0;
    transform: scale(0);
  }
</style>
