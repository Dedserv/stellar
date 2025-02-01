import { useWindowSize } from '@vueuse/core';

export default defineNuxtPlugin((nuxtApp) => {
  const isMobile = ref(false);
  const { width } = useWindowSize();

  if (process.server) {
    const ua = nuxtApp.ssrContext?.event.node.req.headers['user-agent'] || '';
    isMobile.value = /mobile/i.test(ua);
  } else {
    watchEffect(() => {
      isMobile.value = width.value < 768;
    });
  }

  return { provide: { isMobile } };
});
