// Stellara Forge — генерация sign_pair_combos через RouterAI (DeepSeek V4)
// Использование: ROUTERAI_API_KEY=sk-xxx node forge.cjs mercury venus
// Параллельно 3 пары:
//   node forge.cjs mercury venus &
//   node forge.cjs mars jupiter &
//   node forge.cjs sun moon &
//
// Требуется: Node.js 18+, файл FORGE_PROMPT_V5.md в той же папке

const fs = require('fs');
const path = require('path');

// ── Конфигурация ──────────────────────────────────
const API_URL = 'https://routerai.ru/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-v4-flash';
const API_KEY = process.env.ROUTERAI_API_KEY;
const TEMPERATURE = 0.8;
const MAX_TOKENS = 4096;
const MAX_RETRIES = 3;
const RATE_LIMIT_MS = 500;

if (!API_KEY) {
  console.error('❌ ROUTERAI_API_KEY не задан.');
  process.exit(1);
}

// ── Аргументы ─────────────────────────────────────
const [p1, p2] = process.argv.slice(2);
if (!p1 || !p2) {
  console.error('❌ Укажите пару планет: node forge.cjs mercury venus');
  process.exit(1);
}

// ── Справочники ───────────────────────────────────
const PLANETS = {
  sun: { name: 'Солнце', genus: 'средний', theme: 'ядро личности, воля, самовыражение' },
  moon: { name: 'Луна', genus: 'женский', theme: 'эмоции, потребности, душа' },
  mercury: { name: 'Меркурий', genus: 'мужской', theme: 'мышление, речь, восприятие' },
  venus: { name: 'Венера', genus: 'женский', theme: 'ценности, вкус, отношения' },
  mars: { name: 'Марс', genus: 'мужской', theme: 'действие, импульс, напор' },
  jupiter: { name: 'Юпитер', genus: 'мужской', theme: 'смысл, расширение, оптимизм' },
  saturn: { name: 'Сатурн', genus: 'мужской', theme: 'дисциплина, структура, ограничения' },
  uranus: { name: 'Уран', genus: 'мужской', theme: 'свобода, оригинальность, бунт' },
  neptune: { name: 'Нептун', genus: 'мужской', theme: 'интуиция, идеалы, воображение' },
  pluto: { name: 'Плутон', genus: 'мужской', theme: 'глубина, трансформация, власть' },
  asc: { name: 'Асцендент', genus: 'мужской', theme: 'внешнее проявление, маска, первый контакт' },
};

const SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
];

const SIGN_NAMES = {
  aries: 'Овен',
  taurus: 'Телец',
  gemini: 'Близнецы',
  cancer: 'Рак',
  leo: 'Лев',
  virgo: 'Дева',
  libra: 'Весы',
  scorpio: 'Скорпион',
  sagittarius: 'Стрелец',
  capricorn: 'Козерог',
  aquarius: 'Водолей',
  pisces: 'Рыбы',
};

const SIGN_PREP = {
  aries: 'Овне',
  taurus: 'Тельце',
  gemini: 'Близнецах',
  cancer: 'Раке',
  leo: 'Льве',
  virgo: 'Деве',
  libra: 'Весах',
  scorpio: 'Скорпионе',
  sagittarius: 'Стрельце',
  capricorn: 'Козероге',
  aquarius: 'Водолее',
  pisces: 'Рыбах',
};

const p1Info = PLANETS[p1];
const p2Info = PLANETS[p2];
if (!p1Info || !p2Info) {
  console.error('❌ Неизвестная планета. Доступны:', Object.keys(PLANETS).join(', '));
  process.exit(1);
}

// ── Загрузка промпта ──────────────────────────────
const promptPath = path.join(__dirname, 'FORGE_PROMPT_V5.md');
if (!fs.existsSync(promptPath)) {
  console.error('❌ Файл FORGE_PROMPT_V5.md не найден в', __dirname);
  process.exit(1);
}
const forgePrompt = fs
  .readFileSync(promptPath, 'utf-8')
  .replace(/\{planet1\}/g, `${p1Info.name} (${p1Info.genus})`)
  .replace(/\{planet2\}/g, `${p2Info.name} (${p2Info.genus})`)
  .replace(/\{p1\}/g, p1)
  .replace(/\{p2\}/g, p2);

// ── Выходной файл ─────────────────────────────────
const outDir = path.join(__dirname, 'generated', 'sign_pair_combos');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${p1}_${p2}.json`);

// ── API-клиент ────────────────────────────────────
async function apiCall(messages) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text.substring(0, 300)}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('Пустой ответ API');
  return content;
}

// ── Парсинг JSON из ответа ────────────────────────
function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {}

  const md = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (md)
    try {
      return JSON.parse(md[1].trim());
    } catch {}

  const obj = raw.match(/\{[\s\S]*\}/);
  if (obj)
    try {
      return JSON.parse(obj[0]);
    } catch {}

  return null;
}

// ── Валидация одной записи ────────────────────────
const BANNED = [
  'будет', 'произойдёт', 'вас ждёт', 'вам предстоит',
  'уникальные способности', 'раскрыть потенциал', 'достичь успеха',
  'сметка', 'пронизывают всё', 'окутана интуицией',
  'архитектор', 'фундамент', 'башня', 'бездна', 'шпиль',
  'энергия', 'глубина', 'внутренний стержень', 'сила характера',
  'потенциал', 'ресурс', 'вибрации', 'уникальность', 'предназначение',
  'эта комбинация соединяет', 'планета даёт', 'знак наделяет',
  'выйти из зоны комфорта', 'зона комфорта',
  'найти баланс', 'искать баланс',
  'быть собой', 'оставаться собой',
  'работать над собой',
  'идти своим путём',
  'раскрывать себя',
  'личностный рост',
  'стремиться к развитию',
];

function validateEntry(key, entry) {
  if (!entry?.key || !entry?.short || !entry?.full || !entry?.tags) return 'missing fields';
  if (entry.key !== key) return `key mismatch: ${entry.key}`;

  const sw = entry.short.split(/\s+/).length;
  if (sw < 10 || sw > 28) return `short words: ${sw}`;

  const fw = entry.full.split(/\s+/).length;
  if (fw < 45 || fw > 90) return `full words: ${fw}`;

  if (!Array.isArray(entry.tags) || entry.tags.length < 2 || entry.tags.length > 3) return 'tags';

  const lower = (entry.short + ' ' + entry.full).toLowerCase();
  for (const w of BANNED) {
    if (lower.includes(w)) return `banned: "${w}"`;
  }

  return null;
}

// ── Генерация одного батча (12 комбинаций) ────────
async function generateBatch(sign1) {
  const sign1Name = SIGN_NAMES[sign1];
  const batchStartId = SIGNS.indexOf(sign1) * 12 + 1;

  const systemPrompt = forgePrompt;

  const userPrompt = `Сгенерируй 12 текстов: ${p1Info.name} в ${SIGN_PREP[sign1]} × ${p2Info.name} во всех 12 знаках.

