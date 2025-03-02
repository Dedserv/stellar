const config = useRuntimeConfig();

const initialParams = {
  apikey: config.yaKey,
  lang: 'ru_RU',
  type: 'geo',
  results: 10,
};

export default defineEventHandler(async (event) => {
  const params = getQuery(event);

  if (!params) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing yandex suggest parameter',
    });
  }
  try {
    return $fetch('https://suggest-maps.yandex.ru/v1/suggest', {
      params: {
        ...initialParams,
        ...params,
      },
    });
  } catch (error) {
    console.error('Yandex API error:', error);
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: 'Failed to fetch suggestions',
    });
  }
});
