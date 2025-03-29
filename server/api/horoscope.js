import OpenAI from 'openai';
import cron from 'node-cron';
import { zodiacSigns } from '@/assets/js/mockZodiacs.js';

const config = useRuntimeConfig();

const defaultPromt = (zodiac) => `Составь гороскоп знак зодиака ${zodiac} на сегодня. 
Охватывай основные сферы: любовь, работа, здоровье, настроение и совет дня. 
Стиль — дружелюбный и мотивирующий. Не используй сложные термины, текст должен быть понятным широкой аудитории. 
Добавь вдохновляющую нотку в конце. Не используй смайлики, длина текста не должна превышать 500 знаков. 
Не начинай со слова "Сегодня".`;

let horoscope = [
  {
    element: 'fire',
    type: 'hover',
    signs: [
      {
        title: 'Овен',
        description: 'Март 21 - Апрель 19',
        img: '/img/zodiacs/aries.webp',
        text: 'Сегодня Овены могут почувствовать прилив энергии в любовной сфере — это отличный день для романтических идей и смелых признаний. На работе вас ждут новые вызовы, но ваша решительность поможет справиться с любыми задачами. Здоровье в норме, но не забывайте про отдых — переутомление ни к чему. Настроение будет бодрым, особенно если вы сосредоточитесь на своих целях. Совет дня: не бойтесь рисковать, но действуйте с умом. Помните, что ваша энергия — это ключ к успеху, используйте её с пользой!',
      },
      {
        title: 'Лев',
        description: 'Июль 23 - Август 22',
        img: '/img/zodiacs/leo.webp',
        text: 'Сегодня Львы могут почувствовать себя в центре внимания — ваша харизма на высоте! В любви возможны приятные сюрпризы, особенно если вы проявите инициативу. На работе стоит сосредоточиться на важных задачах, но не забывайте отдыхать. Здоровье требует внимания: избегайте перегрузок и уделите время расслаблению. Настроение будет оптимистичным, если вы не станете переживать из-за мелочей. Совет дня: верьте в свои силы и не бойтесь рисковать — сегодняшний день может стать началом чего-то большого!',
      },
      {
        title: 'Стрелец',
        description: 'Ноябрь 22 - Декабрь 21',
        img: '/img/zodiacs/sagittarius.webp',
        text: 'Сегодня Стрельцы могут почувствовать прилив энергии в любовных делах — не бойтесь проявлять инициативу! На работе вас ждут интересные задачи, которые помогут раскрыть ваш потенциал. Здоровье в норме, но не забывайте про умеренные физические нагрузки. Настроение будет оптимистичным, особенно если вы сосредоточитесь на своих целях. Совет дня: не бойтесь рисковать, но действуйте с умом. Сегодняшний день — отличный шанс сделать шаг к мечте!',
      },
    ],
  },
  {
    element: 'earth',
    signs: [
      {
        title: 'Телец',
        description: 'Апрель 20 - Май 20',
        img: '/img/zodiacs/taurus.webp',
        text: 'Сегодня Тельцы могут почувствовать себя особенно уверенно в любви — близкие люди оценят вашу заботу и внимание. На работе возможны небольшие трудности, но ваша упорность поможет справиться с любыми задачами. Здоровье в норме, но не забывайте про отдых и умеренные физические нагрузки. Настроение будет стабильным, с легким оттенком оптимизма. Совет дня: не бойтесь пробовать что-то новое, даже если это кажется незначительным. Помните, что даже маленькие шаги ведут к большим переменам!',
      },
      {
        title: 'Дева',
        description: 'Август 23 - Сентябрь 22',
        img: '/img/zodiacs/virgo.webp',
        text: 'Сегодня Девы могут почувствовать себя особенно гармонично в отношениях — это отличный день для искренних разговоров и укрепления связей. На работе вас ждут новые идеи, но не спешите брать на себя слишком много — распределяйте задачи грамотно. Здоровье требует внимания: уделите время отдыху и легкой физической активности. Настроение будет стабильным, если вы сосредоточитесь на позитивных моментах. Совет дня: не бойтесь проявлять инициативу, даже в мелочах — это может привести к неожиданным приятным результатам. Помните, что ваша энергия и упорство способны творить чудеса!',
      },
      {
        title: 'Козерог',
        description: 'Декабрь 22 - Январь 19',
        img: '/img/zodiacs/capricorn.webp',
        text: 'Сегодня Козерог, ты чувствуешь себя уверенно и целеустремленно. В любви возможны приятные сюрпризы — не бойся проявлять свои чувства. На работе тебя ждет продуктивный день, но не забывай делать паузы для отдыха. Здоровье требует внимания: удели время легкой физической активности. Настроение стабильное, но добавь немного спонтанности в свои планы. Совет дня: верь в свои силы, даже маленькие шаги ведут к большим результатам. Ты способен на большее, чем думаешь!',
      },
    ],
  },
  {
    element: 'air',
    signs: [
      {
        title: 'Близнецы',
        description: 'Май 21 - Июнь 20',
        img: '/img/zodiacs/gemini.webp',
        text: 'Сегодня Близнецы могут почувствовать себя в центре внимания — это отличный день для общения и новых знакомств. В любви возможны приятные сюрпризы, будьте открыты для диалога. На работе проявите гибкость — это поможет справиться с задачами быстрее. Здоровье требует внимания: не забывайте про отдых и небольшие паузы. Настроение будет переменчивым, но в целом позитивным. Совет дня: не бойтесь пробовать что-то новое, даже если это кажется незначительным. Вдохновение приходит к тем, кто готов действовать!',
      },
      {
        title: 'Весы',
        description: 'Сентябрь 23 - Октябрь 22',
        img: '/img/zodiacs/libra.webp',
        text: 'Сегодня Весы могут почувствовать гармонию в отношениях — это отличный день для искренних разговоров и сближения. На работе вас ждут новые идеи, которые помогут продвинуться вперед, но не забывайте о балансе. Здоровье требует внимания: уделите время отдыху и легкой физической активности. Настроение будет стабильным, если вы сосредоточитесь на позитиве. Совет дня: не бойтесь принимать решения, даже если они кажутся сложными. Помните, что каждый шаг вперед — это путь к вашей лучшей версии!',
      },
      {
        title: 'Водолей',
        description: 'Январь 20 - Февраль 18',
        img: '/img/zodiacs/aquarius.webp',
        text: 'Сегодня Водолеям стоит обратить внимание на свои чувства — в любви возможны приятные сюрпризы, будьте открыты новым знакомствам. На работе проявите инициативу, ваши идеи могут получить поддержку. Здоровье требует заботы — не забывайте про отдых и умеренные физические нагрузки. Настроение будет переменчивым, но в целом позитивным. Совет дня: не бойтесь выходить из зоны комфорта, это принесёт новые возможности. Помните, что даже маленькие шаги ведут к большим переменам!',
      },
    ],
  },
  {
    element: 'water',
    signs: [
      {
        title: 'Рак',
        description: 'Июнь 21 - Июль 22',
        img: '/img/zodiacs/cancer.webp',
        text: 'Сегодня Ракам стоит уделить внимание близким — в любви вас ждут теплые моменты и взаимопонимание. На работе возможны небольшие трудности, но ваша интуиция подскажет верное решение. Здоровье требует заботы: не забывайте про отдых и умеренные нагрузки. Настроение будет переменчивым, но к вечеру вы почувствуете гармонию. Совет дня: доверяйте себе и не бойтесь проявлять инициативу. Помните, что даже маленькие шаги ведут к большим переменам!',
      },
      {
        title: 'Скорпион',
        description: 'Октябрь 23 - Ноябрь 21',
        img: '/img/zodiacs/scorpio.webp',
        text: 'Сегодня Скорпионы могут почувствовать усиление эмоциональной связи с близкими — это отличный день для искренних разговоров и проявления заботы. На работе возможны неожиданные идеи, которые помогут продвинуть проекты вперед. Здоровье требует внимания: не забывайте о балансе между активностью и отдыхом. Настроение будет переменчивым, но внутренняя сила поможет справиться с любыми трудностями. Совет дня: доверяйте своей интуиции, она подскажет верный путь. Помните, что даже небольшие шаги ведут к большим переменам — верьте в себя!',
      },
      {
        title: 'Рыбы',
        description: 'Февраль 19 - Март 20',
        img: '/img/zodiacs/fish.webp',
        text: 'Сегодня Рыбы могут почувствовать особую гармонию в отношениях — это отличный день для искренних разговоров и сближения. На работе вас ждут новые идеи, но не спешите брать на себя слишком много — распределяйте задачи грамотно. Здоровье требует внимания: уделите время отдыху и расслаблению. Настроение будет слегка мечтательным, но это поможет вам увидеть новые возможности. Совет дня: доверя интуиции, вы найдете верный путь. Помните, что даже маленькие шаги ведут к большим переменам!',
      },
    ],
  },
];

