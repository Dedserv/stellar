import type { PersonalityTestResponse } from '~/types/personality';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  if (!import.meta.client) return Promise.resolve(null);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export function useShareCard() {
  const feedbackKind = ref<'none' | 'copied' | 'shared'>('none');
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  const buttonLabel = computed(() => {
    if (feedbackKind.value === 'copied') return 'Ссылка скопирована';
    if (feedbackKind.value === 'shared') return 'Готово';
    return 'Поделиться';
  });

  const liveMessage = computed(() => {
    if (feedbackKind.value === 'copied') return 'Ссылка скопирована';
    if (feedbackKind.value === 'shared') return 'Поделились';
    return '';
  });

  function showFeedback(kind: 'copied' | 'shared') {
    feedbackKind.value = kind;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      feedbackKind.value = 'none';
    }, 2500);
  }

  function getShareUrl(archetypeId: string) {
    const config = useRuntimeConfig();
    const origin = config.public.NUXT_SITE_URL || 'https://www.stellara.ru';
    const params = new URLSearchParams({
      archetypeId,
      utm_source: 'share',
      utm_medium: 'card',
    });
    return `${origin}/personality-result?${params.toString()}`;
  }

  async function generateShareCard(result: PersonalityTestResponse): Promise<Blob | null> {
    if (!import.meta.client) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#0d0804');
    gradient.addColorStop(1, '#141520');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    const logo = await loadImage('/favicon.svg');
    if (logo) {
      ctx.drawImage(logo, 80, 48, 48, 48);
    }

    ctx.fillStyle = '#e9a87c';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('STELLARA', logo ? 140 : 80, 90);

    ctx.fillStyle = '#fafafa';
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText(result.archetype, 80, 220);

    ctx.fillStyle = '#e0d9d4';
    ctx.font = '36px sans-serif';
    ctx.fillText(`${result.zodiacSign} · ${result.element.name}`, 80, 290);

    ctx.fillStyle = '#bebec9';
    ctx.font = '28px sans-serif';
    const advice = result.content.cosmicAdvice.slice(0, 90);
    ctx.fillText(advice, 80, 380);

    ctx.fillStyle = '#bebec9';
    ctx.font = '24px sans-serif';
    ctx.fillText(getShareUrl(result.archetypeId), 80, 560);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  async function shareResult(result: PersonalityTestResponse) {
    const shareUrl = getShareUrl(result.archetypeId);
    const blob = await generateShareCard(result);

    try {
      if (blob && navigator.share) {
        const file = new File([blob], 'stellara-archetype.png', { type: 'image/png' });
        await navigator.share({
          title: `Мой архетип — ${result.archetype}`,
          text: result.content.cosmicAdvice,
          url: shareUrl,
          files: [file],
        });
        showFeedback('shared');
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
    }

    if (blob) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `stellara-${result.archetypeId}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
      showFeedback('copied');
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    showFeedback('copied');
  }

  onBeforeUnmount(() => {
    if (resetTimer) clearTimeout(resetTimer);
  });

  return {
    buttonLabel,
    liveMessage,
    shareResult,
    getShareUrl,
  };
}
