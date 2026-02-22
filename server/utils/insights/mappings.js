/**
 * Знак зодиака → стихия
 */
const SIGN_ELEMENT = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
};

/**
 * Знак зодиака → модальность
 */
const SIGN_MODALITY = {
  aries: 'cardinal',
  taurus: 'fixed',
  gemini: 'mutable',
  cancer: 'cardinal',
  leo: 'fixed',
  virgo: 'mutable',
  libra: 'cardinal',
  scorpio: 'fixed',
  sagittarius: 'mutable',
  capricorn: 'cardinal',
  aquarius: 'fixed',
  pisces: 'mutable',
};

/**
 * @param {string} sign - знак (lowercase, e.g. aries)
 * @returns {"fire"|"earth"|"air"|"water"|undefined}
 */
export function getElement(sign) {
  if (!sign || typeof sign !== 'string') return undefined;
  return SIGN_ELEMENT[sign.toLowerCase()];
}

/**
 * @param {string} sign - знак (lowercase)
 * @returns {"cardinal"|"fixed"|"mutable"|undefined}
 */
export function getModality(sign) {
  if (!sign || typeof sign !== 'string') return undefined;
  return SIGN_MODALITY[sign.toLowerCase()];
}

export { SIGN_ELEMENT, SIGN_MODALITY };
