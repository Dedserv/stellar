const REQUIRED_KEYS = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'latitude',
  'longitude',
  'timezone',
];

const SHARE_TITLE = 'Моя натальная карта | Stellara';

function hasQueryValue(value) {
  return value != null && value !== '';
}

/**
 * Строит абсолютный URL для шаринга текущей натальной карты из query-параметров маршрута.
 */
export function useChartShareUrl() {
  const route = useRoute();
  const requestURL = useRequestURL();
  const { copy } = useClipboard({ legacy: true });

  const canShare = computed(() =>
    REQUIRED_KEYS.every((key) => hasQueryValue(route.query[key])),
  );

  const shareParams = computed(() => {
    const params = {};
    for (const key of REQUIRED_KEYS) {
      params[key] = String(route.query[key]);
    }
    if (hasQueryValue(route.query.city)) {
      params.city = String(route.query.city);
    }
    return params;
  });

  const shareUrl = computed(() => {
    if (!canShare.value) return '';

    const search = new URLSearchParams(shareParams.value).toString();
    const origin = import.meta.client ? window.location.origin : requestURL.origin;
    return `${origin}/natalchart?${search}`;
  });

  async function copyToClipboard() {
    if (!shareUrl.value) return false;
    await copy(shareUrl.value);
    return true;
  }

  async function shareNative() {
    if (!import.meta.client || !navigator.share || !shareUrl.value) {
      return false;
    }

    await navigator.share({
      url: shareUrl.value,
      title: SHARE_TITLE,
    });

    return true;
  }

  return {
    shareUrl,
    canShare,
    copyToClipboard,
    shareNative,
  };
}
