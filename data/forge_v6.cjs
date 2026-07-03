#!/usr/bin/env node
// Stellara Forge v6 — генерация sign_pair_combos через RouterAI (DeepSeek V4 Flash)
//
// Команды:
//   node forge_v6.cjs status              — сводка прогресса
//   node forge_v6.cjs sun moon            — генерация пары (resume)
//   node forge_v6.cjs sun moon --force    — перегенерация с нуля
//
// Требуется: Node.js 18+, ROUTERAI_API_KEY, forge_prompt_v6.md

const fs = require("fs");
const path = require("path");

const DATA_DIR = __dirname;
const API_URL = "https://routerai.ru/api/v1/chat/completions";
const MODEL = "deepseek/deepseek-v4-flash";
const API_KEY = "sk-xHhwoxGxfen6A9ExSVfG06BKhDOLnn9V";

const TEMPERATURE = 0.65;
const MAX_TOKENS_CAP = 8192;
const MAX_RETRIES = 3;
const RATE_LIMIT_MS = 500;
const BATCH_SIZE = 4;
const TOTAL_COMBOS = 144;

/** ~1000 output tokens per entry (short + full + JSON overhead) */
function maxTokensForChunkSize(n) {
  return Math.min(MAX_TOKENS_CAP, Math.max(1800, n * 1000 + 600));
}

const OUT_DIR = path.join(DATA_DIR, "generated", "sign_pair_combos");
const RAW_DIR = path.join(DATA_DIR, "generated", "raw");
const STATUS_PATH = path.join(DATA_DIR, "forge_status.json");
const REVIEW_CSV_PATH = path.join(DATA_DIR, "needs_review.csv");
const PROMPT_PATH = path.join(DATA_DIR, "forge_prompt_v6.md");

// Порядок из generation_plan.md, затем остальные пары из каталога
const PAIRS_PRIORITY = [
  "sun_moon",
  "asc_jupiter",
  "asc_mars",
  "asc_mercury",
  "asc_moon",
  "asc_neptune",
  "asc_pluto",
  "asc_saturn",
  "asc_sun",
  "asc_uranus",
  "asc_venus",
  "jupiter_mars",
  "jupiter_mercury",
  "jupiter_neptune",
  "jupiter_pluto",
  "jupiter_saturn",
  "jupiter_uranus",
  "jupiter_venus",
  "mars_mercury",
  "mars_neptune",
  "mars_pluto",
  "mars_saturn",
  "mars_uranus",
  "mars_venus",
  "mercury_neptune",
  "mercury_pluto",
  "mercury_saturn",
  "mercury_uranus",
  "mercury_venus",
  "moon_mercury",
  "moon_neptune",
  "moon_pluto",
  "moon_saturn",
  "moon_uranus",
  "moon_venus",
  "neptune_pluto",
  "neptune_saturn",
  "neptune_uranus",
  "pluto_saturn",
  "pluto_uranus",
  "saturn_uranus",
  "saturn_venus",
  "uranus_venus",
];

const PLANETS = {
  sun: {name: "Солнце", genus: "средний"},
  moon: {name: "Луна", genus: "женский"},
  mercury: {name: "Меркурий", genus: "мужской"},
  venus: {name: "Венера", genus: "женский"},
  mars: {name: "Марс", genus: "мужской"},
  jupiter: {name: "Юпитер", genus: "мужской"},
  saturn: {name: "Сатурн", genus: "мужской"},
  uranus: {name: "Уран", genus: "мужской"},
  neptune: {name: "Нептун", genus: "мужской"},
  pluto: {name: "Плутон", genus: "мужской"},
  asc: {name: "Асцендент", genus: "мужской"},
};

const SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

const SIGN_NAMES = {
  aries: "Овен",
  taurus: "Телец",
  gemini: "Близнецы",
  cancer: "Рак",
  leo: "Лев",
  virgo: "Дева",
  libra: "Весы",
  scorpio: "Скорпион",
  sagittarius: "Стрелец",
  capricorn: "Козерог",
  aquarius: "Водолей",
  pisces: "Рыбы",
};

