/**
 * Парсит ответы опросника и строит query для /natalchart.
 */
export function useChartQuery() {
  function parseAnswerByName(answers, name) {
    return answers.find((item) => item?.name === name);
  }

  function parseBirthday(birthdayAnswer) {
    const raw = birthdayAnswer?.value ?? '';
    const [day, month, year] = String(raw).split(',').map((v) => parseInt(v, 10));

    if (!day || !month || !year) {
      throw new Error('Укажите полную дату рождения');
    }

    return { day, month, year };
  }

  function parseTime(timeAnswer) {
    const raw = timeAnswer?.value ?? '';
    const [hour, minute] = String(raw).split(',').map((v) => parseInt(v, 10));

    return {
      hour: Number.isFinite(hour) ? hour : 12,
      minute: Number.isFinite(minute) ? minute : 0,
    };
  }

  function parseCity(cityAnswer) {
    const city = String(cityAnswer?.value ?? '').trim();
    if (!city) {
      throw new Error('Укажите место рождения');
    }
    return city;
  }

  async function buildFromAnswers(answers) {
    const birthday = parseAnswerByName(answers, 'Birthday');
    const time = parseAnswerByName(answers, 'Time');
    const cityAnswer = parseAnswerByName(answers, 'City');

    const { day, month, year } = parseBirthday(birthday);
    const { hour, minute } = parseTime(time);
    const cityQuery = parseCity(cityAnswer);

    const geo = await $fetch('/api/geocode', {
      query: { city: cityQuery },
    });

    return {
      year: String(year),
      month: String(month),
      day: String(day),
      hour: String(hour),
      minute: String(minute),
      latitude: String(geo.latitude),
      longitude: String(geo.longitude),
      timezone: String(geo.timezone),
      city: geo.city || cityQuery,
    };
  }

  return {
    buildFromAnswers,
  };
}
