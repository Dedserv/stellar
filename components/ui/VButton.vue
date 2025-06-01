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
      validator: (val) => ['default', 'icons', 'transparent', 'bordered', 'squared'].includes(val),
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

    display: {
      type: String,
      default: 'flex',
      validator: (val) => ['flex', 'block'].includes(val),
    },

    iconName: {
      type: String,
      default: '',
    },

    withoutIconMargin: {
      type: Boolean,
      default: false,
    },

    fullsized: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    hover: {
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
    `button__display--${props.display}`,
    {
      button__fullsized: props.fullsized,
      button__rounded: props.rounded,
      button__disabled: props.disabled,
      'button__icon-margin': props.withoutIconMargin,
      button__hover: props.hover,
    },
  ]);
  const isIcons = computed(() => props.iconName && props.type === 'icons');
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .button {
    position: relative;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease-in;
    -webkit-tap-highlight-color: transparent;

    &__color {
      &--primary {
        color: $darkOrange;
        background-color: $lightGrayOrange;
      }

      &--gray {
        color: $gray;
      }

      &--secondary {
        color: $lightGrayOrange;
      }

      &--bright {
        background-color: $lightGrayOrange;
        color: $darkGrayBlue;

        &:hover {
          background-color: $whiteOrange;
        }
      }
    }

    &__type {
      &--transparent {
        background-color: transparent;
      }

      &--bordered {
        border: 1px solid transparent;
        background-color: transparent;

        &::after,
        &::before {
          content: '';
          position: absolute;
          border: 1px solid hsla(21, 30%, 91%, 0.3);
          border-radius: 4px;
          transition:
            top 0.3s,
            bottom 0.3s,
            left 0.3s,
            right 0.3s;
        }

        &::after {
          top: 0;
          left: -4px;
          right: -4px;
          bottom: 0;
        }

        &::before {
          top: -4px;
          bottom: -4px;
          left: 0;
          right: 0;
        }

        &:hover {
          &::after {
            top: -4px;
            bottom: -4px;
          }

          &::before {
            left: -4px;
            right: -4px;
          }
        }
      }

      &--squared {
        border: 1px solid transparent;

        &::before {
          content: '';
          position: absolute;
          border: 1px solid hsla(21, 30%, 91%, 0.3);
          border-radius: 4px;
          transition:
            top 0.3s,
            bottom 0.3s,
            left 0.3s,
            right 0.3s;
        }

        &::before {
          top: -4px;
          bottom: -4px;
          left: 0;
          right: 0;
        }

        &:hover {
          &::before {
            left: -4px;
            right: -4px;
          }
        }
      }
    }

    &__display {
      &--flex {
        display: flex;
      }

      &--block {
        display: block;
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
        font-weight: 400;
        line-height: 1.4;
        padding: 0.6rem 1.6rem;
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

    &__disabled {
      pointer-events: none;
      opacity: 0.4;
    }

    &__rounded {
      border-radius: 0.4rem;
    }

    &__icon-margin {
      gap: 0;
    }

    &__fullsized {
      width: 100%;
    }

    &__hover {
      &:hover {
        opacity: 0.8;
      }
    }
  }
</style>
