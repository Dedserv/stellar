const days = Array.from({ length: 31 }, (_, i) => ({ value: i + 1 }));

const months = Array.from({ length: 12 }, (_, i) => ({
  label: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ][i],
  value: i + 1,
}));

const years = Array.from({ length: 70 }, (_, i) => ({
  value: 2015 - i,
}));

// Генерация часов и минут
const generateHours = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    label: String(i).padStart(2, '0'),
    value: i,
  }));
};

const generateMinutes = () => {
  return Array.from({ length: 59 }, (_, i) => ({
    label: String(i + 1).padStart(2, '0'),
    value: i + 1,
  }));
};

export { days, months, years, generateHours, generateMinutes };
