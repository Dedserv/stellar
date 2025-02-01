export default [
  {
    title: 'Выберите ваш пол',
    component: 'ImgCheckbox',
    question: [
      { title: 'Женский', value: 'woman', img: '/img/zodiacs/sagittarius.webp' },
      { title: 'Мужской', value: 'man', img: '/img/zodiacs/leo.webp' },
    ],
  },
  //   {
  //     title: 'Дата вашего рождения',
  //     component: 'VSelect',
  //     question: [
  //       { title: 'День', value: 'day' },
  //       { title: 'Месяц', value: 'month' },
  //       { title: 'Год', value: 'year' },
  //     ],
  //   },
  {
    title: 'Ваше семейное положение',
    component: 'ImgCheckbox',
    question: [
      { title: 'В браке', value: 'married', img: '/img/zodiacs/married.webp' },
      { title: 'Помолвлен(а)', value: 'engaged', img: '/img/zodiacs/engaged.webp' },
      { title: 'В отношениях', value: 'relationship', img: '/img/zodiacs/relationship.webp' },
      { title: 'Запутано', value: 'complicated ', img: '/img/zodiacs/complicated.webp' },
      { title: 'Не в отношениях', value: 'single', img: '/img/zodiacs/single.webp' },
      { title: 'В разводе', value: 'divorced', img: '/img/zodiacs/divorced.webp' },
    ],
  },
];
