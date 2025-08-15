// server/api/generateBlocks.post.ts
import { defineEventHandler, readBody } from 'h3';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';

const config = useRuntimeConfig();

const OPENAI_API_KEY = config.deepseekApiKey;
if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set — endpoint will fail until it is provided.');
}

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: config.deepseekApiKey,
});

// Config
const DATA_DIR = path.resolve('./data/generated');
const DEFAULT_DELAY_MS = 800; // задержка между запросами (регулируй)
const DEFAULT_MODEL = 'deepseek-chat'; // поставь свой model

// Reference lists
const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
  'asc',
];
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
const HOUSES = Array.from({ length: 12 }, (_, i) => i + 1);
const ASPECTS = ['conjunction', 'sextile', 'square', 'trine', 'opposition'];
const LIFE_AREAS = [
  'relationships',
  'career',
  'finance',
  'health',
  'family',
  'creativity',
  'spirituality',
];

// --------- Prompt builders ----------
function buildSchemaNote() {
  return `
Возвращай строго валидный JSON-массив без Markdown-обёртки и экранирования, в raw-формате. Каждый объект должен иметь поля:
id, key, type, short, full, tags (массив), audience, lang, version, needs_review (boolean).
short: 8-14 слов. full: 35-70 слов. Тон: поддерживающий, информационно-психологический. 
Не использовать предсказательного тона ("будет", "произойдёт"). Возвращай только JSON.
`;
}

function promptForPlanetSign(planet: string, sign: string, variants = 12) {
  return `
Сгенерируй ${variants} уникальных вариантов текста для комбинации:
planet=${planet.toLowerCase()}, sign=${sign.toLowerCase()}.

${buildSchemaNote()}

Для каждого варианта:
- key: "planet.${planet}.sign.${sign}"
- type: "planet_sign"
- tags: включи 2-3 релевантных тэга (например: "коммуникация","карьера")
- audience: "novice"

Ключевые темы (пример для солнца в близнецах — используйте релевантные): коммуникабельность, любознательность, адаптивность.
Избегай профессионального жаргона и мед./юридических заявлений.
  `.trim();
}

function promptForPlanetHouse(planet: string, house: number, variants = 8) {
  return `
Сгенерируй ${variants} уникальных вариантов текста для комбинации:
planet=${planet.toLowerCase()}, house=${house}.

${buildSchemaNote()}

Для каждого варианта:
- key: "planet_house.${planet}.house_${house}"
- type: "planet_house"
- включи поля strengths (1-3), challenges (1-2), actionable (2 коротких шага).
- audience: "novice"
Фокус: как проявляется планета в данной сфере дома (пример: 10 дом — карьера).
  `.trim();
}

function promptForAspectPair(
  p1: string,
  s1: string,
  p2: string,
  s2: string,
  aspect: string,
  variants = 6
) {
  return `
Сгенерируй ${variants} вариантов для сочетания:
${p1.toLowerCase()} (${s1.toLowerCase()}) и ${p2.toLowerCase()} (${s2.toLowerCase()}) в аспекте ${aspect}.

${buildSchemaNote()}

Формат: key: "aspect.${p1}_${s1}_${p2}_${s2}_${aspect}", type: "aspect_pair".
Каждый объект: characteristic (1-2 предложения в full), strengths[], challenges[], actionable[].
Тон: эмпатичный, конструктивный.
  `.trim();
}

function promptForLifeArea(area: string, variants = 12) {
  return `
Сгенерируй ${variants} вариантов для жизненной сферы: "${area}".
${buildSchemaNote()}

key: "life.${area}"
type: "life_area"
Каждый объект: short (1 предложение), full (40-80 слов), strengths[], challenges[], actionable[2].
Тон: поддерживающий, практичный, без предсказаний.
  `.trim();
}

