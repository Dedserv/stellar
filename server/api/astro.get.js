import { defineEventHandler, getQuery, createError } from 'h3';
import SwissEph from 'swisseph-wasm';
import {
  PLANET_CODES,
  PLANET_NAMES,
  getSignFromLongitude,
  getAspect,
  getHouseForPlanet,
  normalizeLongitude,
  localTimeToJulianDay,
  computePlacidusHouses,
} from '~/server/utils/astroUtils.js';
import {
  getPlanetDescription,
  getAspectDescription,
  getSignPairComboDescription,
} from '~/server/utils/jsonLoader.js';
import { buildHighlights } from '~/server/utils/insights/index.js';

/** Fallback для аспекта, когда описание не найдено в данных */
const ASPECT_DESCRIPTION_FALLBACK = {
  type: 'fallback',
  description: {
    short: 'Описание скоро появится',
    full: 'Мы добавим интерпретацию для этой пары планет',
    needs_review: true,
  },
};

export default defineEventHandler(async (event) => {
  if (!process.server) {
    throw createError({ statusCode: 500, message: 'Server-only endpoint' });
  }

  try {
    // Получаем параметры из query
    const query = getQuery(event);
    const year = parseInt(query.year) || 2000;
    const month = parseInt(query.month) || 1;
    const day = parseInt(query.day) || 1;
    const hour = parseFloat(query.hour) || 12;
    const minute = parseFloat(query.minute) || 0;
    const latitude = parseFloat(query.latitude) || 0;
    const longitude = parseFloat(query.longitude) || 0;
    const timezone = parseFloat(query.timezone) || 0;
    const city = typeof query.city === 'string' ? query.city.trim() : '';

    // Валидация входных данных
    if (year < 1900 || year > 2100) {
      throw createError({ statusCode: 400, message: 'Invalid year' });
    }
    if (month < 1 || month > 12) {
      throw createError({ statusCode: 400, message: 'Invalid month' });
    }
    if (day < 1 || day > 31) {
      throw createError({ statusCode: 400, message: 'Invalid day' });
    }
    if (hour < 0 || hour >= 24) {
      throw createError({ statusCode: 400, message: 'Invalid hour' });
    }
    if (latitude < -90 || latitude > 90) {
      throw createError({ statusCode: 400, message: 'Invalid latitude' });
    }
    if (longitude < -180 || longitude > 180) {
      throw createError({ statusCode: 400, message: 'Invalid longitude' });
    }

    // Инициализация Swiss Ephemeris
    const swe = new SwissEph();
    await swe.initSwissEph();
    swe.set_ephe_path('@/data/ephe');

    const jdUt = localTimeToJulianDay(swe, year, month, day, hour, minute, timezone);

    // Флаги для расчетов
    const iflag = swe.SEFLG_SWIEPH | swe.SEFLG_SPEED;

    // Рассчитываем позиции всех планет
    const planets = {};
    const planetPositions = {};

    for (const planetName of PLANET_NAMES) {
      const planetCode = PLANET_CODES[planetName];
      const result = swe.calc_ut(jdUt, planetCode, iflag);

      if (result && result.length > 0) {
        const longitude = normalizeLongitude(result[0]);
        planetPositions[planetName] = longitude;

        const signInfo = getSignFromLongitude(longitude);

        const speed = result.length > 3 ? parseFloat(result[3].toFixed(4)) : 0;

        planets[planetName] = {
          name: planetName,
          longitude: parseFloat(longitude.toFixed(2)),
          sign: signInfo.sign,
          signIndex: signInfo.signIndex,
          positionInSign: parseFloat(signInfo.positionInSign.toFixed(2)),
          speed,
          retrograde: speed < 0,
        };
      }
    }

    // Placidus через swe_houses (см. computePlacidusHouses)
    const { houseCusps, ascendant: ascendantLongitude, mc: mcLongitude } = computePlacidusHouses(
      swe,
      jdUt,
      latitude,
      longitude
    );

    const ascendantSign = getSignFromLongitude(ascendantLongitude);
    const mcSign = getSignFromLongitude(mcLongitude);

    // Определяем дома для каждой планеты
    for (const planetName of PLANET_NAMES) {
      if (planets[planetName]) {
        const planetLongitude = planetPositions[planetName];
        const houseNumber = getHouseForPlanet(planetLongitude, houseCusps);
        planets[planetName].house = houseNumber;
      }
    }

    // Рассчитываем аспекты между планетами
    const aspects = [];

    for (let i = 0; i < PLANET_NAMES.length; i++) {
      for (let j = i + 1; j < PLANET_NAMES.length; j++) {
        const planet1 = PLANET_NAMES[i];
        const planet2 = PLANET_NAMES[j];

        if (!planetPositions[planet1] || !planetPositions[planet2]) {
          continue;
        }

        const aspect = getAspect(planetPositions[planet1], planetPositions[planet2]);

        if (aspect) {
          // Получаем знаки для планет для fallback системы
          const sign1 = planets[planet1]?.sign;
          const sign2 = planets[planet2]?.sign;

          aspects.push({
            planet1: planet1,
            planet2: planet2,
            angle: parseFloat(aspect.angle.toFixed(1)), // Округляем до 0.1° для поиска
            rawAngle: parseFloat(aspect.rawAngle.toFixed(2)), // Точный угол
            type: aspect.type,
            orb: parseFloat(aspect.orb.toFixed(2)),
            exact: aspect.exact,
            sign1: sign1,
            sign2: sign2,
          });
        }
      }
    }

    // Загружаем описания для планет с fallback системой
    const planetsWithDescriptions = await Promise.all(
      PLANET_NAMES.map(async (planetName) => {
        if (!planets[planetName]) return null;

        const planet = planets[planetName];
        try {
          // Описания по знаку и по дому (оба в ответе)
          const [planetDesc, ascComboDesc] = await Promise.all([
            getPlanetDescription(planetName, planet.sign, planet.house),
            getSignPairComboDescription(planetName, 'asc', planet.sign, ascendantSign.sign),
          ]);
          return {
            ...planet,
            description: planetDesc, // { sign: { type, description } | null, house: { type, description } | null }
            ascCombo: ascComboDesc
              ? { type: 'sign_combo', description: ascComboDesc }
              : null,
          };
        } catch (error) {
          console.error(`Error loading descriptions for ${planetName}:`, error);
          return {
            ...planet,
            description: { sign: null, house: null },
            ascCombo: null,
          };
        }
      })
    );

    // Загружаем описания для аспектов с fallback системой
    const aspectsWithDescriptions = await Promise.all(
      aspects.map(async (aspect) => {
        try {
          // Fallback: aspect-pair с теми же знаками → aspect-pair → nearest aspect
          const description = await getAspectDescription(
            aspect.planet1,
            aspect.planet2,
            aspect.type,
            aspect.sign1,
            aspect.sign2
          );
          return {
            ...aspect,
            description: description ?? ASPECT_DESCRIPTION_FALLBACK,
          };
        } catch (error) {
          console.error(
            `Error loading aspect description for ${aspect.planet1}-${aspect.planet2}:`,
            error
          );
          return {
            ...aspect,
            description: ASPECT_DESCRIPTION_FALLBACK,
          };
        }
      })
    );

    // Формируем информацию о домах
    const houses = [];
    for (let i = 1; i <= 12; i++) {
      const cusp = normalizeLongitude(houseCusps[i]);
      const signInfo = getSignFromLongitude(cusp);
      houses.push({
        number: i,
        cusp: parseFloat(cusp.toFixed(2)),
        sign: signInfo.sign,
        signIndex: signInfo.signIndex,
      });
    }

    // Описание Асцендента по знаку (planet_sign/asc.json, planet_house/asc.json)
    let ascendantDescription = null;
    try {
      ascendantDescription = await getPlanetDescription('asc', ascendantSign.sign, 1);
    } catch (err) {
      console.error('Error loading ascendant description:', err);
    }

    // Жизненные сферы — Phase 1: персонализация отложена
    const lifeAreas = {};

    // Формируем финальный ответ
    const result = {
      chart: {
        date: {
          year,
          month,
          day,
          hour,
          minute,
          timezone,
        },
        location: {
          latitude,
          longitude,
          ...(city ? { city } : {}),
        },
        julianDay: parseFloat(jdUt.toFixed(5)),
      },
      ascendant: {
        longitude: parseFloat(ascendantLongitude.toFixed(2)),
        sign: ascendantSign.sign,
        signIndex: ascendantSign.signIndex,
        description: ascendantDescription,
      },
      mc: {
        longitude: parseFloat(mcLongitude.toFixed(2)),
        sign: mcSign.sign,
        signIndex: mcSign.signIndex,
      },
      planets: planetsWithDescriptions.filter((p) => p !== null),
      houses: houses,
      aspects: aspectsWithDescriptions,
      life_areas: lifeAreas,
    };

    const highlights = buildHighlights(result);
    swe.close();
    return { ...result, highlights };
  } catch (error) {
    console.error('Error calculating natal chart:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to calculate natal chart',
    });
  }
});
