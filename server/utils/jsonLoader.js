import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve('./data/generated');

/**
 * Загружает JSON файл из директории data/generated
 */
export async function loadJsonFile(subdir, filename) {
  try {
    const filePath = path.join(DATA_DIR, subdir, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // Не логируем ошибки для fallback системы - это нормально если файла нет
    return null;
  }
}

/**
 * Получает случайное описание из массива описаний
 */
export function getRandomDescription(descriptions) {
  if (!descriptions || !Array.isArray(descriptions) || descriptions.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * descriptions.length);
  return descriptions[randomIndex];
}

/**
 * Получает описание планеты в знаке с fallback
 */
export async function getPlanetSignDescription(planet, sign) {
  const data = await loadJsonFile('planet_sign', `${planet}.json`);
  if (!data) return null;
  
  // Exact match: planet+sign
  if (data[sign]) {
    return getRandomDescription(data[sign]);
  }
  
  return null;
}

/**
 * Получает описание планеты в доме с fallback
 */
export async function getPlanetHouseDescription(planet, houseNumber) {
  const data = await loadJsonFile('planet_house', `${planet}.json`);
  if (!data) return null;
  
  // Exact match: planet+house
  const houseKey = `house_${houseNumber}`;
  if (data[houseKey]) {
    return getRandomDescription(data[houseKey]);
  }
  
  return null;
}

/**
 * Получает оба описания планеты (знак + дом) с fallback по каждому отдельно.
 * Возвращает { sign: { type, description } | null, house: { type, description } | null }.
 */
export async function getPlanetDescription(planet, sign, houseNumber) {
  const signData = await loadJsonFile('planet_sign', `${planet}.json`);
  const houseData = await loadJsonFile('planet_house', `${planet}.json`);

  let signResult = null;
  const signDesc = await getPlanetSignDescription(planet, sign);
  if (signDesc) {
    signResult = { type: 'sign', description: signDesc };
  } else if (signData) {
    const firstSign = Object.keys(signData)[0];
    if (firstSign) {
      signResult = { type: 'sign_fallback', description: getRandomDescription(signData[firstSign]) };
    }
  }

  let houseResult = null;
  const houseDesc = await getPlanetHouseDescription(planet, houseNumber);
  if (houseDesc) {
    houseResult = { type: 'house', description: houseDesc };
  } else if (houseData) {
    const firstHouse = Object.keys(houseData)[0];
    if (firstHouse) {
      houseResult = { type: 'house_fallback', description: getRandomDescription(houseData[firstHouse]) };
    }
  }

  return { sign: signResult, house: houseResult };
}

/**
 * Получает описание sign-pair combo
 */
export async function getSignPairComboDescription(planet1, planet2, sign1, sign2) {
  // Убеждаемся что планеты в правильном порядке (алфавитном)
  const [p1, p2] = [planet1, planet2].sort();
  const filename = `${p1}_${p2}.json`;
  
  const data = await loadJsonFile('sign_pair_combos', filename);
  if (!data) return null;
  
  // Exact match: planet+sign+planet+sign
  const comboKey = `${sign1}_${sign2}`;
  if (data[comboKey]) {
    return getRandomDescription(data[comboKey]);
  }
  
  // Также пробуем обратный порядок знаков
  const reverseComboKey = `${sign2}_${sign1}`;
  if (data[reverseComboKey]) {
    return getRandomDescription(data[reverseComboKey]);
  }
  
  return null;
}

/**
 * Определяет приоритет аспектов для fallback (близкие по типу)
 */
function getAspectPriority(targetAspect) {
  // Приоритет: сначала гармоничные аспекты, потом напряженные
  const priorities = {
    conjunction: ['conjunction', 'sextile', 'trine', 'square', 'opposition'],
    sextile: ['sextile', 'trine', 'conjunction', 'square', 'opposition'],
    square: ['square', 'opposition', 'conjunction', 'sextile', 'trine'],
    trine: ['trine', 'sextile', 'conjunction', 'square', 'opposition'],
    opposition: ['opposition', 'square', 'conjunction', 'sextile', 'trine'],
  };
  
  return priorities[targetAspect] || ['conjunction', 'sextile', 'square', 'trine', 'opposition'];
}

/**
 * Получает описание аспекта между двумя планетами с fallback
 * Fallback: aspect-pair с теми же знаками → aspect-pair → nearest aspect → any aspect → sign_combo (any signs)
 */
export async function getAspectDescription(planet1, planet2, aspectType, sign1, sign2) {
  // Убеждаемся что планеты в правильном порядке (алфавитном)
  const [p1, p2] = [planet1, planet2].sort();
  const filename = `${p1}_${p2}.json`;
  
  // 1. Exact match: aspect-pair с теми же знаками (sign_pair_combos)
  if (sign1 && sign2) {
    const comboDesc = await getSignPairComboDescription(planet1, planet2, sign1, sign2);
    if (comboDesc) {
      return { type: 'sign_combo', description: comboDesc };
    }
  }
  
  // 2. aspect-pair (из aspects/{planet1}_{planet2}.json) - exact match
  const aspectData = await loadJsonFile('aspects', filename);
  if (aspectData) {
    // Exact match для конкретного аспекта
    if (aspectData[aspectType]) {
      return { type: 'aspect', description: getRandomDescription(aspectData[aspectType]) };
    }
    
    // 3. Fallback: пробуем найти ближайший аспект по приоритету
    const availableAspects = Object.keys(aspectData);
    if (availableAspects.length > 0) {
      // Ищем аспекты по приоритету близости к целевому аспекту
      const priority = getAspectPriority(aspectType);
      
      for (const priorityAspect of priority) {
        if (availableAspects.includes(priorityAspect)) {
          return { 
            type: 'aspect_fallback', 
            originalAspect: aspectType,
            usedAspect: priorityAspect,
            description: getRandomDescription(aspectData[priorityAspect]) 
          };
        }
      }
      
      // Если ничего не нашли по приоритету, берем первый доступный
      const firstAspect = availableAspects[0];
      return { 
        type: 'aspect_fallback', 
        originalAspect: aspectType,
        usedAspect: firstAspect,
        description: getRandomDescription(aspectData[firstAspect]) 
      };
    }
  }
  
  // 4. Fallback: пробуем sign_pair_combos без проверки знаков (любой знак)
  const comboData = await loadJsonFile('sign_pair_combos', filename);
  if (comboData) {
    const availableCombos = Object.keys(comboData);
    if (availableCombos.length > 0) {
      // Берем первый доступный комбо (можно выбрать случайный или по приоритету)
      const firstCombo = availableCombos[0];
      const comboDesc = getRandomDescription(comboData[firstCombo]);
      if (comboDesc) {
        return { 
          type: 'sign_combo_fallback', 
          originalSigns: sign1 && sign2 ? `${sign1}_${sign2}` : null,
          usedCombo: firstCombo,
          description: comboDesc 
        };
      }
    }
  }
  
  return null;
}

/**
 * Округляет угол до ближайшего аспекта
 */
export function roundToNearestAspect(angle, tolerance = 0.1) {
  const ASPECT_ANGLES = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
  };
  
  let nearestType = null;
  let nearestDiff = Infinity;
  
  for (const [type, targetAngle] of Object.entries(ASPECT_ANGLES)) {
    const diff = Math.abs(angle - targetAngle);
    if (diff < nearestDiff) {
      nearestDiff = diff;
      nearestType = type;
    }
  }
  
  return {
    type: nearestType,
    angle: Math.round(angle / tolerance) * tolerance, // Округляем до 0.1°
    diff: nearestDiff,
  };
}