const SIGN_PREP = {
  aries: "Овне",
  taurus: "Тельце",
  gemini: "Близнецах",
  cancer: "Раке",
  leo: "Льве",
  virgo: "Деве",
  libra: "Весах",
  scorpio: "Скорпионе",
  sagittarius: "Стрельце",
  capricorn: "Козероге",
  aquarius: "Водолее",
  pisces: "Рыбах",
};

const BANNED = [
  "будет",
  "произойдёт",
  "вас ждёт",
  "вам предстоит",
  "уникальные способности",
  "раскрыть потенциал",
  "архитектор",
  "фундамент",
  "башня",
  "бездна",
  "шпиль",
  "энергия",
  "глубина",
  "внутренний стержень",
  "сила характера",
  "ресурс",
  "вибрации",
  "уникальность",
  "предназначение",
  "эта комбинация соединяет",
  "планета даёт",
  "знак наделяет",
  "выйти из зоны комфорта",
  "зона комфорта",
  "искать баланс",
  "работать над собой",
  "идти своим путём",
  "раскрывать себя",
  "личностный рост",
  "стремиться к развитию",
];

const ENTRY_SCHEMA = {
  type: "object",
  properties: {
    id: {type: "integer"},
    key: {type: "string"},
    type: {type: "string", enum: ["sign_pair_combo"]},
    short: {type: "string"},
    full: {type: "string"},
    tags: {type: "array", items: {type: "string"}, minItems: 2, maxItems: 3},
    audience: {type: "string"},
    lang: {type: "string"},
    version: {type: "string"},
    needs_review: {type: "boolean"},
  },
  required: [
    "id",
    "key",
    "type",
    "short",
    "full",
    "tags",
    "audience",
    "lang",
    "version",
    "needs_review",
  ],
  additionalProperties: false,
};

const BATCH_RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: {
    type: "array",
    items: ENTRY_SCHEMA,
    minItems: 1,
    maxItems: 1,
  },
};

// ── CLI ───────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const force = args.includes("--force");
  const filtered = args.filter((a) => !a.startsWith("--"));

  if (filtered[0] === "status") {
    return {command: "status", force: false};
  }

  if (filtered.length < 2) {
    console.error(`
Stellara Forge v6

  node forge_v6.cjs status
  node forge_v6.cjs <p1> <p2> [--force]

Примеры:
  node forge_v6.cjs sun moon
  node forge_v6.cjs mercury venus --force
`);
    process.exit(1);
  }

  const [rawP1, rawP2] = filtered;
  const [p1, p2] = [rawP1, rawP2].sort();
  return {command: "generate", p1, p2, force};
}

function getAllPairsOrder() {
  const fromDisk = fs.existsSync(OUT_DIR)
    ? fs
        .readdirSync(OUT_DIR)
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(".json", ""))
    : [];

  const seen = new Set();
  const ordered = [];

  for (const pair of PAIRS_PRIORITY) {
    if (!seen.has(pair)) {
      seen.add(pair);
      ordered.push(pair);
    }
  }

  for (const pair of fromDisk.sort()) {
    if (!seen.has(pair)) {
      seen.add(pair);
      ordered.push(pair);
    }
  }

  return ordered;
}

function pairPath(pairName) {
  return path.join(OUT_DIR, `${pairName}.json`);
}

function fileKey(s1, s2) {
  return `${s1}_${s2}`;
}

function entryKey(p1, p2, s1, s2) {
  return `signpair.${p1}_${p2}.${s1}_${s2}`;
}

function comboId(s1, s2) {
  return SIGNS.indexOf(s1) * 12 + SIGNS.indexOf(s2) + 1;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function ensureDirs() {
  fs.mkdirSync(OUT_DIR, {recursive: true});
  fs.mkdirSync(RAW_DIR, {recursive: true});
}

// ── Status ────────────────────────────────────────

function loadStatus() {
  if (!fs.existsSync(STATUS_PATH)) {
    return {updated_at: null, pairs: {}, needs_review: []};
  }
  try {
    return JSON.parse(fs.readFileSync(STATUS_PATH, "utf-8"));
  } catch {
    return {updated_at: null, pairs: {}, needs_review: []};
  }
}

function saveStatus(status) {
  status.updated_at = new Date().toISOString();
  fs.writeFileSync(STATUS_PATH, JSON.stringify(status, null, 2), "utf-8");
}

function normalizeLoaded(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    const m = k.match(/([a-z]+_[a-z]+)$/);
    out[m ? m[1] : k] = v;
  }
  return out;
}

