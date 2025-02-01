<template>
  <component :is="tag" :class="classList">
    <UseIcon v-if="isIcons" class="button__icon" name="thinStar" :width="1.8" :height="1.8" />
    <slot></slot>
    <UseIcon v-if="isIcons" class="button__icon" name="thinStar" :width="1.8" :height="1.8" />
  </component>
</template>

<script setup>
  const props = defineProps({
    href: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      default: 'default',
      validator: (val) => ['default', 'icons', 'transparent'].includes(val),
    },

    color: {
      type: String,
      default: 'primary',
    },

    size: {
      type: String,
      default: 'm',
      validator: (val) => ['s', 'm', 'default'].includes(val),
    },

    iconName: {
      type: String,
      default: '',
    },

    fullsized: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },
  });

  const tag = computed(() => (props.href ? 'NuxtLink' : 'button'));
  const classList = computed(() => [
    'button',
    `button__color--${props.color}`,
    `button__size--${props.size}`,
    `button__type--${props.type}`,
    { button__fullsized: props.fullsized },
    { button__rounded: props.rounded },
  ]);
  const isIcons = computed(() => props.iconName && props.type === 'icons');
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in;

    &__color {
      &--primary {
        color: $darkOrange;
        background-color: $lightGrayOrange;
      }

      &--gray {
        color: $gray;
      }
    }

    &__type {
      &--transparent {
        background-color: transparent;
      }
    }

    &__size {
      &--s {
        font-size: 1.4rem;
        font-weight: 400;
        gap: 0.6rem;
        padding: 0.6rem;
        line-height: 1.4;

        @mixin tablet {
          font-size: 1.6rem;
        }
      }

      &--m {
        font-size: 1.6rem;
        font-weight: 700;
        line-height: 1.4;
        padding: 0.6rem;
        gap: 0.4rem;

        .button__type--icons {
          width: 1.4rem;
          height: 1.4rem;
        }

        @mixin tablet {
          font-size: 1.8rem;
          gap: 0.6rem;

          .button__type--icons {
            width: 1.8rem;
            height: 1.8rem;
          }
        }
      }
    }

    &__rounded {
      border-radius: 0.4rem;
    }

    &__fullsized {
      width: 100%;
    }
  }
</style>
