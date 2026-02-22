import { defineEventHandler, getQuery, createError } from 'h3';
import SwissEph from 'swisseph-wasm';
import {
  PLANET_CODES,
  PLANET_NAMES,
  getSignFromLongitude,
  getAspect,
  getHouseForPlanet,
  normalizeLongitude,
} from '~/server/utils/astroUtils.js';
import {
  getPlanetDescription,
  getAspectDescription,
  loadJsonFile,
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
    const timezone = parseFloat(query.timezone) || 0; // Часовой пояс в часах

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

    // Преобразуем время в UTC (вычитаем часовой пояс)
    // Swiss Ephemeris требует UTC время в формате: час + минуты/60
    let utcHour = hour - timezone;
    let utcDay = day;
    let utcMonth = month;
    let utcYear = year;

    // Обрабатываем переход через границы дня
    if (utcHour < 0) {
      utcHour += 24;
      utcDay--;
      if (utcDay < 1) {
        utcMonth--;
        if (utcMonth < 1) {
          utcMonth = 12;
          utcYear--;
        }
        // Упрощенная проверка дней в месяце (для точности нужна более сложная логика)
        utcDay = 31;
      }
    } else if (utcHour >= 24) {
      utcHour -= 24;
      utcDay++;
      // Упрощенная проверка дней в месяце
      if (utcDay > 31) {
        utcDay = 1;
        utcMonth++;
        if (utcMonth > 12) {
          utcMonth = 1;
          utcYear++;
        }
      }
    }

    const utcDecimalTime = utcHour + minute / 60;

    // Рассчитываем юлианскую дату
    const jd = swe.julday(utcYear, utcMonth, utcDay, utcDecimalTime);
    const jdUt = jd; // Universal Time

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

        planets[planetName] = {
          name: planetName,
          longitude: parseFloat(longitude.toFixed(2)), // Округляем до 0.01°
          sign: signInfo.sign,
          signIndex: signInfo.signIndex,
          positionInSign: parseFloat(signInfo.positionInSign.toFixed(2)),
          speed: result.length > 3 ? parseFloat(result[3].toFixed(4)) : 0,
        };
      }
    }

    // Рассчитываем Асцендент и дома (система Плацидус)
    // В swisseph-wasm метод houses() возвращает код ошибки, поэтому вычисляем вручную

    // Рассчитываем sidereal time
    const sidTime = swe.sidtime(jdUt);

    // Преобразуем sidereal time в градусы (1 час = 15 градусов)
    const armc = (sidTime * 15) % 360; // ARMC (Ascendant Right Ascension of Midheaven)

    // Рассчитываем наклон эклиптики (obliquity)
    // Используем более точное значение или вычисляем через среднюю точку
    const obliquity = 23.4392911 * (Math.PI / 180); // в радианах

    // Вычисляем Асцендент через формулы сферической тригонометрии
    const latRad = latitude * (Math.PI / 180);
    const armcRad = armc * (Math.PI / 180);

    // Формула для Асцендента: tan(ASC) = sin(ARMC) / (cos(ARMC) * cos(obliquity) + tan(latitude) * sin(obliquity))
    const ascendantRad = Math.atan2(
      Math.sin(armcRad),
      Math.cos(armcRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity)
    );

    const ascendantLongitude = normalizeLongitude(ascendantRad * (180 / Math.PI));

    // Рассчитываем куспиды домов Плацидуса
    // Система Плацидуса основана на делении небесной сферы на 12 равных домов
    // Каждый дом занимает 30 градусов эклиптики, но куспиды вычисляются через пересечения
    // Для упрощения используем формулу: каждый следующий дом смещен на 30 градусов от предыдущего
    // Более точный расчет требует итеративных вычислений

    const houseCusps = [0]; // cusps[0] не используется
    houseCusps[1] = ascendantLongitude; // Первый дом начинается с Асцендента

    // Для системы Плацидуса используем приближенный расчет через равнодомную систему
    // Более точный расчет требует решения уравнения Плацидуса для каждого дома
    for (let i = 2; i <= 12; i++) {
      // Равнодомная система как приближение (можно улучшить позже)
      houseCusps[i] = normalizeLongitude(ascendantLongitude + (i - 1) * 30);
    }

    const ascendantSign = getSignFromLongitude(ascendantLongitude);

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
          const planetDesc = await getPlanetDescription(planetName, planet.sign, planet.house);
          return {
            ...planet,
            description: planetDesc, // { sign: { type, description } | null, house: { type, description } | null }
          };
        } catch (error) {
          console.error(`Error loading descriptions for ${planetName}:`, error);
          return {
            ...planet,
            description: { sign: null, house: null },
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

    // Жизненные сферы (life_areas.json)
    let lifeAreas = null;
    try {
      lifeAreas = await loadJsonFile('life_areas', 'life_areas.json');
    } catch (err) {
      console.error('Error loading life_areas:', err);
    }

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
        },
        julianDay: parseFloat(jdUt.toFixed(5)),
      },
      ascendant: {
        longitude: parseFloat(ascendantLongitude.toFixed(2)),
        sign: ascendantSign.sign,
        signIndex: ascendantSign.signIndex,
        description: ascendantDescription,
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