function promptForSignPairCombo(pairName: string, sign1: string, sign2: string, variants = 6) {
  // pairName e.g. "sun_moon"
  return `
Сгенерируй ${variants} вариантов для сочетания sign-pair:
pair=${pairName}, signs: ${sign1}, ${sign2}.
${buildSchemaNote()}

key: "signpair.${pairName}.${sign1}_${sign2}"
type: "sign_pair_combo"
Формат: id/key/type/short/full/tags/actionable...
Тон: психологический, прагматичный.
  `.trim();
}

// --------- Helpers ----------
async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function saveJsonToFile(dir: string, filename: string, jsonData: any) {
  await ensureDir(dir);
  const outPath = path.join(dir, filename);
  await fs.writeFile(outPath, JSON.stringify(jsonData, null, 2), 'utf8');
  return outPath;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callModel(
  prompt: string,
  model = DEFAULT_MODEL,
  max_tokens = 8000,
  temperature = 0.9
) {
  // NOTE: adapt this call depending on your OpenAI client version;
  // Here we use a typical "chat.completions.create" style, adjust if needed.
  const messages = [
    {
      role: 'system' as const,
      content:
        'Ты — генератор контента для натальных карт. Отдай только JSON-массив по указанной схеме.',
    },
    { role: 'user' as const, content: prompt },
  ];

  const res = await openai.chat.completions.create({
    model,
    messages,
    temperature,
    max_tokens,
    response_format: {
      type: 'json_object',
    },
  });

  const text = res.choices?.[0]?.message?.content;
  return text;
}

function tryParseJsonStrict(text: string) {
  // Try to locate JSON in text and parse
  // Remove leading/trailing text before/after JSON if present
  const first = text.indexOf('[');
  const last = text.lastIndexOf(']');
  if (first === -1 || last === -1) throw new Error('No JSON array found in model response');
  const jsonText = text.slice(first, last + 1);
  return JSON.parse(jsonText);
}

// --------- Generation routines (sequential) ----------
async function generatePlanetSignAll(opts: {
  delayMs?: number;
  variants?: number;
  outDir?: string;
}) {
  const delayMs = opts.delayMs ?? DEFAULT_DELAY_MS;
  const variants = opts.variants ?? 12;
  const outDir = opts.outDir ?? path.join(DATA_DIR, 'planet_sign');

  await ensureDir(outDir);

  // We'll generate per planet — each planet loop produces a file with all signs
  for (const planet of PLANETS) {
    const planetResults: Record<string, any[]> = {};
    for (const sign of SIGNS) {
      const prompt = promptForPlanetSign(planet, sign, variants);
      console.log(`Generating planet_sign for ${planet}.${sign} ...`);
      const raw = await callModel(prompt);
      try {
        if (!raw) {
          console.error(`Failed to parse model output for ${planet}.${sign}`);
          return;
        }
        const parsed = tryParseJsonStrict(raw);
        planetResults[sign] = parsed;
        console.log(`Parsed ${parsed.length} items for ${planet}.${sign}`);
      } catch (err) {
        console.error(`Failed to parse model output for ${planet}.${sign}:`, err);
        // Save raw for debugging
        await saveJsonToFile(path.join(outDir, 'raw'), `${planet}_${sign}_raw.txt`, raw);
        planetResults[sign] = [];
      }
      await sleep(delayMs);
    }
    // Save planet file
    const filename = `${planet}.json`;
    await saveJsonToFile(outDir, filename, planetResults);
    console.log(`Saved planet_sign file: ${filename}`);
  }
}

async function generatePlanetHouseAll(opts: {
  delayMs?: number;
  variants?: number;
  outDir?: string;
}) {
  const delayMs = opts.delayMs ?? DEFAULT_DELAY_MS;
  const variants = opts.variants ?? 8;
  const outDir = opts.outDir ?? path.join(DATA_DIR, 'planet_house');
  await ensureDir(outDir);

  for (const planet of PLANETS) {
    const planetResults: Record<string, any[]> = {};
    for (const house of HOUSES) {
      const prompt = promptForPlanetHouse(planet, house, variants);
      console.log(`Generating planet_house for ${planet}.house${house} ...`);
      const raw = await callModel(prompt);
      try {
        if (!raw) {
          console.error(`Failed to parse model output for ${planet}.house${house}`);
          return;
        }
        const parsed = tryParseJsonStrict(raw);
        planetResults[`house_${house}`] = parsed;
        console.log(`Parsed ${parsed.length} items for ${planet}.house${house}`);
      } catch (err) {
        console.error(`Failed to parse model output for ${planet}.house${house}:`, err);
        await saveJsonToFile(path.join(outDir, 'raw'), `${planet}_house${house}_raw.txt`, raw);
        planetResults[`house_${house}`] = [];
      }
      await sleep(delayMs);
    }
    const filename = `${planet}.json`;
    await saveJsonToFile(outDir, filename, planetResults);
    console.log(`Saved planet_house file: ${filename}`);
  }
}

async function generateAspectsAll(opts: { delayMs?: number; variants?: number; outDir?: string }) {
  const delayMs = opts.delayMs ?? DEFAULT_DELAY_MS;
  const variants = opts.variants ?? 6;
  const outDir = opts.outDir ?? path.join(DATA_DIR, 'aspects');
  await ensureDir(outDir);

  // All unordered planet pairs
  for (let i = 0; i < PLANETS.length; i++) {
    for (let j = i + 1; j < PLANETS.length; j++) {
      const p1 = PLANETS[i];
      const p2 = PLANETS[j];
      const pairKey = `${p1}_${p2}`;
      const pairResults: Record<string, any[]> = {};
      for (const aspect of ASPECTS) {
        // For broad coverage we won't include signs now; specific sign-pair combos go to sign_pair generator
        const prompt = `
Сгенерируй ${variants} вариантов для аспекта ${aspect} между планетами ${p1} и ${p2}.
${buildSchemaNote()}
key: "aspect.${pairKey}.${aspect}"
type: "aspect_pair"
Фокус: как влияет этот аспект на взаимодействие двух планет в карте.
        `.trim();
        console.log(`Generating aspect ${pairKey}.${aspect} ...`);
        const raw = await callModel(prompt);
        try {
          if (!raw) {
            console.error(`Failed to parse aspect model output for ${pairKey}.${aspect}`);
            return;
          }
          const parsed = tryParseJsonStrict(raw);
          pairResults[aspect] = parsed;
          console.log(`Parsed ${parsed.length} items for ${pairKey}.${aspect}`);
        } catch (err) {
          console.error(`Failed to parse aspect model output for ${pairKey}.${aspect}:`, err);
          await saveJsonToFile(path.join(outDir, 'raw'), `${pairKey}_${aspect}_raw.txt`, raw);
          pairResults[aspect] = [];
        }
        await sleep(delayMs);
      }
      await saveJsonToFile(outDir, `${pairKey}.json`, pairResults);
      console.log(`Saved aspects file: ${pairKey}.json`);
    }
  }
}

async function generateLifeAreasAll(opts: {
  delayMs?: number;
  variants?: number;
  outDir?: string;
}) {
  const delayMs = opts.delayMs ?? DEFAULT_DELAY_MS;
  const variants = opts.variants ?? 12;
  const outDir = opts.outDir ?? path.join(DATA_DIR, 'life_areas');
  await ensureDir(outDir);

  const allResults: Record<string, any[]> = {};
  for (const area of LIFE_AREAS) {
    const prompt = promptForLifeArea(area, variants);
    console.log(`Generating life area: ${area} ...`);
    const raw = await callModel(prompt);
    try {
      if (!raw) {
        console.error(`Failed to parse life area output for ${area}`);
        return;
      }
      const parsed = tryParseJsonStrict(raw);
      allResults[area] = parsed;
      console.log(`Parsed ${parsed.length} items for life area ${area}`);
    } catch (err) {
      console.error(`Failed to parse life area output for ${area}:`, err);
      await saveJsonToFile(path.join(outDir, 'raw'), `${area}_raw.txt`, raw);
      allResults[area] = [];
    }
    await sleep(delayMs);
  }
  await saveJsonToFile(outDir, `life_areas.json`, allResults);
  console.log('Saved life areas file');
}

// Sign-pair combos for prioritized planet pairs (6 pairs)
const PRIORITY_PAIRS = [
  ['sun', 'moon'],
  ['sun', 'venus'],
  ['moon', 'venus'],
  ['mars', 'saturn'],
  ['mercury', 'venus'],
  ['jupiter', 'saturn'],
];

async function generateSignPairCombosAll(opts: {
  delayMs?: number;
  variants?: number;
  outDir?: string;
}) {
  const delayMs = opts.delayMs ?? DEFAULT_DELAY_MS;
  const variants = opts.variants ?? 6;
  const outDir = opts.outDir ?? path.join(DATA_DIR, 'sign_pair_combos');
  await ensureDir(outDir);

  for (const [p1, p2] of PRIORITY_PAIRS) {
    const pairName = `${p1}_${p2}`;
    const pairResults: Record<string, any[]> = {};
    for (const s1 of SIGNS) {
      for (const s2 of SIGNS) {
        const prompt = promptForSignPairCombo(pairName, s1, s2, variants);
        console.log(`Generating sign-pair for ${pairName} : ${s1}-${s2} ...`);
        const raw = await callModel(prompt);
        try {
          if (!raw) {
            console.error(`Failed to parse sign-pair ${pairName}:${s1}-${s2}`);
            return;
          }
          const parsed = tryParseJsonStrict(raw);
          pairResults[`${s1}_${s2}`] = parsed;
          console.log(`Parsed ${parsed.length} items for ${pairName}:${s1}-${s2}`);
        } catch (err) {
          console.error(`Failed to parse sign-pair ${pairName}:${s1}-${s2}:`, err);
          await saveJsonToFile(path.join(outDir, 'raw'), `${pairName}_${s1}_${s2}_raw.txt`, raw);
          pairResults[`${s1}_${s2}`] = [];
        }
        await sleep(delayMs);
      }
    }
    await saveJsonToFile(outDir, `${pairName}.json`, pairResults);
    console.log(`Saved sign-pair file: ${pairName}.json`);
  }
}

// --------- Main handler ----------
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // body: { action: 'generate', category: 'planet_sign'|'planet_house'|'aspects'|'life_areas'|'sign_pair'|'runAll', options: {...} }
  const { action = 'generate', category = 'runAll', options = {} } = body;

  try {
    if (category === 'planet_sign') {
      await generatePlanetSignAll({ delayMs: options.delayMs, variants: options.variants });
      return { ok: true, message: 'planet_sign generation finished' };
    }
    if (category === 'planet_house') {
      await generatePlanetHouseAll({ delayMs: options.delayMs, variants: options.variants });
      return { ok: true, message: 'planet_house generation finished' };
    }
    if (category === 'aspects') {
      await generateAspectsAll({ delayMs: options.delayMs, variants: options.variants });
      return { ok: true, message: 'aspects generation finished' };
    }
    if (category === 'life_areas') {
      await generateLifeAreasAll({ delayMs: options.delayMs, variants: options.variants });
      return { ok: true, message: 'life_areas generation finished' };
    }
    if (category === 'sign_pair') {
      await generateSignPairCombosAll({ delayMs: options.delayMs, variants: options.variants });
      return { ok: true, message: 'sign_pair generation finished' };
    }
    if (category === 'runAll') {
      // Sequentially run all (in recommended order)
      await generatePlanetSignAll({ delayMs: options.delayMs, variants: options.variants ?? 12 });
      await generatePlanetHouseAll({ delayMs: options.delayMs, variants: options.variants ?? 8 });
      await generateAspectsAll({ delayMs: options.delayMs, variants: options.variants ?? 6 });
      await generateLifeAreasAll({ delayMs: options.delayMs, variants: options.variants ?? 12 });
      await generateSignPairCombosAll({
        delayMs: options.delayMs,
        variants: options.variants ?? 6,
      });
      return { ok: true, message: 'All categories generated' };
    }

    return { ok: false, message: 'Unknown category' };
  } catch (err: any) {
    console.error('Generation error:', err);
    throw err;
  }
});
