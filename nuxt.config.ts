// https://nuxt.com/docs/api/configuration/nuxt-config

import path from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@vueuse/nuxt', '@pinia/nuxt', 'nuxt-swiper', '@nuxt/icon'],
  app: {
    head: {
      title: 'Stellara - Ваша персональная натальная карта',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'yandex-verification', content: '8b36944b572dd4a7' },
        {
          hid: 'description',
          name: 'description',
          content:
            'Узнайте свою натальную карту и получите персональный астрологический прогноз. Составьте натальную карту онлайн и раскройте тайны своей судьбы.',
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content:
            'натальная карта, астрология, гороскоп, астрологический прогноз, составление натальной карты',
        },
        { property: 'og:title', content: 'Stellara - Ваша персональная натальная карта' },
        {
          property: 'og:description',
          content:
            'Узнайте свою натальную карту и получите персональный астрологический прогноз. Составьте натальную карту онлайн и раскройте тайны своей судьбы.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://stellara.ru' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Stellara - Ваша персональная натальная карта' },
        {
          name: 'twitter:description',
          content:
            'Узнайте свою натальную карту и получите персональный астрологический прогноз. Составьте натальную карту онлайн и раскройте тайны своей судьбы.',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'Stellara' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'canonical', href: 'https://stellara.ru' },
      ],
    },
  },
  postcss: {
    plugins: {
      'postcss-import': {}, // Позволяет использовать @import
      'postcss-simple-vars': {}, // Работает с $переменными
      'postcss-nested': {}, // Позволяет вложенные правила
      'postcss-sorting': {}, // Упорядочивает стили
      'postcss-custom-properties': {},
      'postcss-mixins': {
        mixinsDir: path.resolve(__dirname, 'assets/css'),
      },
    },
  },
  runtimeConfig: {
    yaKey: process.env.YA_API,
    deepseekApiKey: process.env.DEEPSEEK_API,
  },
  ssr: true,
  plugins: [{ src: '~/plugins/gsap.client.js', mode: 'client' }],
  devServer: {
    host: '0.0.0.0', // Доступен на всех сетевых интерфейсах
    port: 3000, // Порт, на котором будет запущен сервер
  },
  css: [
    'assets/css/main.css', // основной файл стилей
  ],
  alias: {
    '@': path.resolve(__dirname, './'),
  },
  components: [
    {
      path: '~/components', // Путь к папке components
      pathPrefix: false, // Отключает префикс для вложенных папок
    },
  ],
  vite: {
    optimizeDeps: {
      include: ['gsap'], // Для правильного дерева зависимостей
    },
  },
  devtools: { enabled: true },
});
