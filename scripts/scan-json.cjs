// scripts/scan-json.js
const fs = require('fs').promises;
const path = require('path');
const franc = require('franc');

const JSON_DIR = process.argv[2] || path.join(process.cwd(), 'data/generated/sign_pair_combos'); // можно передать путь первым аргументом
const FIELDS_TO_CHECK = ['short', 'full', 'strengths']; // расширьте при необходимости
const BACKUP_EXT = '.bak';

function hasCyrillic(s) {
  return /[А-Яа-яЁё]/.test(s);
}

function detectLangByText(text) {
  if (!text || typeof text !== 'string') return 'unknown';
  if (hasCyrillic(text)) return 'ru';

  const trimmed = text.trim();
  if (trimmed.length < 6) {
    // короткие строки: если только латиница/цифры/пробелы -> помечаем как en
    if (/^[A-Za-z0-9\s'"\-()]+$/.test(trimmed)) return 'en';
    return 'unknown';
  }

  // franc возвращает ISO 639-3 ('eng', 'rus' и т.д.)
  try {
    const code = franc(trimmed, { minLength: 3 });
    if (code === 'eng') return 'en';
    if (code === 'rus') return 'ru';
  } catch (e) {
    // проигнорируем ошибки детектора
  }
  return 'unknown';
}

async function processObj(obj) {
  if (!obj || typeof obj !== 'object') return;
  let foundEn = false;

  for (const field of FIELDS_TO_CHECK) {
    if (!(field in obj)) continue;
    const val = obj[field];
    if (!val) continue;

    if (typeof val === 'string') {
      const d = detectLangByText(val);
      if (d === 'en') {
        foundEn = true;
        break;
      }
    } else if (Array.isArray(val)) {
      const joined = val.filter(Boolean).join(' ');
      const d = detectLangByText(joined);
      if (d === 'en') {
        foundEn = true;
        break;
      }
      for (const item of val) {
        if (typeof item === 'string') {
          const di = detectLangByText(item);
          if (di === 'en') {
            foundEn = true;
            break;
          }
        }
      }
      if (foundEn) break;
    }
  }

  if (foundEn) {
    obj.lang = 'en';
  }

  // рекурсивно пройти вложенные структуры
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (Array.isArray(v)) {
      for (const el of v) {
        if (el && typeof el === 'object') await processObj(el);
      }
    } else if (v && typeof v === 'object') {
      await processObj(v);
    }
  }
}

async function walkAndProcess(node) {
  if (Array.isArray(node)) {
    for (const item of node) {
      if (item && typeof item === 'object') await processObj(item);
    }
  } else if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      await walkAndProcess(node[k]);
    }
  }
}

async function processFile(filePath) {
  console.log('Processing', filePath);
  const raw = await fs.readFile(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON:', filePath, e.message);
    return { file: filePath, ok: false, reason: 'invalid_json' };
  }

  const bak = filePath + BACKUP_EXT;
  try {
    await fs.access(bak);
  } catch (_) {
    // bak не существует — создаём
    await fs.writeFile(bak, JSON.stringify(data, null, 2), 'utf-8');
  }

  await walkAndProcess(data);

  const tmp = filePath + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
  await fs.rename(tmp, filePath);
  return { file: filePath, ok: true };
}

async function main() {
  try {
    const entries = await fs.readdir(JSON_DIR, { withFileTypes: true });
    const jsonFiles = entries
      .filter((e) => e.isFile() && e.name.endsWith('.json'))
      .map((e) => path.join(JSON_DIR, e.name));

    if (!jsonFiles.length) {
      console.log('No JSON files found in', JSON_DIR);
      return;
    }

    const results = [];
    for (const f of jsonFiles) {
      try {
        const r = await processFile(f);
        results.push(r);
      } catch (err) {
        console.error('Error processing', f, err);
        results.push({ file: f, ok: false, reason: String(err) });
      }
    }

    console.log('Done. Summary:');
    results.forEach((r) => console.log(r.file, '->', r.ok ? 'OK' : 'FAIL', r.reason || ''));
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

main();