function scanPairFile(pairName, statusEntry) {
  const fp = pairPath(pairName);
  const result = {
    pair: pairName,
    status: "pending",
    keys: 0,
    needs_review: 0,
    errors: [],
    wrong_key_format: false,
    forge_version: statusEntry?.forge_version || null,
  };

  if (!fs.existsSync(fp)) {
    return result;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(fp, "utf-8"));
  } catch (e) {
    result.status = "failed";
    result.errors.push(`invalid JSON: ${e.message}`);
    return result;
  }

  const rawKeys = Object.keys(data);
  result.wrong_key_format = rawKeys.some((k) => k.startsWith("signpair."));
  const normalized = normalizeLoaded(data);
  result.keys = Object.keys(normalized).length;

  for (const [k, v] of Object.entries(normalized)) {
    if (!v || !Array.isArray(v) || v.length !== 1) {
      result.errors.push(`bad entry: ${k}`);
      continue;
    }
    if (v[0]?.needs_review) result.needs_review++;
  }

  if (result.wrong_key_format) {
    result.errors.push("wrong top-level key format (signpair.*)");
    result.status = "needs_regen";
    return result;
  }

  if (result.keys === TOTAL_COMBOS && result.errors.length === 0) {
    if (statusEntry?.forge_version !== 6) {
      result.status = "needs_regen";
      result.errors.push("not generated by forge v6 yet");
    } else {
      result.status = result.needs_review > 0 ? "done_with_review" : "done";
    }
  } else if (result.keys > 0) {
    result.status = "partial";
  } else {
    result.status = "pending";
  }

  return result;
}

function collectNeedsReview() {
  const items = [];
  for (const pair of getAllPairsOrder()) {
    const fp = pairPath(pair);
    if (!fs.existsSync(fp)) continue;
    let data;
    try {
      data = normalizeLoaded(JSON.parse(fs.readFileSync(fp, "utf-8")));
    } catch {
      continue;
    }
    for (const [combo, arr] of Object.entries(data)) {
      const entry = arr?.[0];
      if (!entry?.needs_review) continue;
      items.push({
        pair,
        combo,
        id: entry.id,
        reasons: entry.review_reasons || ["needs_review"],
        short_preview: (entry.short || "").slice(0, 80),
      });
    }
  }
  return items;
}

function exportReviewCsv(items) {
  const header = "pair,combo,id,reasons,short_preview";
  const rows = items.map((i) => {
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    return [i.pair, i.combo, i.id, i.reasons.join("; "), i.short_preview]
      .map(esc)
      .join(",");
  });
  fs.writeFileSync(REVIEW_CSV_PATH, [header, ...rows].join("\n"), "utf-8");
}

function refreshStatusFromDisk(status) {
  status.pairs = status.pairs || {};
  for (const pair of getAllPairsOrder()) {
    status.pairs[pair] = {
      ...scanPairFile(pair, status.pairs[pair]),
      forge_version: status.pairs[pair]?.forge_version || null,
    };
  }
  status.queue = getAllPairsOrder();
  status.needs_review = collectNeedsReview();
  status.summary = {
    total: status.queue.length,
    done: 0,
    done_with_review: 0,
    partial: 0,
    pending: 0,
    failed: 0,
    needs_regen: 0,
  };
  for (const p of Object.values(status.pairs)) {
    status.summary[p.status] = (status.summary[p.status] || 0) + 1;
  }
  exportReviewCsv(status.needs_review);
  saveStatus(status);
  return status;
}

