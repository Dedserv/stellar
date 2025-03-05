const config = useRuntimeConfig();
import OpenAI from 'openai';

export default defineEventHandler(async (event) => {
  const { message } = getQuery(event);
  // try {
  //   const openai = new OpenAI({
  //     baseURL: 'https://api.deepseek.com',
  //     apiKey: config.deepseekApiKey,
  //   });

  //   const answer = await openai.chat.completions.create({
  //     messages: [{ role: 'system', content: message }],
  //     model: 'deepseek-chat',
  //   });

  //   return answer.choices[0].message.content;
  // } catch (error) {
  //   console.error('Deepseek API error:', error);
  //   throw createError({
  //     statusCode: error.response?.status || 500,
  //     statusMessage: 'Failed to fetch deepseek',
  //   });
  // }
});
