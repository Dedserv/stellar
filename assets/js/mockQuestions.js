const hours = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, '0'),
  value: i,
}));

const minutes = Array.from({ length: 59 }, (_, i) => ({
  label: String(i + 1).padStart(2, '0'),
  value: i + 1,
}));

export default [
  {
    title: 'Дата вашего рождения',
    name: 'Birthday',
    component: 'VueSelect',
    options: [
      {
        title: 'День',
        options: [
          {
            label: '1',
            value: 1,
          },
          {
            label: '2',
            value: 2,
          },
          {
            label: '3',
            value: 3,
          },
        ],
        value: null,
      },
      {
        title: 'Месяц',
        options: [
          {
            label: '5',
            value: 5,
          },
          {
            label: '7',
            value: 7,
          },
          {
            label: '10',
            value: 10,
          },
        ],
        value: null,
      },
      {
        title: 'Год',
        options: [
          {
            label: '5',
            value: 5,
          },
          {
            label: '7',
            value: 7,
          },
          {
            label: '10',
            value: 10,
          },
        ],
        value: null,
      },
    ],
    value: '',
  },
  {
    title: 'Выберите ваш пол',
    name: 'Gender',
    component: 'VCheckbox',
    subcomponent: 'VCard',
    options: [
      {
        title: 'Женский',
        value: 'woman',
        img: '/img/questions/woman.webp',
        type: 'textInside',
        size: 'small',
        rounded: true,
      },
      {
        title: 'Мужской',
        value: 'man',
        img: '/img/questions/man.webp',
        type: 'textInside',
        size: 'small',
        rounded: true,
      },
    ],
    value: '',
  },
  {
    title: 'Укажите место рождения',
    name: 'City',
    component: 'SelectInput',
    value: '',
  },
  {
    title: 'Время вашего рождения',
    name: 'Time',
    component: 'VueSelect',
    class: 'separator',
    options: [
      {
        title: 'Час',
        options: hours,
        value: null,
      },
      {
        title: 'Минута',
        options: minutes,
        value: null,
      },
    ],
    value: {},
  },
  {
    title: 'Ваше семейное положение',
    name: 'Married',
    component: 'VCheckbox',
    subcomponent: 'VCard',
    options: [
      {
        title: 'В браке',
        value: 'married',
        img: '/img/questions/married.webp',
        type: 'textInside',
      },
      {
        title: 'Помолвлен(а)',
        value: 'engaged',
        img: '/img/questions/engaged.webp',
        type: 'textInside',
      },
      {
        title: 'В отношениях',
        value: 'relationship',
        img: '/img/questions/relationship.webp',
        type: 'textInside',
      },
      {
        title: 'Запутано',
        value: 'complicated ',
        img: '/img/questions/complicated.webp',
        type: 'textInside',
      },
      {
        title: 'Не в отношениях',
        value: 'single',
        img: '/img/questions/single.webp',
        type: 'textInside',
      },
      {
        title: 'В разводе',
        value: 'divorced',
        img: '/img/questions/divorced.webp',
        type: 'textInside',
      },
    ],
    value: [],
  },
];
