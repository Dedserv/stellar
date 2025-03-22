// https://nuxt.com/docs/api/configuration/nuxt-config

import path from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@vueuse/nuxt', '@pinia/nuxt', 'nuxt-swiper', '@nuxt/icon'],
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