function printStatus(status) {
  const s = status.summary;
  console.log("\n══════════════════════════════════════════");
  console.log("  Stellara Forge v6 — статус");
  console.log("══════════════════════════════════════════");
  console.log(`  Обновлено: ${status.updated_at || "—"}`);
  console.log(`  Всего пар: ${s.total}`);
  console.log(`  ✅ Готово:           ${s.done || 0}`);
  console.log(`  ⚠️  Готово + review:  ${s.done_with_review || 0}`);
  console.log(`  🔄 Частично:         ${s.partial || 0}`);
  console.log(`  🔁 Нужен regen:      ${s.needs_regen || 0}`);
  console.log(`  ⏸️  Ожидает:          ${s.pending || 0}`);
  console.log(`  ❌ Ошибка:           ${s.failed || 0}`);
  console.log(`  📋 needs_review:     ${status.needs_review.length} записей`);
  console.log(`  📄 CSV:              ${REVIEW_CSV_PATH}`);
  console.log("──────────────────────────────────────────");

  const pending = status.queue.filter((pair) => {
    const p = status.pairs[pair];
    return (
      !p || ["pending", "partial", "failed", "needs_regen"].includes(p.status)
    );
  });

  if (pending.length) {
    console.log("\n  Очередь (следующие):");
    pending.slice(0, 10).forEach((pair, i) => {
      const p = status.pairs[pair];
      const detail = p ? `${p.keys}/144` : "0/144";
      const err = p?.errors?.length ? ` [${p.errors[0]}]` : "";
      console.log(`    ${i + 1}. ${pair} — ${detail}${err}`);
    });
    if (pending.length > 10) console.log(`    ... ещё ${pending.length - 10}`);
  }

  const problems = status.queue.filter((pair) => {
    const p = status.pairs[pair];
    return p && (p.errors.length > 0 || p.wrong_key_format);
  });

  if (problems.length) {
    console.log("\n  Проблемные файлы:");
    for (const pair of problems) {
      const p = status.pairs[pair];
      console.log(`    ${pair}: ${p.errors.join("; ")}`);
    }
  }

  console.log("\n══════════════════════════════════════════\n");
}

// ── Validation ────────────────────────────────────

function validateEntry(p1, p2, s1, s2, entry) {
  const hardErrors = [];
  const softWarnings = [];

  const expectedKey = entryKey(p1, p2, s1, s2);
  const fk = fileKey(s1, s2);

  if (!entry?.short || !entry?.full || !entry?.tags) {
    hardErrors.push(`${fk}: missing fields`);
    return {hardErrors, softWarnings, entry: null};
  }

  if (entry.key && entry.key !== expectedKey) {
    softWarnings.push(`key mismatch: ${entry.key} → ${expectedKey}`);
  }

  if (
    !Array.isArray(entry.tags) ||
    entry.tags.length < 2 ||
    entry.tags.length > 3
  ) {
    hardErrors.push(`${fk}: tags count`);
    return {hardErrors, softWarnings, entry: null};
  }

  const sw = entry.short.split(/\s+/).filter(Boolean).length;
  if (sw < 12 || sw > 25) softWarnings.push(`short words: ${sw} (need 12-25)`);

  const fw = entry.full.split(/\s+/).filter(Boolean).length;
  if (fw < 50 || fw > 80) softWarnings.push(`full words: ${fw} (need 50-80)`);

  const lower = (entry.short + " " + entry.full).toLowerCase();
  for (const w of BANNED) {
    if (lower.includes(w)) softWarnings.push(`banned: "${w}"`);
  }

  const normalized = {
    id: comboId(s1, s2),
    key: expectedKey,
    type: "sign_pair_combo",
    short: entry.short.trim(),
    full: entry.full.trim(),
    tags: entry.tags.map((t) => String(t).trim()),
    audience: entry.audience || "general",
    lang: entry.lang || "ru",
    version: entry.version || "1.0",
    needs_review: softWarnings.length > 0,
  };

  if (softWarnings.length) normalized.review_reasons = softWarnings;

  return {hardErrors, softWarnings, entry: normalized};
}

// ── API ───────────────────────────────────────────

