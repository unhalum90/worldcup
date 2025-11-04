# 🗺️ World Cup 26 Fan Zone – Full Localization Implementation Plan

_Last updated: 2025-11-05_

---

## 1. Current Framework

| Area | Implementation |
|------|----------------|
| Framework | Next.js 15 (App Router) + [`next-intl`](https://next-intl-docs.vercel.app/) |
| Active Locales | `en`, `es`, `pt`, `fr`, `ar` (German exists but inactive) |
| Locale Handling | `NEXT_LOCALE` cookie via `middleware.ts` |
| Translation Files | `web/messages/{locale}.json` |
| Current Coverage | Header and limited landing content; most planners, modals, and markdown guides are English-only |
| Content Sources | Markdown (`/web/app/**`), SQL data, and AI planner outputs (English) |

---

## 2. Global Goals

1. **100% translation coverage** across UI, modals, forms, toasts, and emails.  
2. **Locale-aware data flow** for planners and AI responses.  
3. **Per-locale markdown mirrors** for content guides.  
4. **RTL support** for Arabic.  
5. **Automated QA & lint guards** for missing keys or markdown coverage.

---

## 3. Global Workstreams

### 3.1 Translation Infrastructure
- Clean `messages/en.json`; remove legacy keys.  
- Introduce **namespaces** per module:  
  `landing.*`, `planner.hub.*`, `planner.tripBuilder.*`, `auth.*`, `account.*`, `admin.*`.  
- Define naming convention: `section.component.element`  
  _(e.g., `planner.tripBuilder.form.submit`)_  

---

### 3.2 Formatter & Helper Module

Create `/web/lib/i18nFormatters.ts` exporting localized formatter utilities:

```ts
import { useFormatter } from 'next-intl';

export function useI18nFormatters() {
  const f = useFormatter();
  return {
    date: (d: Date) => f.dateTime(d, { dateStyle: 'medium' }),
    number: (n: number) => f.number(n),
    currency: (n: number, currency='USD') =>
      f.number(n, { style: 'currency', currency }),
  };
}
```

**Replace all manual operations:**

- `new Date(...).toLocaleString()`
- `Intl.NumberFormat('en')`
- Hard-coded `$` signs

→ Use the above helper functions instead.

**Priority fixes:**
- Countdown timers  
- Itinerary day labels  
- Lodging cost formatting  

---

### 3.3 Shared UI Localization

Wrap every UI element (buttons, modals, cookie consent, loaders, tooltips) with `useTranslations()`.  
Ensure all `aria` labels, tooltips, and `alt` text pull from localized strings.

---

### 3.4 RTL & Layout

Arabic (`ar`) requires:  
- `[dir="rtl"]` styling  
- `flex-row-reverse` alignment  
- Icon mirroring  
- `<html dir={isRTL(locale) ? 'rtl' : 'ltr'}>` in `layout.tsx`

---

### 3.5 Translation Workflow

- Master `en.json` exported to translators.  
- Localized JSONs re-ingested via `update-translations.sh`.  
- Add CI parity check:  
  ```bash
  pnpm run lint:i18n
  ```
  → Ensures all locales have identical key structures.

---

## 4. Markdown Localization Strategy

### 4.1 Directory Structure

Each English markdown file should have per-locale mirrors:

```
web/app/guides/en/dallas_best.md
web/app/guides/fr/dallas_best.md
web/app/guides/es/dallas_best.md
```

### 4.2 Build-time Guard

Create `scripts/checkMarkdownLocales.ts`:

- Scans `web/app/guides/en/**`
- Verifies sibling locale files exist
- Logs warnings or fails CI if missing (excluding whitelisted exceptions)

### 4.3 Fallback Logic

If translation missing →  
load English fallback and flag with `[data-locale-fallback="en"]` for QA visibility.

---

## 5. AI Planner Localization

### 5.1 API & Prompt Updates

Update endpoints:
- `/api/travel-planner`
- `/api/flight-planner`
- `/api/lodging-planner`

Add locale to body or query string:
```json
{ "origin": "DFW", "matches": [...], "locale": "fr" }
```

### 5.2 Prompt Handling

- **Primary:** Request localized AI output directly (“Respond in French”).  
- **Fallback:**  
  1. Generate English itinerary  
  2. Re-translate via `"Translate to <locale>"`  
  3. Validate JSON before rendering  

### 5.3 Rendering

Surface all planner strings (e.g. “Day 1”, “Estimated cost”, validation errors) via `planner.tripBuilder.*` namespace.

---

## 6. Page / Feature Rollout Order

| Phase | Area | Key Tasks |
|-------|------|-----------|
| 1 | Foundation | Formatter helpers, cleaned JSON, shared UI |
| 2 | Homepage | Hero, countdown, CTA buttons, FeatureShowcase |
| 3 | Planners | Trip/Flight/Lodging, locale-aware API, AI prompt changes |
| 4 | Onboarding + Auth | Localize all steps, modals, and validation errors |
| 5 | Account/Admin | Translate tables, forms, and notifications |
| 6 | Guides/Teams/Groups | Localized markdown mirrors + UI |
| 7 | QA | Lint guards, RTL validation, Playwright tests |

---

## 7. Automation & QA

- Lint guard → verifies translation key parity + markdown mirrors.  
- Unit test helpers → ensure correct output from `useI18nFormatters()`.  
- Playwright tests → load `/` and `/planner` in each locale; verify no hydration warnings and correct directionality.  
- CI fails if coverage <95%.

---

## 8. Translator Handoff

- Export updated `messages/en.json` weekly.  
- Translate to JSON or CSV.  
- Import to `web/messages/{locale}.json`, run lint, commit.

---

## 9. Post-Launch Maintenance

- All new components must include translation keys pre-merge.  
- Add `pr-check-i18n` GitHub Action to flag unlocalized strings.  
- Build `/admin/localization` dashboard to track missing key count per locale.

---

## 10. Deliverables Summary

| File / Script | Purpose |
|----------------|----------|
| `web/lib/i18nFormatters.ts` | Date/number/currency helpers |
| `scripts/checkMarkdownLocales.ts` | CI guard for markdown mirrors |
| `middleware.ts` | Locale cookie & RTL handling |
| Updated API routes | Accept `locale`, enable AI translation pipeline |
| Lint / CI rules | Validate translation parity |
| Playwright tests | Verify locale rendering |

---

## 11. Progress Log

- 2025-11-05 – Added shared formatter helpers and localized countdown timers across all active locales (`landing.countdown` namespace).
- 2025-11-05 – Migrated homepage hero copy, CTAs, stats, and video fallback into `landing.hero.*` with translations seeded for en/es/pt/fr/ar/de.
- 2025-11-05 – Consolidated remaining homepage sections under `landing.*` namespaces (feature showcase, demo, qualified teams) and updated locale files + components accordingly.
- 2025-11-05 – Localized global footer (brand, links, language switcher, social aria) via `landing.footer.*` and wired `Footer` component to translations.
- 2025-11-05 – Localized planner hub (`planner.hub.*`) and auth modal (`auth.modal.*`) including lock state, phase cards, and magic-link flows.

---

**Owner:** Frontend Team  
**Support:** Content Team (Markdown), AI Planner Dev (Backend), QA Lead  
**Goal:** ✅ Full localization across UI, planners, and guides by **January 2026**
