# Stellara — Перегенерация sign_pair_combos (Forge v6)

## Цель
- **56 пар** × **144 комбо** = 8160 текстов
- Стиль: **v6** — живой человек, без астрологии в тексте
- 1 запись на комбо, id **1–144** последовательно в каждом файле
- Top-level ключи: `aries_aries`, `aries_taurus`, … (как в `jsonLoader.js`)

## Файлы пайплайна

| Файл | Назначение |
|------|------------|
| `data/forge_v6.cjs` | Скрипт генерации |
| `data/forge_prompt_v6.md` | Промпт (стиль + JSON) |
| `data/forge_status.json` | **Прогресс**: что готово, что осталось, ошибки |
| `data/needs_review.csv` | Записи с `needs_review: true` |
| `data/generated/raw/` | Сырые ответы API при ошибках парсинга |

---

## Быстрый старт (PowerShell)

```powershell
# 1. Перейти в папку data
Set-Location "C:\Users\user\.openclaw-autoclaw\agents\stellara-ux\workspace\stellar\data"

# 2. Задать API-ключ (один раз за сессию)
$env:ROUTERAI_API_KEY = "sk-ВАШ_КЛЮЧ"

# 3. Посмотреть статус — что сделано, что осталось
node forge_v6.cjs status

# 4. Запустить одну пару (resume — продолжит с места остановки)
node forge_v6.cjs sun moon

# 5. Перегенерировать пару с нуля
node forge_v6.cjs sun moon --force
```

---

## Порядок запуска (3 терминала параллельно)

Каждый терминал — **своя пара**. Не запускай одну пару дважды.

### Терминал 1 — первые 19 пар
```powershell
Set-Location "...\stellar\data"
$env:ROUTERAI_API_KEY = "sk-..."
$pairs = @(
  "sun_moon",
  "asc_jupiter","asc_mars","asc_mercury","asc_moon","asc_neptune","asc_pluto","asc_saturn","asc_sun","asc_uranus","asc_venus",
  "jupiter_mars","jupiter_mercury","jupiter_neptune","jupiter_pluto","jupiter_saturn","jupiter_uranus","jupiter_venus"
)
foreach ($p in $pairs) { $a = $p.Split("_"); node forge_v6.cjs $a[0] $a[1] --force; if ($LASTEXITCODE -ne 0) { break } }
```

### Терминал 2 — пары 20–37
```powershell
$pairs = @(
  "mars_mercury","mars_neptune","mars_pluto","mars_saturn","mars_uranus","mars_venus",
  "mercury_neptune","mercury_pluto","mercury_saturn","mercury_uranus","mercury_venus",
  "moon_mercury","moon_neptune","moon_pluto","moon_saturn","moon_uranus","moon_venus",
  "neptune_pluto"
)
foreach ($p in $pairs) { $a = $p.Split("_"); node forge_v6.cjs $a[0] $a[1] --force; if ($LASTEXITCODE -ne 0) { break } }
```

### Терминал 3 — пары 38–56
```powershell
$pairs = @(
  "neptune_saturn","neptune_uranus","neptune_sun","neptune_venus",
  "pluto_saturn","pluto_uranus","pluto_sun","pluto_venus",
  "saturn_uranus","saturn_venus","saturn_sun",
  "sun_uranus","sun_venus","uranus_venus",
  "jupiter_moon","jupiter_sun","mars_moon","mars_sun","mercury_moon","mercury_sun","moon_sun"
)
foreach ($p in $pairs) { $a = $p.Split("_"); node forge_v6.cjs $a[0] $a[1] --force; if ($LASTEXITCODE -ne 0) { break } }
```

---

## Ручной запуск (по одной паре)

Планеты **в любом порядке** — скрипт сам сортирует алфавитно (`mars jupiter` → `jupiter_mars.json`).

```powershell
node forge_v6.cjs sun moon --force
node forge_v6.cjs asc jupiter --force
node forge_v6.cjs mercury venus --force
# ... и т.д.
```

После каждой пары или в любой момент:
```powershell
node forge_v6.cjs status
```

---

## Чтение forge_status.json

```json
{
  "summary": {
    "total": 56,
    "done": 10,
    "done_with_review": 5,
    "partial": 2,
    "pending": 38,
    "failed": 1
  },
  "pairs": {
    "sun_moon": {
      "status": "partial",
      "keys": 48,
      "needs_review": 3,
      "errors": []
    }
  },
  "needs_review": [ ... ]
}
```

**Статусы пар:**
| Статус | Значение |
|--------|----------|
| `pending` | Файла нет или 0 ключей |
| `partial` | Есть ключи, но < 144 |
| `in_progress` | Сейчас генерируется |
| `done` | 144/144, без review |
| `done_with_review` | 144/144, есть needs_review |
| `needs_regen` | 144 ключей, но формат signpair.* — нужен `--force` |

---

## Resume после падения

Просто перезапусти **без** `--force`:
```powershell
node forge_v6.cjs sun moon
```
Скрипт пропустит готовые комбо и продолжит с недостающих.

---

## Проверка одного файла

```powershell
node -e "const j=JSON.parse(require('fs').readFileSync('generated/sign_pair_combos/sun_moon.json','utf-8')); const k=Object.keys(j); console.log(k.length,'keys'); const bad=k.filter(x=>!j[x]||j[x].length!==1); console.log('Bad:',bad.length?bad:'none'); const rev=k.filter(x=>j[x][0].needs_review); console.log('Review:',rev.length);"
```

---

## Параметры API (v6)

| Параметр | Значение |
|----------|----------|
| model | `deepseek/deepseek-v4-flash` |
| temperature | 0.65 |
| max_tokens | **4600** для батча 4 (динамически: N×1000+600, max 8192) |
| truncation | auto-split батча пополам + salvage частичного JSON |
| response_format | `json_schema` + `structured_outputs: true` |
| fallback | `json_object` если schema не поддержана |
| retries | 3 |

---

## needs_review

Запись сохраняется, но помечается `needs_review: true` если:
- short не 12–25 слов
- full не 50–80 слов
- найдено banned-слово

Список → `data/needs_review.csv`

---

## Правила именования

- Файлы: **алфавитный** порядок планет → `jupiter_mars.json`
- Ключи внутри: `aries_aries`, `aries_taurus`, …
- Поле `key` в объекте: `signpair.jupiter_mars.aries_taurus`

---

## Оценка времени

- ~36 API-вызовов на пару (144 / 4)
- ~2–3 мин/пара без ретраев
- 56 пар / 3 параллельно ≈ **40–60 мин**
