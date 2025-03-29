import {
  days,
  months,
  years,
  generateHours,
  generateMinutes,
} from '~/assets/js/common/dateTime.js';

export default defineEventHandler(async () => {
  return [
    {
      title: 'Дата вашего рождения',
      name: 'Birthday',
      component: 'VueSelect',
      options: [
        {
          title: 'День',
          options: days,
          value: null,
        },
        {
          title: 'Месяц',
          options: months,
          value: null,
        },
        {
          title: 'Год',
          options: years,
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
      title: 'Ваше место рождения',
      name: 'City',
      component: 'SelectInput',
      value: '',
    },
    {
      title: 'В какое время вы родились?',
      name: 'Time',
      component: 'VueSelect',
      class: 'separator',
      options: [
        {
          title: 'Час',
          options: generateHours(),
          value: null,
        },
        {
          title: 'Минута',
          options: generateMinutes(),
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
    {
      title: 'Составляли вы карту рождения раньше?',
      name: 'earlyExperience',
      component: 'VCheckbox',
      subcomponent: 'VCard',
      options: [
        {
          title: 'Составлял(а)',
          value: 'had',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
        {
          title: 'Не составляла(а)',
          value: 'notHad',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
      ],
      value: [],
    },
    {
      title: 'Какие темы были важнейшие в последние дни?',
      name: 'importantTopics',
      component: 'VCheckbox',
      subcomponent: 'VCard',
      options: [
        {
          title: 'Финансы',
          value: 'finances',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
        {
          title: 'Карьера',
          value: 'career',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
        {
          title: 'Любовь',
          value: 'love',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
        {
          title: 'Здоровье',
          value: 'health',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
        {
          title: 'Семейная жизнь',
          value: 'family',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
        {
          title: 'Друзья',
          value: 'friends',
          img: '/img/zodiacs/sagittarius.webp',
          type: 'textInside',
          size: 'small',
        },
      ],
      value: [],
    },
  ];
});
