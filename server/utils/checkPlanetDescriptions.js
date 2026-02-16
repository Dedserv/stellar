/**
 * Проверка наличия ключей sign/house в data/generated.
 * Запуск: GET /api/checkDescriptions (логи в консоль сервера + JSON в ответе)
 * или из корня проекта: node --experimental-vm-modules -e "import('./server/utils/checkPlanetDescriptions.js').then(m=>m.checkPlanetDescriptions())"
 */
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.resolve(process.cwd(), 'data', 'generated');

const ENTITIES = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'asc',
];
const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];
const HOUSE_KEYS = Array.from({ length: 12 }, (_, i) => `house_${i + 1}`);

/**
 * Проверяет наличие ключей sign и house в data/generated.
 * Отсутствующие выводит в консоль в формате для копирования в generateBlocks (planet_sign_directly / planet_house_directly).
 */
export async function checkPlanetDescriptions() {
  const missingSign = []; // { planet, signs[] }
  const missingHouse = []; // { planet, houses[] }

  const parseErrors = []; // { planet, kind: 'planet_sign'|'planet_house', error }

  for (const planet of ENTITIES) {
    let signData = null;
    let houseData = null;
    try {
      signData = await fs
        .readFile(path.join(DATA_DIR, 'planet_sign', `${planet}.json`), 'utf-8')
        .then(JSON.parse);
    } catch (err) {
      signData = null;
      parseErrors.push({ planet, kind: 'planet_sign', error: err.message });
    }
    try {
      houseData = await fs
        .readFile(path.join(DATA_DIR, 'planet_house', `${planet}.json`), 'utf-8')
        .then(JSON.parse);
    } catch (err) {
      houseData = null;
      parseErrors.push({ planet, kind: 'planet_house', error: err.message });
    }

    const missingSigns = SIGNS.filter(
      (sign) => !signData?.[sign] || !Array.isArray(signData[sign]) || signData[sign].length === 0
    );
    if (missingSigns.length) {
      missingSign.push({ planet, signs: missingSigns });
    }

    const missingHouses = HOUSE_KEYS.filter(
      (key) => !houseData?.[key] || !Array.isArray(houseData[key]) || houseData[key].length === 0
    ).map((key) => parseInt(key.replace('house_', ''), 10));
    if (missingHouses.length) {
      missingHouse.push({ planet, houses: missingHouses });
    }
  }

  const lines = [];
  lines.push('');
  lines.push('========== Проверка planet_sign / planet_house ==========');
  lines.push('');

  if (parseErrors.length) {
    lines.push('--- Ошибки чтения/парсинга (файл отсутствует или невалидный JSON) ---');
    parseErrors.forEach(({ planet, kind, error }) => {
      lines.push(`  ${planet} (${kind}): ${error}`);
    });
    lines.push('');
  }

  if (missingSign.length === 0 && missingHouse.length === 0 && parseErrors.length === 0) {
    lines.push('Все ключи (12 знаков и 12 домов) присутствуют для всех сущностей.');
    console.log(lines.join('\n'));
    return { missingSign: [], missingHouse: [], parseErrors: [] };
  }

  if (missingSign.length) {
    lines.push('--- Отсутствуют planet_sign (знак) ---');
    missingSign.forEach(({ planet, signs }) => {
      lines.push(`  ${planet}: ${signs.join(', ')}`);
    });
    lines.push('');
    lines.push('Для генерации (POST /api/generateBlocks, category: planet_sign_directly):');
    missingSign.forEach(({ planet, signs }) => {
      const body = JSON.stringify(
        {
          action: 'generate',
          category: 'planet_sign_directly',
          options: { planets: [planet], signs },
        },
        null,
        2
      );
      lines.push(body);
      lines.push('');
    });
  }

  if (missingHouse.length) {
    lines.push('--- Отсутствуют planet_house (дом) ---');
    missingHouse.forEach(({ planet, houses }) => {
      lines.push(`  ${planet}: дома ${houses.join(', ')}`);
    });
    lines.push('');
    lines.push('Для генерации (POST /api/generateBlocks, category: planet_house_directly):');
    missingHouse.forEach(({ planet, houses }) => {
      const body = JSON.stringify(
        {
          action: 'generate',
          category: 'planet_house_directly',
          options: { planets: [planet], houses },
        },
        null,
        2
      );
      lines.push(body);
      lines.push('');
    });
  }

  lines.push('========== конец вывода ==========');
  lines.push('');
  console.log(lines.join('\n'));

  return { missingSign, missingHouse, parseErrors };
}
