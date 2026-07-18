# Статус: Personality Test (Stellara)

> **Для агента:** в начале сессии прочитай этот файл при работе с `/personality-test` и `/personality-result`.
>
> **Для человека:** текущее состояние миграции с натальной карты на астрологический тест личности.

**Обновлено:** 2026-07-18

---

## Текущий этап

| Поле | Значение |
|------|----------|
| **Этап** | Quiz Glyph Cards |
| **Статус** | `done` — QA PASS, PM Accepted |
| **Блокер** | — |
| **Следующий** | API paywall / оплата; аналитика GA4/PostHog |

---

## Flow

1. Главная → модалка (дата рождения + freemium-плашка + 12 вопросов)
2. `POST /api/personality-test` → sessionStorage → `/personality-result?archetypeId=...`
3. Freemium A5: портрет + стихии + совет (full); **3 дара** (gift-only) + practices lock; love/career/self — **Layered Preview** (саммари + fade + divider + мини-CTA); PaywallBanner с 4 информативными карточками; growth/conflicts/friendship/decisions — только после unlock; `#share` внизу

**Тестовый URL с результатом:** пройти квиз или открыть `/personality-result?archetypeId=leo-1` (без session — портрет + CTA вместо пустых стихий).

**Redirect:** `/natalchart` → `/personality-test`

---

## Сделано

### Quiz Glyph Cards (2026-07-18)
- [x] `ElementGlyph.vue` — SVG глифы fire/earth/air/water в круге 36×36
- [x] `OPTION_ELEMENTS` (A–D → стихии); эмодзи `OPTION_ICONS` удалены
- [x] `QuizOption` — answer-card states, метка стихии, ARIA radio
- [x] `PersonalityQuiz` — radiogroup, GSAP stagger/glow/exit, keyboard, reduced-motion
- [x] Токены карточек/глифов в `variables.css`
- [x] `nuxi build` OK
- [x] QA 375px + 1024px — PASS (1 fix loop: GSAP clearProps)
- [x] PM sign-off — Accepted

### A5 Layered Preview (2026-07-16)
- [x] Freemium-плашка на экране даты (`QuizBirthDate`)
- [x] `StrengthCard variant="gift"` — 3 дара полностью (без manifestation/howToAmplify)
- [x] `PracticesPaywallHint` → scroll to `#paywall`
- [x] `ResultLayeredPreview` для Любовь / Карьера / Саморазвитие
- [x] `PaywallBanner` — 4 информативные карточки + reassurance (без blur stubs)
- [x] `nuxi build` OK
- [x] QA 375px + 1024px — PASS
- [x] PM sign-off — Accepted

### Result redesign V1 (2026-07-15)
- [x] Freemium: 4 preview-блока + Nebula PaywallBanner + blurred stubs
- [x] `ResultPreviewCard`, `CosmicAdvice`, `ResultSectionIcon`
- [x] `ResultSection` — icon circle + title + subtitle
- [x] NavChips: 9 locked (+ paid purple dot) / expanded unlocked
- [x] ArchetypeHero glow + title shimmer; ElementsChart stagger + DS gradients
- [x] Share: square 320×320 constellation PNG + `#share` section
- [x] `$softPurple` в variables.css
- [x] `nuxi build` OK
- [x] QA 375px + 1024px — PASS WITH NOTES
- [x] PM sign-off — Accepted with notes

### Sprint 06 (2026-07-08)
- [x] 12 JSON архетипов расширены до 27 полей (22 content + 5 meta)
- [x] `types/personality.ts` — полная схема платного контента
- [x] `extractArchetypeContent` — spread всех content-полей
- [x] `constants/archetypeMeta.ts` — метаданные для CompatibilityCards
- [x] UI: `ResultCallout`, `StrengthCard`, `GrowthCard`, `CompatibilityCards`, `RolesGrid`, `ResultSubheading`
- [x] 8 платных секций на result page (strengths → decisions)
- [x] `watch(archetypeId)` — сброс paywall при переходе по compatibility
- [x] NavChips + `useResultReveal`
- [x] QA 375px + 1024px — PASS WITH NOTES (P2 scroll-spy at page top)
- [x] PM sign-off — Accepted with notes
- [x] `nuxi build` — OK

### Post-migration fixes
- [x] Мёртвый store/JS, yaApi, SelectInput fallback, hero/elements/progress/validation/polish
- [x] QA пройден вручную (375px + 1024px)

### Housekeeping (2026-07-04)
- [x] SEO главной (`pages/index.vue`) — personality test, не натальная карта
- [x] Copy hero (`components/common/Hero.vue`)
- [x] `agent-orchestration.mdc` → `PERSONALITY_TEST_STATUS.md` + новые test URL
- [x] `/personality-test` — redirect на `/` при закрытии модалки
- [x] Год рождения: client + server синхронизированы (1900–текущий год)
- [x] `ElementsChart` — подпись про шкалу /14
- [x] Legacy natal pipeline удалён (`data/forge*`, `scripts/chunks`, gen_* scripts)
- [x] Сохранены: `scripts/scan-json.cjs`, `scripts/generate-archetypes.cjs`
- [x] Контент архетипов из `data/generated/personality-test/*.json` — API + SSR result page

---

## Вне scope (осознанно)

- Вычитка 12 JSON редактором-астрологом
- Split free/paid в API
- Интеграция ЮKassa / оплаты
- Playfair Display (остаёмся на Alegreya Sans SC)
- Telegram / PDF / radar из стороннего скрина
- E2E-тесты
- Fix `npm run build` tarot assets (отдельный блокер)

---

## Архив natalchart

История NC-01…NC-13: [`docs/_archive/NATALCHART_STATUS.md`](./_archive/NATALCHART_STATUS.md)

---

## Журнал

| Дата | Событие |
|------|----------|
| 2026-07-18 | Quiz Glyph Cards polish: nav lock/mobile parity, glow clip, radio div, GSAP onInterrupt, tokens — build OK |
| 2026-07-18 | Quiz Glyph Cards: ElementGlyph + QuizOption refactor + GSAP/a11y — build OK, QA PASS, PM Accepted |
| 2026-07-16 | A5 Layered Preview: gifts + practices hint, layered preview, paywall cards, birth notice — build OK, QA PASS, PM Accepted |
| 2026-07-15 | Result redesign V1: freemium previews, Nebula paywall, section icons, share square — build OK, QA PASS WITH NOTES, PM Accepted |
| 2026-07-04 | Post-migration fixes |
| 2026-07-04 | Housekeeping: SEO, orchestration, legacy cleanup, QA fixes |
| 2026-07-07 | Подключены JSON архетипов: serverAssets, jsonLoader, SSR `/personality-result` |
| 2026-07-08 | Sprint 06: expanded paid content UI, 27-field JSON, QA PASS WITH NOTES, PM sign-off |
