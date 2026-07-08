// https://nuxt.com/docs/api/configuration/nuxt-config

import path from 'path';

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  modules: ['@vueuse/nuxt', '@pinia/nuxt', 'nuxt-swiper', '@nuxt/icon', '@nuxtjs/sitemap'],
  sitemap: {
    urls: [
      {
        loc: '/personality-test',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.9,
      },
      {
        loc: '/personality-result',
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      },
      {
        loc: '/article/1',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: '/article/2',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
      {
        loc: '/article/3',
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: 0.8,
      },
    ],
    exclude: ['/generate', '/data/**', '/data/generated/**'],
  },
  nitro: {
    serverAssets: [
      {
        baseName: 'personality-test',
        dir: './data/generated/personality-test',
      },
    ],
  },
  routeRules: {
    '/natalchart': { redirect: '/personality-test' },
  },
  app: {
    head: {
      title: 'Stellara — Астрологический тест личности',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'yandex-verification', content: '8b36944b572dd4a7' },
        {
          hid: 'description',
          name: 'description',
          content:
            'Пройдите астрологический тест личности и узнайте свой архетип. 12 вопросов и дата рождения — персональный портрет, баланс стихий и космический совет.',
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content:
            'астрологический тест, архетип личности, астрология, гороскоп, тест личности, стихии',
        },
        { property: 'og:title', content: 'Stellara — Астрологический тест личности' },
        {
          property: 'og:description',
          content:
            'Пройдите астрологический тест личности и узнайте свой архетип. 12 вопросов и дата рождения — персональный портрет, баланс стихий и космический совет.',
        },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://www.stellara.ru' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Stellara — Астрологический тест личности' },
        {
          name: 'twitter:description',
          content:
            'Пройдите астрологический тест личности и узнайте свой архетип. 12 вопросов и дата рождения — персональный портрет, баланс стихий и космический совет.',
        },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'Stellara' },
        { name: 'format-detection', content: 'telephone=no' },
        {
          hid: 'application-name',
          name: 'application-name',
          content: 'Stellara',
        },
        {
          hid: 'theme-color',
          name: 'theme-color',
          content: '#141520',
        },
        {
          hid: 'msapplication-TileColor',
          name: 'msapplication-TileColor',
          content: '#141520',
        },
      ],
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Stellara',
            url: 'https://www.stellara.ru',
            description: 'Астрологический тест личности и персональный гороскоп',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.stellara.ru/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Stellara',
            url: 'https://www.stellara.ru',
            logo: 'https://www.stellara.ru/logo.svg',
            sameAs: ['https://www.stellara.ru'],
          }),
        },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.svg' },
        { rel: 'canonical', href: 'https://www.stellara.ru' },
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
      autoprefixer: {},
      'postcss-mixins': {
        mixinsDir: path.resolve(__dirname, 'assets/css'),
      },
    },
  },
  runtimeConfig: {
    deepseekApiKey: '',
    public: {
      NUXT_SITE_URL: 'https://www.stellara.ru',
      NUXT_SITE_NAME: 'Stellara',
    },
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
      include: ['gsap'],
    },
  },
  devtools: { enabled: true },
});
