<template>
  <header class="header">
    <div class="header__wrapper container">
      <UseIcon ref="star" class="header__logo" name="star" :width="3.6" :height="3.6" />
      <NavMenu :isShowMenu="isMenuOpen" :navList="menuNav" @menuClick="onMenuClick"></NavMenu>
      <VButton
        class="header__button"
        type="icons"
        iconName="thinStar"
        rounded
        @click="openModalHandler"
      >
        Пройти тест
      </VButton>
    </div>
  </header>
</template>

<script setup>
  import { menuNav } from '~/assets/js/mockMenu';
  const { $gsap } = useNuxtApp();

  import { modalStore } from '~/stores/modal';

  import VButton from '../ui/VButton.vue';

  const isModalShow = modalStore();

  const star = ref(null);
  const isMenuOpen = ref(false);

  onMounted(() => {
    nextTick(() => {
      $gsap.to(star.value.iconRef, { duration: 2, rotate: 60 });
    });
  });

  const openModalHandler = () => {
    isModalShow.openModal(true);
  };

  const onMenuClick = (isClicked) => {
    isMenuOpen.value = isClicked;
  };
</script>
<style lang="css" scoped>
  @import '~/assets/css/variables.css';

  .header {
    background-color: $darkBlack;
    color: $primaryWhite;
    padding: 2.2rem 1.2rem;
    position: fixed;
    z-index: 10;
    left: 0;
    right: 0;
    top: 0;

    &__wrapper {
      display: flex;
      align-items: center;
      width: 100%;
    }

    &__logo {
      display: none;

      @mixin tablet {
        position: relative;
        z-index: 10;
        display: block;
        color: $softOrange;
        margin-right: 3.6rem;
      }
    }

    &__button {
      order: 0;
      position: relative;
      z-index: 10;

      @mixin tablet {
        margin-left: auto;
      }
    }
  }
</style>