СТРОГО JSON-объект с 12 ключами "signpair.${p1}_${p2}.${sign1}_<sign2>".
Каждый ключ — массив из одного объекта:
{
  "id": <${batchStartId}–${batchStartId + 11}>,
  "key": "signpair.${p1}_${p2}.${sign1}_<sign2>",
  "type": "sign_pair_combo",
  "short": "<10-18 слов>",
  "full": "<4-6 предложений, 50-70 слов. Структура: ${p1Info.name} → ${p2Info.name} → взаимодействие → вызов>",
  "tags": ["<2-3 тега>"],
  "audience": "general", "lang": "ru", "version": "1.0", "needs_review": false
}

Знаки: ${SIGNS.join(', ')}. Только JSON.`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) await sleep(1000);
    console.log(`  👉 ${sign1Name} → API (попытка ${attempt}/${MAX_RETRIES})...`);

    try {
      const raw = await apiCall([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      const parsed = parseJSON(raw);
      if (!parsed) {
        console.error(`  ⚠️ Не JSON, перезапрос...`);
        continue;
      }

      const entries = {};
      let ok = true;
      for (const s2 of SIGNS) {
        const key = `signpair.${p1}_${p2}.${sign1}_${s2}`;
        const val = parsed[key];
        if (!val) {
          console.error(`  ❌ Нет ключа: ${key}`);
          ok = false;
          continue;
        }
        const entry = Array.isArray(val) ? val[0] : val;
        const err = validateEntry(key, entry);
        if (err) {
          console.error(`  ❌ ${key}: ${err}`);
          ok = false;
        } else {
          entries[key] = [entry];
          console.log(`  ✅ ${SIGN_NAMES[s2]}`);
        }
      }

      if (ok) return entries;
      console.error(`  🔄 Валидация не прошла, перезапрос...`);
    } catch (e) {
      console.error(`  ⚠️ Ошибка: ${e.message}`);
    }
  }

  throw new Error(`Не удалось за ${MAX_RETRIES} попыток: ${sign1Name}`);
}

// ── Утилиты ───────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function batchDone(allEntries, sign1) {
  return SIGNS.every((s2) => {
    const k = `signpair.${p1}_${p2}.${sign1}_${s2}`;
    return allEntries[k]?.length === 1;
  });
}

// ── main ──────────────────────────────────────────
async function main() {
  console.log(`\n🔥 Stellara Forge — RouterAI / DeepSeek V4 Flash`);
  console.log(`   Пара: ${p1Info.name} × ${p2Info.name}`);
  console.log(`   Файл: ${p1}_${p2}.json\n`);

  let allEntries = {};
  if (fs.existsSync(outPath)) {
    allEntries = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
    console.log(`📂 Существующих ключей: ${Object.keys(allEntries).length}\n`);
  }

  let generated = 0;

  for (const sign1 of SIGNS) {
    if (batchDone(allEntries, sign1)) {
      console.log(`⏭️ ${SIGN_NAMES[sign1]} — готово (12 ключей)`);
      continue;
    }

    try {
      const entries = await generateBatch(sign1);
      Object.assign(allEntries, entries);
      generated++;

      fs.writeFileSync(outPath, JSON.stringify(allEntries, null, 2), 'utf-8');
      console.log(`  💾 ${Object.keys(allEntries).length} / 144\n`);

      await sleep(RATE_LIMIT_MS);
    } catch (e) {
      console.error(`  💥 ${e.message}`);
      fs.writeFileSync(outPath, JSON.stringify(allEntries, null, 2), 'utf-8');
      process.exit(1);
    }
  }

  // Финальная проверка
  const keys = Object.keys(allEntries);
  const issues = keys.filter((k) => !allEntries[k] || allEntries[k].length !== 1);

  console.log(`════════════════════════════════`);
  console.log(`Ключей: ${keys.length} / 144`);
  console.log(`Батчей за сессию: ${generated}`);
  console.log(`Проблем: ${issues.length ? issues.join(', ') : 'none'}`);
  console.log(`Статус: ${keys.length === 144 && !issues.length ? '✅ ГОТОВО' : '⚠️ ДОЗАПУСК'}`);
  console.log(`════════════════════════════════\n`);
}

main().catch((e) => {
  console.error('💥', e.message);
  process.exit(1);
});
