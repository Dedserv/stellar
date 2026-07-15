import type { ElementScores, PersonalityTestResponse } from '~/types/personality';

const CARD_SIZE = 320;
const MAX_ELEMENT_SCORE = 14;

const ELEMENT_AXES = [
  { key: 'fire' as const, label: 'Огонь', color: '#e9a87c' },
  { key: 'earth' as const, label: 'Земля', color: '#917f5a' },
  { key: 'air' as const, label: 'Воздух', color: '#b388ff' },
  { key: 'water' as const, label: 'Вода', color: '#7eb8da' },
];

const ELEMENT_NAME_TO_KEY: Record<string, keyof ElementScores> = {
  Огонь: 'fire',
  Земля: 'earth',
  Воздух: 'air',
  Вода: 'water',
};

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function resolveRadarScores(result: PersonalityTestResponse): {
  scores: ElementScores;
  personalized: boolean;
} {
  const { fire, earth, air, water } = result.elements;
  const total = fire + earth + air + water;

  if (total > 0) {
    return { scores: result.elements, personalized: true };
  }

  // Guest / shared link: highlight zodiac element, soft baseline for others
  const dominant = ELEMENT_NAME_TO_KEY[result.element.name] ?? 'fire';
  const scores: ElementScores = { fire: 3, earth: 3, air: 3, water: 3 };
  scores[dominant] = MAX_ELEMENT_SCORE;
  return { scores, personalized: false };
}

function axisPoint(cx: number, cy: number, radius: number, index: number, ratio: number) {
  const angle = -Math.PI / 2 + (index * Math.PI) / 2;
  return {
    x: cx + Math.cos(angle) * radius * ratio,
    y: cy + Math.sin(angle) * radius * ratio,
  };
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  minSize: number
) {
  let size = startSize;
  ctx.font = `italic 400 ${size}px "Alegreya Sans SC", Georgia, serif`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `italic 400 ${size}px "Alegreya Sans SC", Georgia, serif`;
  }
  return size;
}

