import type { ElementKey } from '~/types/personality';

export interface ZodiacInfo {
  sign: string;
  element: ElementKey;
  modality: 'cardinal' | 'fixed' | 'mutable';
  order: number;
}

const ZODIAC_SIGNS: ZodiacInfo[] = [
  { sign: 'Овен', element: 'fire', modality: 'cardinal', order: 0 },
  { sign: 'Телец', element: 'earth', modality: 'fixed', order: 1 },
  { sign: 'Близнецы', element: 'air', modality: 'mutable', order: 2 },
  { sign: 'Рак', element: 'water', modality: 'cardinal', order: 3 },
  { sign: 'Лев', element: 'fire', modality: 'fixed', order: 4 },
  { sign: 'Дева', element: 'earth', modality: 'mutable', order: 5 },
  { sign: 'Весы', element: 'air', modality: 'cardinal', order: 6 },
  { sign: 'Скорпион', element: 'water', modality: 'fixed', order: 7 },
  { sign: 'Стрелец', element: 'fire', modality: 'mutable', order: 8 },
  { sign: 'Козерог', element: 'earth', modality: 'cardinal', order: 9 },
  { sign: 'Водолей', element: 'air', modality: 'fixed', order: 10 },
  { sign: 'Рыбы', element: 'water', modality: 'mutable', order: 11 },
];

const ZODIAC_BOUNDS: Array<{
  sign: string;
  start: [number, number];
  end: [number, number];
}> = [
  { sign: 'Овен', start: [21, 3], end: [19, 4] },
  { sign: 'Телец', start: [20, 4], end: [20, 5] },
  { sign: 'Близнецы', start: [21, 5], end: [20, 6] },
  { sign: 'Рак', start: [21, 6], end: [22, 7] },
  { sign: 'Лев', start: [23, 7], end: [22, 8] },
  { sign: 'Дева', start: [23, 8], end: [22, 9] },
  { sign: 'Весы', start: [23, 9], end: [22, 10] },
  { sign: 'Скорпион', start: [23, 10], end: [21, 11] },
  { sign: 'Стрелец', start: [22, 11], end: [21, 12] },
  { sign: 'Козерог', start: [22, 12], end: [19, 1] },
  { sign: 'Водолей', start: [20, 1], end: [18, 2] },
  { sign: 'Рыбы', start: [19, 2], end: [20, 3] },
];

function isDateInRange(day: number, month: number, start: [number, number], end: [number, number]) {
  const [startDay, startMonth] = start;
  const [endDay, endMonth] = end;

  if (startMonth === endMonth) {
    return month === startMonth && day >= startDay && day <= endDay;
  }

  if (startMonth > endMonth) {
    return (
      (month === startMonth && day >= startDay) ||
      (month === endMonth && day <= endDay) ||
      month > startMonth ||
      month < endMonth
    );
  }

  return (
    (month === startMonth && day >= startDay) ||
    (month === endMonth && day <= endDay) ||
    (month > startMonth && month < endMonth)
  );
}

export function getZodiacSign(day: number, month: number): ZodiacInfo {
  const bound = ZODIAC_BOUNDS.find(({ start, end }) => isDateInRange(day, month, start, end));
  const signName = bound?.sign ?? 'Овен';
  return ZODIAC_SIGNS.find((item) => item.sign === signName) ?? ZODIAC_SIGNS[0];
}

export function getZodiacBySign(sign: string): ZodiacInfo | undefined {
  return ZODIAC_SIGNS.find((item) => item.sign === sign);
}

export { ZODIAC_SIGNS };
