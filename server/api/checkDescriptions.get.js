import { defineEventHandler } from 'h3';
import { checkPlanetDescriptions } from '~/server/utils/checkPlanetDescriptions.js';

/**
 * GET /api/checkDescriptions
 * Запускает проверку отсутствующих sign/house в data/generated.
 * В консоли сервера выводится текст для копирования в generateBlocks;
 * в ответе — JSON с полями missingSign, missingHouse и готовые bodies для POST.
 */
export default defineEventHandler(async () => {
  const result = await checkPlanetDescriptions();
  const copyPasteBodies = {
    planet_sign_directly: result.missingSign.map(({ planet, signs }) => ({
      action: 'generate',
      category: 'planet_sign_directly',
      options: { planets: [planet], signs },
    })),
    planet_house_directly: result.missingHouse.map(({ planet, houses }) => ({
      action: 'generate',
      category: 'planet_house_directly',
      options: { planets: [planet], houses },
    })),
  };
  return {
    missingSign: result.missingSign,
    missingHouse: result.missingHouse,
    parseErrors: result.parseErrors || [],
    copyPasteBodies,
  };
});
