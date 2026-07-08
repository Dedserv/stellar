export interface ArchetypeMeta {
  archetype: string;
  zodiacSign: string;
  element: string;
  modality: string;
}

export const ARCHETYPE_META: Record<string, ArchetypeMeta> = {
  'aries-1': { archetype: 'Первопроходец', zodiacSign: 'Овен', element: 'Огонь', modality: 'Кардинальная' },
  'taurus-1': { archetype: 'Хранитель', zodiacSign: 'Телец', element: 'Земля', modality: 'Фиксированная' },
  'gemini-1': { archetype: 'Связной', zodiacSign: 'Близнецы', element: 'Воздух', modality: 'Мутабельная' },
  'cancer-1': { archetype: 'Заботливый', zodiacSign: 'Рак', element: 'Вода', modality: 'Кардинальная' },
  'leo-1': { archetype: 'Сияющий', zodiacSign: 'Лев', element: 'Огонь', modality: 'Фиксированная' },
  'virgo-1': { archetype: 'Мастер', zodiacSign: 'Дева', element: 'Земля', modality: 'Мутабельная' },
  'libra-1': { archetype: 'Дипломат', zodiacSign: 'Весы', element: 'Воздух', modality: 'Кардинальная' },
  'scorpio-1': { archetype: 'Алхимик', zodiacSign: 'Скорпион', element: 'Вода', modality: 'Фиксированная' },
  'sagittarius-1': { archetype: 'Искатель', zodiacSign: 'Стрелец', element: 'Огонь', modality: 'Мутабельная' },
  'capricorn-1': { archetype: 'Строитель', zodiacSign: 'Козерог', element: 'Земля', modality: 'Кардинальная' },
  'aquarius-1': { archetype: 'Визионер', zodiacSign: 'Водолей', element: 'Воздух', modality: 'Фиксированная' },
  'pisces-1': { archetype: 'Мечтатель', zodiacSign: 'Рыбы', element: 'Вода', modality: 'Мутабельная' },
};
