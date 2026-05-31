# Статус: `/natalchart` (Stellara)

> **Для агента:** в начале сессии прочитай этот файл. При завершении TASK обнови секции «Текущий этап», «Сделано», «Очередь» и «Журнал».
>
> **Для человека:** открой этот файл — видно, где мы и что сказать в чате.

**Обновлено:** 2026-05-31

---

## Быстрые команды (любой чат)

| Цель | Напиши в чат |
|------|----------------|
| Только план/аудит | `/pm-ux-designer проанализируй /natalchart` или «обнови план» |
| **Реализация этапа** (Dev→Test→PM sign-off) | `Реализуй этап NC-01` — агент **сам** запускает Tester + PM review |
| То же + PM-спека с нуля | `Полный цикл: NC-01` |
| Только код (без QA) | `Реализуй этап NC-01 только код` / `без QA` |
| Только QA | `Проверь этап NC-01` / `/stellara-tester` |

Правило оркестрации: `.cursor/rules/agent-orchestration.mdc`

---

## Текущий этап

| Поле | Значение |
|------|----------|
| **Этап** | — (очередь NC завершена) |
| **Статус** | `done` |
| **Блокер** | — |
| **Следующий после NC-03** | `NC-04` Hero Big Three |

---

## Сделано

- [x] UX-аудит `/natalchart` (mobile 375px, PM + браузер)
- [x] План P0–P2 + TASK specs (см. [Аудит 2026-05-31](#аудит-2026-05-31))
- [x] Компоненты: `NavChips.vue`, `useSectionNav.js`, `StickySectionNav.vue` (код есть)
- [x] Правило оркестрации агентов PM → Dev → Test → PM review
- [x] NC-01 — section nav подключён (`useSectionNav`, ids portrait/insights, offset 134px)
- [x] NC-02 — ChartSkeleton + NatalLoader, NavChips только после data, refetch pending ok
- [x] NC-03 — ChartWheel SVG (zodiac, houses, planets, aspects, tap→planets)
- [x] NC-04 — ChartBigThree hero (☉☽↑, scroll-snap mobile, meta→wheel→big three)
- [x] NC-05 — дедупликация: Дева в portrait, Top Insights только аспекты
- [x] NC-06 — tone progress bar (harmonious/tense dual-segment)
- [x] NC-07 — Planets mobile carousel (scroll-snap, desktop 4-col grid)
- [x] NC-08 — Aspects accordion + category colors (wheel/tone palette)
- [x] NC-09 — Atmospheric hero (HoroCircle + ChartAtmosphericHero)
- [x] NC-10 — Share URL (copy + Web Share, ChartShareButton)
- [x] NC-11 — Filter chips вместо select (FilterChips, contain scroll fix)

---

## Очередь этапов (один TASK = один прогон pipeline)

Статусы: `todo` | `in_progress` | `qa` | `done` | `blocked`

| ID | Приоритет | Название | Статус | Заметки |
|----|-----------|----------|--------|---------|
| **NC-01** | P0 | Подключить section nav | `done` | useSectionNav + ids + offset |
| NC-02 | P0 | Loading skeleton + NatalLoader | `done` | ChartSkeleton, pending>data |
| NC-03 | P0 | SVG-колесо натальной карты | `done` | ChartWheel.vue |
| NC-04 | P0 | Hero Big Three (swipe + символы) | `done` | ChartBigThree.vue |
| NC-05 | P1 | Дедупликация Обзор / Инсайты | `done` | SIGN_LABELS_RU, aspect-only insights |
| NC-06 | P1 | Harmony tone progress bar | `done` | dual-segment bar in portrait |
| NC-07 | P1 | Planets mobile carousel | `done` | scroll-snap mobile, 4-col desktop |
| NC-08 | P1 | Aspects accordion + цвета | `done` | accordion by category, aligned colors |
| NC-09 | P1 | Atmospheric hero (HoroCircle) | `done` | ChartAtmosphericHero wrapper |
| NC-10 | P2 | Share URL | `done` | useChartShareUrl + ChartShareButton |
| NC-11 | P2 | Filter chips вместо select | `done` | FilterChips.vue, mobile scroll fix |

**Рекомендуемый порядок:** NC-01 → NC-02 → NC-03 → NC-04 → NC-05 …

---

## Спеки этапов (кратко)

### NC-01 — Подключить section nav

**Проблема:** клик «Инсайты»/«Обзор» не скроллит; `#portrait` и `#insights` нет в DOM; scroll без offset 134px.

**Решение:**
- `useSectionNav` в `natalchart.vue`, chips: `:active-section` + `@navigate`
- `id="portrait"` на `ChartOverviewPortrait`, `id="insights"` на `TopInsightsSection`
- Evidence handlers → `scrollToSection` из composable

**Файлы:** `pages/natalchart.vue`, при необходимости секции

**Приёмка:**
- [x] Tap «Инсайты» на 375px — секция не под nav
- [x] То же на 1024px desktop
- [x] Scroll-spy подсвечивает chip (mobile + desktop)
- [x] Evidence → planets/aspects с offset
- [x] `nuxi build` ok

---

### NC-02 — Loading skeleton

**Проблема:** «Загрузка…» + активные chips до data.

**Решение:** skeleton hero; NavChips после `data` или disabled.

**Файлы:** `pages/natalchart.vue`, `components/ChartSkeleton.vue`

**Приёмка:**
- [x] Pending: ChartSkeleton + NatalLoader, без NavChips и без stale секций (refetch)
- [x] После load: NavChips + секции, NC-01 nav @ 375 + 1024
- [x] `nuxi build` ok (vite client+server)

---

### NC-03 — SVG-колесо

**Проблема:** нет визуальной карты.

**Решение:** `ChartWheel.vue` — планеты по `longitude`, дома, аспекты; tap → scroll/modal.

**Данные API:** есть (`planets`, `houses`, `aspects`, `ascendant`).

**Ассеты:** временные иконки/картинки с интернета допустимы (заменит владелец).

**Приёмка:**
- [x] Wheel visible 375px + 1024px after data load
- [x] 12 house cusps, color-coded aspects, planet positions
- [x] Tap planet → scroll to #planets (134px offset)
- [x] Hidden during loading / empty state; skeleton wheel placeholder
- [x] `nuxi build` ok

---

### NC-04 — Hero Big Three

**Проблема:** 3 вертикальные карточки, не hero.

**Решение:** horizontal scroll-snap; ☉☽↑; порядок: meta → wheel → big three.

**Файлы:** `ChartHeader.vue`, `ChartBigThree.vue`, layout в page.

**Приёмка:**
- [x] Layout meta → wheel → big three (375 + 1024)
- [x] ☉☽↑ symbols, RU sign names, mobile snap / desktop 3-up
- [x] ChartHeader meta-only; skeleton order matches
- [x] `nuxi build` ok

---

### NC-05 — Дедупликация

**Проблема:** Sun/Moon/Asc ×3; «Асцендент Virgo» в Обзоре.

**Решение:** один блок асцендента; `SIGN_LABELS_RU` в portrait; урезать core insights в hero.

**Файлы:** `ChartOverviewPortrait.vue`, `TopInsightsSection.vue`

**Приёмка:**
- [x] Portrait «Асцендент Дева» (RU nominative)
- [x] Top Insights без core (Солнце/Луна/Асцендент), только аспекты (6 cards)
- [x] Hero Big Three без регрессий
- [x] `nuxi build` ok

---

*(NC-06 … NC-11 — детали в PM-аудите; дополнять при старте этапа.)*

### NC-06 — Harmony tone progress bar

**Проблема:** «Тон карты» — только числа, без bar.

**Решение:** dual-segment bar (green harmonious / red tense) + % labels в `ChartOverviewPortrait`.

**Приёмка:**
- [x] Bar visible 375 + 1024, proportions match counts
- [x] Label + numeric hint retained, ARIA progressbar
- [x] `nuxi build` ok

---

### NC-07 — Planets mobile carousel

**Проблема:** на 375px планеты — 2-col grid + `<select>`; карточки тесные, нет swipe UX.

**Решение:** mobile horizontal scroll-snap carousel (как `ChartBigThree`); desktop — grid без изменений; фильтры/select оставить (chips → NC-11).

**Файлы:** `components/PlanetsSection.vue`

**Приёмка:**
- [x] Mobile 375px: horizontal carousel, ~85% card width, scroll-snap center, peek next card
- [x] Desktop 1024px: multi-column grid (3–4 cols), no broken layout
- [x] Sort + life-area filter reorder carousel/grid
- [x] Tap card → modal unchanged
- [x] Styles: plain `<style scoped>`, `@import variables`, `@mixin tablet/desktop` (no raw `@media`, no `lang="scss"`)
- [x] `nuxi build` ok

---

### NC-08 — Aspects accordion + цвета

**Проблема:** аспекты — длинный flat grid; цвета badge не совпадают с wheel/tone bar.

**Решение:** accordion по категориям (Гармоничные / Напряжённые / Соединения / Другие); цвета как `ChartWheel` + `portrait` tone bar; weight bar fill по категории; первый непустой group open по умолчанию.

**Файлы:** `components/AspectsSection.vue`

**Приёмка:**
- [x] Accordion groups by category with count in header, expand/collapse
- [x] Colors: harmonious `rgba(100,180,130)`, tense `rgba(210,95,95)`, conjunction `$softOrange`
- [x] Card left border or weight fill uses category color
- [x] Filters (category, strong, planet) work within accordion
- [x] Mobile 375 + desktop 1024, ARIA on accordion headers
- [x] Styles: plain scoped, variables import, mixins (no raw `@media`, no `lang="scss"`)
- [x] `nuxi build` ok

---

### NC-09 — Atmospheric hero (HoroCircle)

**Проблема:** hero `/natalchart` (meta + wheel + big three) без атмосферы; `HoroCircle.vue` есть, но не подключён и CSS сломан.

**Решение:** wrapper `ChartAtmosphericHero` с `HoroCircle` фоном (rotating circles + gradient); meta + wheel + big three поверх (`z-index`); skeleton с тем же фоном; fix HoroCircle CSS + SVG assets.

**Файлы:** `components/ui/HoroCircle.vue`, `components/ChartAtmosphericHero.vue` (new), `pages/natalchart.vue`, `components/ChartSkeleton.vue`, `assets/img/big-circle.svg`, `assets/img/small-circle.svg`

**Приёмка:**
- [x] HoroCircle visible behind hero @ 375 + 1024 (subtle, не перекрывает контент)
- [x] Layout meta → wheel → big three сохранён внутри hero
- [x] Loading skeleton показывает atmospheric bg
- [x] Circles animate (GSAP) unless prefers-reduced-motion
- [x] Content readable, pointer-events on interactive elements only
- [x] `nuxi build` ok

---

### NC-10 — Share URL

**Проблема:** нельзя скопировать/поделиться ссылкой на карту с query params.

**Решение:** кнопка «Поделиться» / «Скопировать ссылку» в hero (`ChartHeader`); composable собирает URL из route; clipboard + Web Share API (mobile); feedback «Ссылка скопирована».

**Файлы:** `composables/useChartShareUrl.js`, `components/ChartShareButton.vue`, `components/ChartHeader.vue`

**Приёмка:**
- [x] Кнопка visible когда карта загружена (has params + data), hidden empty state
- [x] Copy включает year/month/day/hour/minute/lat/lon/timezone + city если есть
- [x] Paste URL в новой вкладке → та же карта
- [x] Web Share на mobile если `navigator.share` (fallback copy)
- [x] Feedback после copy @ 375 + 1024
- [x] `nuxi build` ok

---

### NC-11 — Filter chips вместо select

**Проблема:** Planets + Aspects используют native `<select>` — плохой mobile UX.

**Решение:** reusable `FilterChips.vue` (стиль NavChips); заменить selects в `PlanetsSection` + `AspectsSection`; strong-only → toggle chip.

**Файлы:** `components/common/FilterChips.vue`, `PlanetsSection.vue`, `AspectsSection.vue`

**Приёмка:**
- [x] Planets: sort chips (важность/дома) + life-area chips (Все + сферы)
- [x] Aspects: category chips + planet chips (scroll) + toggle «Ключевые»
- [x] Filter logic unchanged; accordion/carousel ok
- [x] Active state matches NavChips; horizontal scroll on mobile
- [x] ARIA: role/group labels, aria-pressed on chips
- [x] 375 + 1024, `nuxi build` ok

---

## Окружение для проверки

```text
npm run dev
```

**URL теста:**

```text
http://192.168.1.74:3000/natalchart?year=1990&month=5&day=15&hour=14&minute=30&latitude=55.75&longitude=37.62&timezone=3&city=Москва
```

**Viewports (Tester):** 375×812 mobile (required), 1024×768 desktop (required).

**Section IDs:** `portrait`, `insights`, `planets`, `aspects`

---

## Аудит 2026-05-31

**Исходные находки (до NC-01…NC-11) — все закрыты в коде и UI.**

| # | Было | Статус |
|---|------|--------|
| 1 | NavChips не подключены | ✅ `useSectionNav` |
| 2 | Нет SVG wheel | ✅ `ChartWheel` |
| 3 | Big Three stacked + дубли | ✅ `ChartBigThree` + dedup |
| 4 | Ascendant EN в portrait | ✅ RU `SIGN_LABELS_RU` |
| 5 | Тон без bar | ✅ dual-segment bar |
| 6 | Grid + select | ✅ carousel + `FilterChips` |

**Post-review polish (2026-05-31):** nav chip lock на mobile, share copy, HoroCircle mobile, h1 dedup, planet tag filter.

---

## Журнал

| Дата | Событие |
|------|---------|
| 2026-05-31 | PM-аудит `/natalchart`, план P0–P2, оркестрация агентов |
| 2026-05-31 | Создан `docs/NATALCHART_STATUS.md` |

| 2026-05-31 | NC-01 done — useSectionNav в natalchart.vue, build ok |
| 2026-05-31 | NC-02 done — ChartSkeleton, navEnabled=data&&!pending, QA PASS + PM sign-off |
| 2026-05-31 | NC-03 done — ChartWheel SVG, skeleton wheel placeholder, hydration fix, QA PASS + PM sign-off |
| 2026-05-31 | NC-04 done — ChartBigThree hero ☉☽↑, scroll-snap, QA PASS + PM sign-off |
| 2026-05-31 | NC-05 done — Дева в portrait, aspect-only insights, QA PASS + PM sign-off |
| 2026-05-31 | NC-06 done — tone dual-segment bar, QA PASS + PM sign-off |
| 2026-05-31 | NC-07 done — planets mobile carousel, QA PASS + PM sign-off |
| 2026-05-31 | NC-08 done — aspects accordion + colors, QA PASS + PM sign-off |
| 2026-05-31 | NC-09 done — atmospheric HoroCircle hero, QA PASS WITH NOTES + PM sign-off |
| 2026-05-31 | NC-10 done — share URL button, QA PASS WITH NOTES + PM sign-off |
| 2026-05-31 | NC-11 done — filter chips, scroll fix, QA PASS + PM sign-off |
| 2026-05-31 | Post-review polish — nav chip mobile fix, share copy, HoroCircle mobile, h1/meta, planet tags |

---

## Как обновлять этот файл

**После каждого закрытого этапа** агент (или ты) меняет:

1. **Текущий этап** → следующий `NC-xx` со статусом `todo`
2. **Очередь** → статус `done` + дата в журнале
3. **Сделано** → галочка
4. При смене scope — кратко в **Журнал**

Не дублировать сюда весь код — только ID этапа, статус, 1–2 строки итога.