// API-обработчик для возврата актуального гороскопа
export default defineEventHandler(async () => {
  return horoscope;
});

// Функция задержки (delay) с использованием Promise и setTimeout
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const updateHoroscope = async () => {
  try {
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: config.deepseekApiKey,
    });

    // Клонируем исходный массив, чтобы не изменять его напрямую (если это необходимо)
    const updatedHoroscope = [];

    // Проходим по каждому элементу zodiacSigns
    for (const zodiac of zodiacSigns) {
      const updatedSigns = [];

      // Последовательно обрабатываем каждый знак
      for (const sign of zodiac.signs) {
        try {
          const answer = await openai.chat.completions.create({
            messages: [{ role: 'system', content: defaultPromt(sign.title) }],
            model: 'deepseek-chat',
            max_tokens: 82,
          });

          const text = answer.choices[0]?.message?.content;
          updatedSigns.push({ ...sign, text });
        } catch (e) {
          console.error(`Ошибка при обновлении для ${sign.title}:`, e);
          updatedSigns.push({ ...sign });
        }

        await delay(10000);
      }

      updatedHoroscope.push({ ...zodiac, signs: updatedSigns });
    }

    horoscope = updatedHoroscope;
  } catch (error) {
    console.error('Deepseek API error:', error);
  }
};

// Запускаем обновление гороскопа по расписанию: в 16:48 каждый день
// cron.schedule('13 20 * * *', () => {
//   updateHoroscope();
// });
