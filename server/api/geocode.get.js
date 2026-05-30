import { defineEventHandler, getQuery, createError } from 'h3';
import { estimateTimezoneFromLongitude } from '~/server/utils/astroUtils.js';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.yaGeocodeApi || process.env.NUXT_YA_GEOCODE_API;

  const query = getQuery(event);
  const city = typeof query.city === 'string' ? query.city.trim() : '';

  if (!city) {
    throw createError({ statusCode: 400, message: 'Missing city parameter' });
  }

  if (!apiKey) {
    throw createError({ statusCode: 500, message: 'Yandex API key is not configured' });
  }

  try {
    const response = await $fetch('https://geocode-maps.yandex.ru/v1/', {
      query: {
        apikey: apiKey,
        geocode: city,
        format: 'json',
        lang: 'ru_RU',
        results: 1,
      },
    });

    const member = response?.response?.GeoObjectCollection?.featureMember?.[0];
    const geoObject = member?.GeoObject;

    if (!geoObject?.Point?.pos) {
      throw createError({ statusCode: 404, message: 'City not found' });
    }

    const [lonStr, latStr] = geoObject.Point.pos.split(' ');
    const latitude = parseFloat(latStr);
    const longitude = parseFloat(lonStr);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw createError({ statusCode: 502, message: 'Invalid geocoder response' });
    }

    const resolvedCity =
      geoObject.metaDataProperty?.GeocoderMetaData?.text || geoObject.name || city;

    return {
      latitude,
      longitude,
      timezone: estimateTimezoneFromLongitude(longitude),
      city: resolvedCity,
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }

    console.error('Geocode API error:', error);
    throw createError({
      statusCode: error.response?.status || 502,
      message: 'Failed to geocode city',
    });
  }
});
