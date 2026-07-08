# Статус: Personality Test (Stellara)

> **Для агента:** в начале сессии прочитай этот файл при работе с `/personality-test` и `/personality-result`.
>
> **Для человека:** текущее состояние миграции с натальной карты на астрологический тест личности.

**Обновлено:** 2026-07-08

---

## Текущий этап

| Поле | Значение |
|------|----------|
| **Этап** | Sprint 06 — расширение платного контента |
| **Статус** | `done` |
| **Блокер** | — |
| **Следующий** | P2 scroll-spy fix (опционально), вычитка контента астрологом, API paywall split, оплата |

---

## Flow

1. Главная → модалка (дата рождения + 12 вопросов)
2. `POST /api/personality-test` → sessionStorage → `/personality-result?archetypeId=...`
3. Freemium: портрет, стихии, совет — бесплатно; 8 платных блоков скрыты через `v-if hasFullAccess` + PaywallBanner (клик = dev-разблокировка)

**Тестовый URL с результатом:** пройти квиз или открыть `/personality-result?archetypeId=leo-1` (без session — портрет + CTA вместо пустых стихий).

**Redirect:** `/natalchart` → `/personality-test`

---

## Сделано

### Sprint 06 (2026-07-08)
- [x] 12 JSON архетипов расширены до 27 полей (22 content + 5 meta)
- [x] `types/personality.ts` — полная схема платного контента
- [x] `extractArchetypeContent` — spread всех content-полей
- [x] `constants/archetypeMeta.ts` — метаданные для CompatibilityCards
- [x] UI: `ResultCallout`, `StrengthCard`, `GrowthCard`, `CompatibilityCards`, `RolesGrid`, `ResultSubheading`
- [x] PaywallBanner — текст про 8 блоков
- [x] 8 платных секций на result page (strengths → decisions)
- [x] `watch(archetypeId)` — сброс paywall при переходе по compatibility
- [x] NavChips + `useResultReveal` — 3 новые секции
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
- [x] UX polish result: HoroCircle hero, gradient title, GSAP reveal, share deep link, NavChips paid
- Удаление неиспользуемых `.vue` (`ModalResults`, `SelectInput`, …)
- E2E-тесты
- Fix `npm run build` tarot assets (отдельный блокер)

---

## Архив natalchart

История NC-01…NC-13: [`docs/_archive/NATALCHART_STATUS.md`](./_archive/NATALCHART_STATUS.md)

---

## Журнал

| Дата | Событие |
|------|---------|
| 2026-07-04 | Post-migration fixes |
| 2026-07-04 | Housekeeping: SEO, orchestration, legacy cleanup, QA fixes |
| 2026-07-07 | Подключены JSON архетипов: serverAssets, jsonLoader, SSR `/personality-result` |
| 2026-07-08 | Sprint 06: expanded paid content UI, 27-field JSON, QA PASS WITH NOTES, PM sign-off |
