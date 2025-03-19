import OpenAI from 'openai';
import cron from 'node-cron';
import { zodiacSigns } from '@/assets/js/mockZodiacs.js';

const config = useRuntimeConfig();

const defaultPromt = (zodiac) => `Составь гороскоп знак зодиака ${zodiac} на сегодня. 
Охватывай основные сферы: любовь, работа, здоровье, настроение и совет дня. 
Стиль — дружелюбный и мотивирующий. Не используй сложные термины, текст должен быть понятным широкой аудитории. 
Добавь вдохновляющую нотку в конце. Не используй смайлики, длина текста не должна превышать 500 знаков. 
Не начинай со слова "Сегодня".`;

let horoscope = [];

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
