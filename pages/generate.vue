<template>
  <h1>generate</h1>
</template>

<script setup>
  // Запрещаем индексацию страницы генерации данных
  useHead({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { name: 'googlebot', content: 'noindex, nofollow' },
      { name: 'bingbot', content: 'noindex, nofollow' },
      { name: 'yandex', content: 'noindex, nofollow' },
    ],
  });

  onMounted(async () => {
    setTimeout(async () => {
      await $fetch('/api/generateBlocks', {
        method: 'POST',
        body: { category: 'planet_sign', options: { delayMs: 1000, variants: 12 } },
      });
    }, 2000);
  });
</script>

<style scoped></style>
