const articles = [
  {
    id: 1,
    title: 'Астрология и её влияние на жизнь',
    image: '/img/zodiacs/aries.webp',
    content: `
      <p>Астрология - древняя наука, изучающая взаимосвязь между положением небесных тел и событиями на Земле. На протяжении тысячелетий люди обращались к звездам за советом и руководством.</p>
      <p>В современном мире астрология продолжает играть важную роль, помогая людям лучше понять себя и свое место во Вселенной. Натальная карта, составленная на момент рождения человека, может раскрыть его потенциал, таланты и жизненные задачи.</p>
      <p>Каждая планета в астрологии имеет свое особое значение и влияние на различные аспекты нашей жизни. Например, Солнце отвечает за наше эго и жизненную силу, в то время как Луна связана с эмоциями и подсознанием.</p>
    `,
  },
  {
    id: 2,
    title: 'Тайны натальной карты',
    image: '/img/zodiacs/aries.webp',
    content: `
      <p>Натальная карта - это уникальный астрологический отпечаток момента вашего рождения. Она показывает точное расположение всех планет в момент, когда вы появились на свет.</p>
      <p>Анализ натальной карты может раскрыть ваши сильные стороны, потенциальные трудности и кармические задачи. Это мощный инструмент самопознания и личностного роста.</p>
      <p>Каждый дом в натальной карте отвечает за определенную сферу жизни: от личности и финансов до отношений и карьеры. Понимание этих аспектов помогает принимать более осознанные решения.</p>
    `,
  },
  {
    id: 3,
    title: 'Значение планет в гороскопе',
    image: '/img/zodiacs/aries.webp',
    content: `
      <p>Каждая планета в астрологии несет свой уникальный символизм и энергию. Марс представляет действие и амбиции, Венера - любовь и красоту, а Сатурн - дисциплину и ограничения.</p>
      <p>Взаимодействие планет между собой создает сложную картину влияний, которые формируют нашу личность и судьбу. Аспекты между планетами могут быть гармоничными или напряженными.</p>
      <p>Понимание роли планет помогает лучше планировать важные события и принимать решения в соответствии с космическими ритмами.</p>
    `,
  },
];

export default defineEventHandler((event) => {
  console.log('allloa ewdasd');
  const params = getQuery(event);
  console.log('🚀 ~ params:', params);
  const id = parseInt(event.context.params.id);
  const article = articles.find((a) => a.id === id);

  console.log('🚀 ~ article:', article);

  if (!article) {
    throw createError({
      statusCode: 404,
      message: 'Article not found',
    });
  }

  return article;
});
