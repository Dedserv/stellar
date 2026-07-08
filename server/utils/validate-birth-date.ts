import { createError } from 'h3';

export function parseAndValidateBirthDate(birthDate: unknown): string {
  if (typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'birthDate должен быть в формате YYYY-MM-DD',
    });
  }

  const year = Number(birthDate.slice(0, 4));
  const month = Number(birthDate.slice(5, 7));
  const day = Number(birthDate.slice(8, 10));

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    throw createError({
      statusCode: 400,
      statusMessage: `Год рождения должен быть в диапазоне 1900–${currentYear}`,
    });
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Некорректная дата рождения',
    });
  }

  return birthDate;
}
