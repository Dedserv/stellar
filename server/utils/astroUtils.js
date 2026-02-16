/**
 * Константы для знаков зодиака
 */
export const ZODIAC_SIGNS = [
  'aries', // 0° - 30°
  'taurus', // 30° - 60°
  'gemini', // 60° - 90°
  'cancer', // 90° - 120°
  'leo', // 120° - 150°
  'virgo', // 150° - 180°
  'libra', // 180° - 210°
  'scorpio', // 210° - 240°
  'sagittarius', // 240° - 270°
  'capricorn', // 270° - 300°
  'aquarius', // 300° - 330°
  'pisces', // 330° - 360°
];

/**
 * Константы для планет в Swiss Ephemeris
 */
export const PLANET_CODES = {
  sun: 0, // SE_SUN
  moon: 1, // SE_MOON
  mercury: 2, // SE_MERCURY
  venus: 3, // SE_VENUS
  mars: 4, // SE_MARS
  jupiter: 5, // SE_JUPITER
  saturn: 6, // SE_SATURN
  uranus: 7, // SE_URANUS
  neptune: 8, // SE_NEPTUNE
  pluto: 9, // SE_PLUTO
};

/**
 * Названия планет
 */
export const PLANET_NAMES = Object.keys(PLANET_CODES);

/**
 * Орбы (допуски) для аспектов в градусах
 */
export const ASPECT_ORBS = {
  conjunction: 8,
  sextile: 6,
  square: 7,
  trine: 8,
  opposition: 8,
};

/**
 * Углы для аспектов в градусах
 */
export const ASPECT_ANGLES = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

/**
 * Определяет знак зодиака по долготе (0-360°)
 */
export function getSignFromLongitude(longitude) {
  const signIndex = Math.floor(longitude / 30);
  return {
    sign: ZODIAC_SIGNS[signIndex],
    signIndex: signIndex,
    positionInSign: longitude % 30,
  };
}

/**
 * Вычисляет угловое расстояние между двумя точками
 */
export function getAngleDifference(angle1, angle2) {
  let diff = Math.abs(angle1 - angle2);
  if (diff > 180) {
    diff = 360 - diff;
  }
  return diff;
}

/**
 * Определяет аспект между двумя планетами
 * Округляет угол до 0.1° для вычислений и проверяет орбы
 */
export function getAspect(planet1Longitude, planet2Longitude) {
  // Округляем долготы до 0.01° при хранении (уже сделано в коде)
  // Округляем угловую разность до 0.1° для вычислений
  const rawAngle = getAngleDifference(planet1Longitude, planet2Longitude);
  const angle = Math.round(rawAngle * 10) / 10; // Округляем до 0.1°

  for (const [aspectType, aspectAngle] of Object.entries(ASPECT_ANGLES)) {
    const orb = ASPECT_ORBS[aspectType];
    const diff = Math.abs(angle - aspectAngle);

    if (diff <= orb) {
      return {
        type: aspectType,
        angle: angle,
        orb: diff,
        exact: diff < 0.1, // Считаем точным если разница < 0.1°
        rawAngle: rawAngle, // Сохраняем оригинальный угол для точности
      };
    }
  }

  return null;
}

/**
 * Определяет номер дома для планеты по её долготе и куспидам домов
 */
export function getHouseForPlanet(planetLongitude, houseCusps) {
  // houseCusps - массив из 13 элементов (cusps[0] не используется, cusps[1-12] - куспиды домов)
  // Нормализуем долготу планеты в диапазон 0-360
  let normalizedLongitude = planetLongitude % 360;
  if (normalizedLongitude < 0) normalizedLongitude += 360;

  // Проверяем каждый дом
  for (let i = 1; i <= 12; i++) {
    const cusp1 = houseCusps[i];
    const cusp2 = houseCusps[i === 12 ? 1 : i + 1];

    // Проверяем пересечение через 0°
    if (cusp1 > cusp2) {
      // Дом пересекает 0°
      if (normalizedLongitude >= cusp1 || normalizedLongitude < cusp2) {
        return i;
      }
    } else {
      // Обычный случай
      if (normalizedLongitude >= cusp1 && normalizedLongitude < cusp2) {
        return i;
      }
    }
  }

  // Если не нашли (маловероятно), возвращаем дом 1
  return 1;
}

/**
 * Нормализует долготу в диапазон 0-360
 */
export function normalizeLongitude(longitude) {
  let normalized = longitude % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

