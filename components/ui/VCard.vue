<template>
  <component :is="tag" :to="props.link" :class="['card', classList, { 'card--link': props.link }]">
    <div class="card__wrapper">
      <div class="card__img-wrapper">
        <img loading="lazy" class="card__img" :src="props.img" :alt="title" />
      </div>
      <img
        v-if="props.type !== 'transparent'"
        loading="lazy"
        class="card__bg"
        src="/img/bg.webp"
        alt=""
      />
    </div>
    <div class="card__title-wrapper">
      <UseIcon
        v-if="props.type === 'transparent'"
        :width="1.2"
        :height="1.2"
        name="starTiny"
        class="card__icon"
      />
      <h4 v-if="props.title" class="card__title">{{ props.title }}</h4>
      <UseIcon
        v-if="props.type === 'transparent'"
        :width="1.2"
        :height="1.2"
        name="starTiny"
        class="card__icon"
      />
    </div>
    <span v-if="props.description" class="card__description">{{ props.description }}</span>
    <p v-if="props.text" class="card__text" v-html="props.text" />
  </component>
</template>

<script setup>
  import { NuxtLink } from '#components';

  const props = defineProps({
    img: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: '',
    },

    description: {
      type: String,
      default: '',
    },

    text: {
      type: String,
      default: '',
    },

    type: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'hover', 'transparent', 'textInside'].includes(value),
    },

    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value),
    },

    bordered: {
      type: Boolean,
      default: false,
    },

    rounded: {
      type: Boolean,
      default: false,
    },

    link: {
      type: String,
      default: '',
    },
  });

  const tag = computed(() => (props.link ? NuxtLink : 'div'));

  const classList = computed(() => [
    `card__type--${props.type}`,
    `card__size--${props.size}`,
    { 'card--bordered': props.bordered, 'card--rounded': props.rounded },
  ]);
</script>

<style scoped>
  @import '~/assets/css/variables.css';

  .card {
    position: relative;
    z-index: 1;
    transition: all 0.3s ease-in;
    overflow: hidden;

    @mixin tablet {
      min-width: 26rem;
    }

    @mixin desktop {
      flex: 1 1;
    }

    &__type {
      &--hover {
        &:hover {
          @mixin desktop {
            .card__text {
              opacity: 1;
            }

            .card__img-wrapper {
              opacity: 0;
            }

            .card__bg {
              opacity: 0;
            }
          }
        }

        .card__img-wrapper {
          cursor: url('/img/star.svg'), auto;
        }
      }

      &--default {
        .card__wrapper {
          padding: 0;
        }
      }

      &--textInside {
        .card__img-wrapper {
          padding: 0.8rem 3.2rem 5.6rem;
        }

        .card__img {
          @mixin desktop {
            max-height: none;
          }
        }

        .card__title {
          position: absolute;
          bottom: 2.4rem;
          left: 50%;
          transform: translate(-50%, 0);
          font-size: 1.4rem;
          font-weight: normal;
        }
      }

      &--transparent {
        background-color: transparent;
      }
    }

    &__size {
      &--small {
        min-width: 15rem;

        @mixin tablet {
          min-width: 20rem;
        }

        @mixin desktop {
          flex: 1 1;
        }
      }

      &--medium {
        min-width: 22rem;

        @mixin tablet {
          min-width: 26rem;
        }

        @mixin desktop {
          flex: 1 1;
        }
      }

      &--large {
        min-width: 28rem;

        @mixin tablet {
          min-width: 26rem;
        }

        @mixin desktop {
          flex: 1 1;
        }
      }
    }

    &--link {
      &::after {
        display: none;
      }

      &:hover {
        img {
          transform: scale(1.1);
        }
      }
    }

    &--bordered {
      .card__img-wrapper {
        border: 1px solid $innertOrange;
      }
    }

    &--rounded {
      border-radius: 1.2rem;
    }

    &__wrapper {
      position: relative;
      /* padding: 1.2rem; */
      margin-bottom: 1.2rem;
      border-radius: 1.2rem;
      background-color: $darkBlue;
    }

    &__img-wrapper {
      position: relative;
      z-index: 2;
      opacity: 1;
      border-radius: 1.2rem;
      overflow: hidden;
      transition: opacity 0.3s ease-in;
    }

    &__img {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      max-height: 60vh;
      transition: transform 0.3s ease-in;
      transform: scale(1);

      @mixin desktop {
        max-height: 100%;
      }
    }

    &__title-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }

    &__title {
      margin: 0;
      font-weight: 700;
      font-size: 1.6rem;
      line-height: 1.5;
      color: $primaryWhite;
    }

    &__icon {
      opacity: 0;
      transition: opacity 0.3s ease-in;
    }

    &__description {
      font-size: 1.4rem;
      line-height: 1.5;
      color: $gray;
    }

    &__text {
      position: absolute;
      opacity: 0;
      top: 50%;
      left: 6%;
      right: 6%;
      transform: translate(0, -50%);
      color: $lightGrayOrange;
      font-size: 1.6rem;
      line-height: 1.4;
      text-align: center;
      transition: opacity 0.3s ease-in;
      user-select: none;
    }

    &__bg {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      display: block;
      width: 100%;
      height: 100%;
      opacity: 1;
      transition: opacity 0.3s ease-in;
      object-fit: cover;
      border-radius: 1.2rem;
    }
  }
</style>