function buildBatchSchema(chunkKeys) {
  const properties = {};
  for (const k of chunkKeys) {
    properties[k] = {
      type: "array",
      items: ENTRY_SCHEMA,
      minItems: 1,
      maxItems: 1,
    };
  }
  return {
    type: "object",
    properties,
    required: chunkKeys,
    additionalProperties: false,
  };
}

async function apiCall(messages, chunkKeys, useStructured, maxTokens) {
  const body = {
    model: MODEL,
    messages,
    temperature: TEMPERATURE,
    max_tokens: maxTokens ?? maxTokensForChunkSize(chunkKeys.length),
    frequency_penalty: 0.1,
  };

  if (useStructured) {
    body.structured_outputs = true;
    body.response_format = {
      type: "json_schema",
      json_schema: {
        name: "sign_pair_batch",
        strict: true,
        schema: buildBatchSchema(chunkKeys),
      },
    };
  } else {
    body.response_format = {type: "json_object"};
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API ${res.status}: ${text.substring(0, 400)}`);
    err.status = res.status;
    throw err;
  }

  const json = await res.json();
  const choice = json.choices?.[0];
  const content = choice?.message?.content;
  const finishReason = choice?.finish_reason || "unknown";

  if (content == null || content === "") {
    const err = new Error("Пустой ответ API");
    err.finishReason = finishReason;
    err.usage = json.usage;
    err.rawChoice = JSON.stringify(choice || {}).substring(0, 300);
    throw err;
  }

  return {content, finishReason, usage: json.usage};
}

function parseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch {}

  const md = raw.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (md) {
    try {
      return JSON.parse(md[1].trim());
    } catch {}
  }

  const obj = raw.match(/\{[\s\S]*\}/);
  if (obj) {
    try {
      return JSON.parse(obj[0]);
    } catch {}
  }

  return null;
}

function saveRaw(pairName, sign1, chunkKeys, attempt, raw, finishReason) {
  const name = `${pairName}_${sign1}_${chunkKeys[0]}_${attempt}.txt`;
  const fp = path.join(RAW_DIR, name);
  fs.writeFileSync(fp, `finish_reason: ${finishReason}\n\n${raw}`, "utf-8");
  return fp;
}

function writePairFile(pairName, allEntries) {
  const ordered = {};
  for (const s1 of SIGNS) {
    for (const s2 of SIGNS) {
      const k = fileKey(s1, s2);
      if (allEntries[k]) ordered[k] = allEntries[k];
    }
  }
  fs.writeFileSync(
    pairPath(pairName),
    JSON.stringify(ordered, null, 2),
    "utf-8",
  );
}

function entryDone(allEntries, s1, s2) {
  const k = fileKey(s1, s2);
  const arr = allEntries[k];
  return (
    Array.isArray(arr) && arr.length === 1 && arr[0]?.short && arr[0]?.full
  );
}

function loadForgePrompt(p1, p2) {
  if (!fs.existsSync(PROMPT_PATH)) {
    throw new Error(`Промпт не найден: ${PROMPT_PATH}`);
  }
  const p1Info = PLANETS[p1];
  const p2Info = PLANETS[p2];
  return fs
    .readFileSync(PROMPT_PATH, "utf-8")
    .replace(/\{planet1\}/g, `${p1Info.name} (${p1Info.genus})`)
    .replace(/\{planet2\}/g, `${p2Info.name} (${p2Info.genus})`)
    .replace(/\{p1\}/g, p1)
    .replace(/\{p2\}/g, p2);
}

function buildUserPrompt(p1, p2, sign1, chunk) {
  const p1Info = PLANETS[p1];
  const p2Info = PLANETS[p2];
  const sign1Name = SIGN_NAMES[sign1];

  const lines = chunk.map(({s1, s2}) => {
    const fk = fileKey(s1, s2);
    const id = comboId(s1, s2);
    return `- "${fk}" (id=${id}): ${p1Info.name} в ${SIGN_PREP[s1]} × ${p2Info.name} в ${SIGN_PREP[s2]}`;
  });

  return `Сгенерируй ${chunk.length} JSON-записи для sign_pair_combo.

Комбинации:
${lines.join("\n")}

Требования:
- Top-level ключи: ${chunk.map((c) => `"${fileKey(c.s1, c.s2)}"`).join(", ")}
- Каждый ключ — массив из одного объекта
- short: 12-25 слов, full: 50-80 слов
- Опиши живого человека, без планет и знаков в тексте
- id = указанный номер для каждой комбинации
- key = "signpair.${p1}_${p2}.<sign1>_<sign2>"

Верни только JSON-объект.`;
}

async function generateChunk(p1, p2, pairName, sign1, chunk, allEntries) {
  const pending = chunk.filter(({s1, s2}) => !entryDone(allEntries, s1, s2));
  if (!pending.length) return {saved: [], review: []};
  return generateChunkInternal(
    p1,
    p2,
    pairName,
    sign1,
    pending,
    allEntries,
    null,
  );
}

async function generateChunkInternal(
  p1,
  p2,
  pairName,
  sign1,
  chunk,
  allEntries,
  maxTokensOverride,
) {
  const sign1Name = SIGN_NAMES[sign1];
  const chunkKeys = chunk.map((c) => fileKey(c.s1, c.s2));
  const systemPrompt = loadForgePrompt(p1, p2);
  const userPrompt = buildUserPrompt(p1, p2, sign1, chunk);
  const maxTokens = maxTokensOverride ?? maxTokensForChunkSize(chunk.length);

  let useStructured = true;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 1) await sleep(1500 * attempt);
    const label = chunkKeys.join(", ");
    console.log(
      `  👉 ${sign1Name} [${label}] ×${chunk.length} tok=${maxTokens} попытка ${attempt}/${MAX_RETRIES}...`,
    );

    try {
      let result;
      try {
        result = await apiCall(
          [
            {role: "system", content: systemPrompt},
            {role: "user", content: userPrompt},
          ],
          chunkKeys,
          useStructured,
          maxTokens,
        );
      } catch (e) {
        if (
          useStructured &&
          (e.status === 400 || /structured|schema|json_schema/i.test(e.message))
        ) {
          console.warn(
            "  ⚠️ structured_outputs не поддержан, fallback → json_object",
          );
          useStructured = false;
          result = await apiCall(
            [
              {role: "system", content: systemPrompt},
              {role: "user", content: userPrompt},
            ],
            chunkKeys,
            false,
            maxTokens,
          );
        } else if (e.message === "Пустой ответ API") {
          console.error(
            `  ⚠️ Пустой ответ (finish=${e.finishReason || "?"}, retry через ${1.5 * attempt}s)`,
          );
          if (e.rawChoice) console.error(`     choice: ${e.rawChoice}`);
          continue;
        } else {
          throw e;
        }
      }

      const {content, finishReason} = result;

      if (finishReason === "length") {
        console.error(
          `  ⚠️ Truncated (finish_reason=length, max_tokens=${maxTokens})`,
        );
        saveRaw(
          pairName,
          sign1,
          chunkKeys,
          attempt,
          content || "",
          finishReason,
        );

        const salvaged = await trySalvagePartial(
          p1,
          p2,
          pairName,
          sign1,
          chunk,
          allEntries,
          content,
        );
        if (salvaged.remaining.length === 0) {
          return salvaged.result;
        }

        if (chunk.length > 1) {
          console.log(
            `  ↓ split ${chunk.length} → ${Math.ceil(chunk.length / 2)} + ${Math.floor(chunk.length / 2)}`,
          );
          const mid = Math.ceil(chunk.length / 2);
          const r1 = await generateChunkInternal(
            p1,
            p2,
            pairName,
            sign1,
            salvaged.remaining.slice(0, mid),
            allEntries,
            null,
          );
          const r2 = await generateChunkInternal(
            p1,
            p2,
            pairName,
            sign1,
            salvaged.remaining.slice(mid),
            allEntries,
            null,
          );
          return {
            saved: [
              ...(salvaged.result?.saved || []),
              ...r1.saved,
              ...r2.saved,
            ],
            review: [
              ...(salvaged.result?.review || []),
              ...r1.review,
              ...r2.review,
            ],
          };
        }

        if (maxTokens < MAX_TOKENS_CAP) {
          console.log(
            `  ↑ retry single entry with max_tokens=${MAX_TOKENS_CAP}`,
          );
          return generateChunkInternal(
            p1,
            p2,
            pairName,
            sign1,
            chunk,
            allEntries,
            MAX_TOKENS_CAP,
          );
        }

        continue;
      }

      const parsed = parseJSON(content);
      if (!parsed) {
        console.error("  ⚠️ Не JSON");
        saveRaw(pairName, sign1, chunkKeys, attempt, content, finishReason);
        continue;
      }

      const processResult = processChunkResponse(
        p1,
        p2,
        pairName,
        chunk,
        allEntries,
        parsed,
      );
      if (processResult.complete) {
        return processResult;
      }

      if (processResult.saved.length) {
        writePairFile(pairName, allEntries);
        const remaining = chunk.filter(
          ({s1, s2}) => !entryDone(allEntries, s1, s2),
        );
        if (remaining.length && remaining.length < chunk.length) {
          console.log(
            `  ↻ догенерируем ${remaining.length} из ${chunk.length}...`,
          );
          const rest = await generateChunkInternal(
            p1,
            p2,
            pairName,
            sign1,
            remaining,
            allEntries,
            null,
          );
          return {
            saved: [...processResult.saved, ...rest.saved],
            review: [...processResult.review, ...rest.review],
          };
        }
      }

      console.error("  🔄 Батч неполный или с ошибками, перезапрос...");
    } catch (e) {
      console.error(`  ⚠️ ${e.message}`);
    }
  }

  throw new Error(
    `Не удалось за ${MAX_RETRIES} попыток: ${sign1Name} [${chunkKeys.join(", ")}]`,
  );
}

function processChunkResponse(p1, p2, pairName, chunk, allEntries, parsed) {
  const normalized = normalizeLoaded(parsed);
  let hardFail = false;
  const saved = [];
  const review = [];

  for (const {s1, s2} of chunk) {
    const fk = fileKey(s1, s2);
    const val =
      normalized[fk] ?? parsed[fk] ?? parsed[entryKey(p1, p2, s1, s2)];
    if (!val) {
      console.error(`  ❌ Нет ключа: ${fk}`);
      hardFail = true;
      continue;
    }
    const rawEntry = Array.isArray(val) ? val[0] : val;
    const {hardErrors, softWarnings, entry} = validateEntry(
      p1,
      p2,
      s1,
      s2,
      rawEntry,
    );
    if (hardErrors.length) {
      console.error(`  ❌ ${fk}: ${hardErrors.join("; ")}`);
      hardFail = true;
      continue;
    }

    allEntries[fk] = [entry];
    saved.push(fk);
    if (entry.needs_review) review.push(fk);
    const flag = softWarnings.length ? " ⚠️ review" : "";
    console.log(`  ✅ ${SIGN_NAMES[s2]}${flag}`);
  }

  if (saved.length) {
    writePairFile(pairName, allEntries);
  }

  return {
    complete: !hardFail && saved.length === chunk.length,
    saved,
    review,
  };
}

async function trySalvagePartial(
  p1,
  p2,
  pairName,
  sign1,
  chunk,
  allEntries,
  content,
) {
  if (!content) {
    return {result: {saved: [], review: []}, remaining: chunk};
  }

  const parsed = parseJSON(content);
  if (!parsed) {
    return {result: {saved: [], review: []}, remaining: chunk};
  }

  const before = chunk.filter(({s1, s2}) => !entryDone(allEntries, s1, s2));
  const result = processChunkResponse(
    p1,
    p2,
    pairName,
    chunk,
    allEntries,
    parsed,
  );
  const remaining = chunk.filter(({s1, s2}) => !entryDone(allEntries, s1, s2));

  if (result.saved.length) {
    console.log(
      `  ♻️ salvaged ${result.saved.length}/${before.length} from truncated response`,
    );
  }

  return {result, remaining};
}

async function generatePair(p1, p2, force) {
  const p1Info = PLANETS[p1];
  const p2Info = PLANETS[p2];
  if (!p1Info || !p2Info) {
    console.error("❌ Неизвестная планета:", p1, p2);
    process.exit(1);
  }

  const pairName = `${p1}_${p2}`;
  const lockPath = pairPath(pairName) + ".lock";

  if (fs.existsSync(lockPath)) {
    console.error(`❌ Файл занят другим процессом: ${lockPath}`);
    process.exit(1);
  }

  fs.writeFileSync(lockPath, String(process.pid), "utf-8");

  try {
    console.log(`\n🔥 Stellara Forge v6 — ${p1Info.name} × ${p2Info.name}`);
    console.log(`   Файл: ${pairName}.json`);
    console.log(`   Force: ${force ? "да" : "нет"}\n`);

    let allEntries = {};
    if (!force && fs.existsSync(pairPath(pairName))) {
      allEntries = normalizeLoaded(
        JSON.parse(fs.readFileSync(pairPath(pairName), "utf-8")),
      );
      console.log(
        `📂 Resume: ${Object.keys(allEntries).length} / ${TOTAL_COMBOS} ключей\n`,
      );
    } else if (force && fs.existsSync(pairPath(pairName))) {
      console.log("🗑️  --force: перезапись файла с нуля\n");
      allEntries = {};
    }

    const status = loadStatus();
    status.pairs[pairName] = {
      ...(status.pairs[pairName] || {}),
      status: "in_progress",
      started_at: new Date().toISOString(),
    };
    saveStatus(status);

    let generated = 0;

    for (const sign1 of SIGNS) {
      const pending = [];
      for (const sign2 of SIGNS) {
        if (!entryDone(allEntries, sign1, sign2)) {
          pending.push({s1: sign1, s2: sign2});
        }
      }

      if (!pending.length) {
        console.log(`⏭️ ${SIGN_NAMES[sign1]} — готово (12/12)`);
        continue;
      }

      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const chunk = pending.slice(i, i + BATCH_SIZE);
        try {
          await generateChunk(p1, p2, pairName, sign1, chunk, allEntries);
          generated++;
          await sleep(RATE_LIMIT_MS);
        } catch (e) {
          console.error(`  💥 ${e.message}`);
          writePairFile(pairName, allEntries);
          status.pairs[pairName] = scanPairFile(
            pairName,
            status.pairs[pairName],
          );
          status.pairs[pairName].last_error = e.message;
          refreshStatusFromDisk(status);
          process.exit(1);
        }
      }
    }

    writePairFile(pairName, allEntries);
    const scan = scanPairFile(pairName, status.pairs[pairName]);
    status.pairs[pairName] = {
      ...scan,
      forge_version:
        scan.keys === TOTAL_COMBOS &&
        !scan.errors.some((e) => e.includes("wrong"))
          ? 6
          : null,
      completed_at: new Date().toISOString(),
    };
    refreshStatusFromDisk(status);

    console.log("════════════════════════════════");
    console.log(`Ключей: ${scan.keys} / ${TOTAL_COMBOS}`);
    console.log(`Батчей за сессию: ${generated}`);
    console.log(`needs_review: ${scan.needs_review}`);
    console.log(`Статус: ${scan.status}`);
    console.log("════════════════════════════════\n");
  } finally {
    if (fs.existsSync(lockPath)) fs.unlinkSync(lockPath);
  }
}

// ── Main ──────────────────────────────────────────

async function main() {
  ensureDirs();
  const opts = parseArgs(process.argv);

  if (opts.command === "status") {
    const status = refreshStatusFromDisk(loadStatus());
    printStatus(status);
    return;
  }

  if (!API_KEY) {
    console.error("❌ ROUTERAI_API_KEY не задан.");
    process.exit(1);
  }

  await generatePair(opts.p1, opts.p2, opts.force);
}

main().catch((e) => {
  console.error("💥", e.message);
  process.exit(1);
});