function drawElementsRadar(
  ctx: CanvasRenderingContext2D,
  scores: ElementScores,
  cx: number,
  cy: number,
  radius: number
) {
  // Soft glow behind chart
  const glow = ctx.createRadialGradient(cx, cy, 8, cx, cy, radius + 24);
  glow.addColorStop(0, 'rgba(233, 168, 124, 0.14)');
  glow.addColorStop(0.55, 'rgba(179, 136, 255, 0.06)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 24, 0, Math.PI * 2);
  ctx.fill();

  // Grid rings
  for (const ring of [0.35, 0.65, 1]) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const p = axisPoint(cx, cy, radius, i, ring);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axes
  for (let i = 0; i < 4; i++) {
    const tip = axisPoint(cx, cy, radius, i, 1);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(tip.x, tip.y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data polygon
  const points = ELEMENT_AXES.map((axis, i) => {
    const ratio = Math.min(1, Math.max(0, scores[axis.key] / MAX_ELEMENT_SCORE));
    return axisPoint(cx, cy, radius, i, Math.max(ratio, 0.08));
  });

  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();

  const fill = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  fill.addColorStop(0, 'rgba(233, 168, 124, 0.35)');
  fill.addColorStop(1, 'rgba(179, 136, 255, 0.28)');
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(233, 168, 124, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Vertex dots + labels (offset per side so bottom label clears eyebrow)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ELEMENT_AXES.forEach((axis, i) => {
    const tip = points[i];
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = axis.color;
    ctx.fill();

    const labelRadius = i === 0 ? radius + 14 : i === 2 ? radius + 14 : radius + 18;
    const labelPos = axisPoint(cx, cy, labelRadius, i, 1);
    // Nudge side labels horizontally so they don't clip
    const nudgeX = i === 1 ? 8 : i === 3 ? -8 : 0;
    const nudgeY = i === 0 ? -2 : i === 2 ? 4 : 0;
    ctx.fillStyle = '#bebec9';
    ctx.font = '500 10px "Alegreya Sans SC", sans-serif';
    ctx.fillText(axis.label, labelPos.x + nudgeX, labelPos.y + nudgeY);
  });
}

function drawShareCardCanvas(ctx: CanvasRenderingContext2D, result: PersonalityTestResponse, size: number) {
  ctx.fillStyle = '#141520';
  drawRoundRect(ctx, 0, 0, size, size, 12);
  ctx.fill();

  // Clip content to rounded card
  ctx.save();
  drawRoundRect(ctx, 0, 0, size, size, 12);
  ctx.clip();

  const { scores, personalized } = resolveRadarScores(result);
  drawElementsRadar(ctx, scores, size / 2, 102, 54);

  ctx.fillStyle = '#e9a87c';
  ctx.font = '400 10px "Alegreya Sans SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(personalized ? 'ТВОЙ БАЛАНС СТИХИЙ' : 'СТИХИЯ ТВОЕГО ЗНАКА', size / 2, 188);

  const gradient = ctx.createLinearGradient(40, 200, size - 40, 240);
  gradient.addColorStop(0, '#fafafa');
  gradient.addColorStop(0.5, '#e0d9d4');
  gradient.addColorStop(1, '#e9a87c');
  ctx.fillStyle = gradient;
  const titleSize = fitText(ctx, result.archetype, size - 48, 34, 22);
  ctx.font = `italic 400 ${titleSize}px "Alegreya Sans SC", Georgia, serif`;
  ctx.fillText(result.archetype, size / 2, 222);

  ctx.fillStyle = '#bebec9';
  ctx.font = '400 11px "Alegreya Sans SC", sans-serif';
  ctx.fillText(
    `${result.zodiacSign} · ${result.element.name} · ${result.modality}`,
    size / 2,
    248
  );

  if (!personalized) {
    ctx.fillStyle = '#a3a4a6';
    ctx.font = '400 9px "Alegreya Sans SC", sans-serif';
    ctx.fillText('Пройди тест — узнай свой баланс', size / 2, 270);
  }

  ctx.fillStyle = '#a3a4a6';
  ctx.font = '400 9px "Alegreya Sans SC", sans-serif';
  ctx.fillText('stellara.ru', size / 2, personalized ? 288 : 296);

  ctx.restore();
}

export function useShareCard() {
  const feedbackKind = ref<'none' | 'copied' | 'shared'>('none');
  const previewUrl = ref('');
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

  function revokePreviewUrl() {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
      previewUrl.value = '';
    }
  }

  function getShareUrl(archetypeId: string) {
    const config = useRuntimeConfig();
    const siteUrl = config.public.NUXT_SITE_URL;
    const origin =
      typeof siteUrl === 'string' && siteUrl ? siteUrl : 'https://www.stellara.ru';
    const params = new URLSearchParams({
      archetypeId,
      utm_source: 'share',
      utm_medium: 'card',
    });
    return `${origin}/personality-result?${params.toString()}`;
  }

  function createCardCanvas(result: PersonalityTestResponse): HTMLCanvasElement | null {
    if (!import.meta.client) return null;

    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.width = CARD_SIZE * dpr;
    canvas.height = CARD_SIZE * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(dpr, dpr);
    drawShareCardCanvas(ctx, result, CARD_SIZE);
    return canvas;
  }

  async function generateShareCard(result: PersonalityTestResponse): Promise<Blob | null> {
    const canvas = createCardCanvas(result);
    if (!canvas) return null;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  function buildPreviewUrl(result: PersonalityTestResponse) {
    if (!import.meta.client) return;

    const canvas = createCardCanvas(result);
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      revokePreviewUrl();
      previewUrl.value = URL.createObjectURL(blob);
    }, 'image/png');
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
    revokePreviewUrl();
  });

  return {
    buttonLabel,
    liveMessage,
    previewUrl,
    shareResult,
    getShareUrl,
    buildPreviewUrl,
  };
}
