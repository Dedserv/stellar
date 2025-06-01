declare global {
  interface Window {
    ym: (id: number, action: string, options?: any) => void;
  }
}

export default defineNuxtPlugin(() => {
  if (process.client) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';

    const firstScript = document.getElementsByTagName('script')[0];
    firstScript?.parentNode?.insertBefore(script, firstScript);

    window.ym =
      window.ym ||
      function () {
        (window.ym as any).a = (window.ym as any).a || [];
        (window.ym as any).a.push(arguments);
      };
    (window.ym as any).l = Date.now();

    window.ym(102321396, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }
});
