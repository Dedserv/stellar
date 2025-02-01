<template>
  <nav class="navigation">
    <button @click="onButtonClickHandler" class="navigation__btn">
      <UseIcon class="icon" name="burger" :width="1.5" :height="1.7" />
    </button>
    <ClientOnly>
      <Teleport :disabled="!$isMobile" to="#teleports">
        <TransitionGroup>
          <button
            @click="onButtonClickHandler"
            class="navigation__btn"
            :class="{ 'navigation__btn--show': isShowMenu }"
            key="navigation-close"
            v-show="(isShowMenu && $isMobile) || !$isMobile"
          >
            <UseIcon class="icon" name="close" :width="1.5" :height="1.7" />
          </button>
          <ul
            class="navigation__menu"
            v-show="(isShowMenu && $isMobile) || !$isMobile"
            key="navigation-menu"
          >
            <li v-for="(item, index) in navList" :key="`navigation_${index}`">
              <NuxtLink :href="item.link">{{ item.title }}</NuxtLink>
            </li>
          </ul>
        </TransitionGroup>
      </Teleport>
    </ClientOnly>
  </nav>
</template>

<script setup>
  const props = defineProps({
    navList: { type: Array, required: true },
    isShowMenu: { type: Boolean, default: false },
  });

  const emits = defineEmits(['menuClick']);
  const { $isMobile } = useNuxtApp();

  const onButtonClickHandler = () => {
    emits('menuClick', !props.isShowMenu);
  };
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .navigation {
    margin-left: auto;
    order: 1;

    @mixin tablet {
      margin-left: 0;
      order: 0;
    }

    &__btn {
      display: block;
      padding: 0.6rem;

      @mixin tablet {
        display: none;
      }

      &--show {
        position: fixed;
        top: 0.8rem;
        right: 1.2rem;
        z-index: 12;
        transform: translateY(50%);
      }
    }

    &__menu {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.8rem;
      background-color: $darkGrayBlue;
      color: $lightGrayOrange;
      font-size: 2.4rem;
      font-weight: 500;
      line-height: 1.5;
      padding-top: 6rem;

      @mixin tablet {
        position: static;
        flex-direction: row;
        font-size: 1.4rem;
        line-height: 2.2rem;
        background-color: transparent;
        padding: 0;
        gap: 3rem;
      }

      @mixin desktop {
        font-size: 1.6rem;
      }
    }

    .icon {
      color: $lightGrayOrange;
    }
  }

  .icon {
    width: 2rem;
    height: 2rem;
    color: $lightGrayOrange;
    fill: $lightGrayOrange;
  }

  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.6s ease;
  }

  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
</style>
