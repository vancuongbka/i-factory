---
id: THEME-APPLICATION-PLAN
title: Theme Application Plan — Light & Dark
analyzed_files:
  - docs/design-guides/themes/light-theme.html
  - docs/design-guides/themes/dark-theme.html
target:
  - apps/web/src/app/globals.css
  - apps/web/tailwind.config.ts
  - apps/web/src/providers/theme-provider.tsx
  - apps/web/src/components/theme-switch.tsx
created: 2026-04-29
updated: 2026-04-29
status: in-progress
phases:
  - phase-1-token-alignment: done (2026-04-29)
  - phase-2-utilities-and-components: done (2026-04-29)
  - phase-3-layout-chrome: done (2026-04-29)
  - phase-4-page-redesign: partial (2026-04-29) — dashboard + CNC monitoring shipped; production list and chart deferred
  - phase-5-theme-switcher-polish: done (2026-04-29)
---

# Theme Application Plan

## 1. Analysis of the Mockups

### 1.1 Visual Identity (both mockups)

| Aspect | Light Theme | Dark Theme |
|--------|-------------|------------|
| Brand primary | Deep indigo `#3525cd` / `#4f46e5` | Emerald `#4edea3` / `#10b981` |
| Background base | `#fcf8ff` warm off-white (`bg-surface`) | `#0f172a` slate-900 (`bg-slate-900`) |
| Card surface | `rgba(255,255,255,0.8)` + `border-#e2e8f0` glassmorphism | `rgba(30,41,59,0.8)` slate-800 glass + `border-#334155` |
| Header / nav | `bg-white/80 backdrop-blur` + slate-200 border | `bg-slate-900/80 backdrop-blur` + slate-700 border |
| Side nav | 64px wide, expanded persistent (light) | 80px collapsed → 256px on hover (dark) |
| Status colors | emerald / amber / rose (Tailwind defaults) | emerald-500 / amber-500 / rose-500 (same names) |
| Typography | Inter (300–900) only | Inter + Space Grotesk (mono for codes) |
| Display weight | 700 / 32px (display-lg) | 700 / 36px (display-xl) |
| Card radii | `rounded-xl` (0.5rem) | `rounded-lg` (0.25rem) |
| Border accent | Left/top 4px coloured strip on cards | Subtle border + glow shadow |

### 1.2 Brand Direction Conflict

The two mockups disagree on brand identity:
- **Light theme:** Indigo `#4f46e5` is primary. Status colors are accents only.
- **Dark theme:** Emerald `#10b981` doubles as both primary *and* "running" status — they collide.

**Decision needed before implementation.** Recommendation: keep **indigo as the brand** in both modes (it already matches the existing `globals.css`), and reserve emerald exclusively for the "running/healthy" status. The dark mockup's emerald-as-brand makes status legibility ambiguous and creates a jarring identity break across modes.

### 1.3 Comparison with Current Code

| Token | Current (`globals.css`) | Light mockup | Dark mockup | Action |
|-------|------------------------|--------------|-------------|--------|
| `--primary` | `244 76% 60%` indigo | indigo `#3525cd` | emerald `#4edea3` | **Keep indigo both modes** (override mockup divergence) |
| `--background` | `220 23% 97%` / `231 30% 7%` | `#fcf8ff` warmer | `#0f172a` cooler | Adjust slightly to match |
| `--card` | `0 0% 100%` / `231 26% 16%` | white@80% glass | slate-800@80% glass | **Add glass utility**, keep solid `--card` for non-glass |
| `--status-running` | `143 100% 43%` | emerald-500 | emerald-500 | ✅ already aligned |
| `--status-warning` | `40 100% 50%` | amber-500 | amber-500 | ✅ already aligned |
| `--status-critical` | `0 100% 60%` | rose-500 | rose-500 | ✅ already aligned |
| Card radius | `0.375rem` | `0.5rem` (xl) | `0.25rem` (lg) | Bump default to `0.5rem` to match light mockup, since cards are the dominant surface |

The good news: existing `globals.css` is already **75% of the target**. The mockups don't require a CSS rewrite — they refine surface treatments (glass), nav behaviour, and a few new semantic tokens.

### 1.4 New Patterns from the Mockups

These do **not** exist in the current code and need to be added:

1. **`.glass-card` utility** — backdrop-blur + translucent surface + subtle border. Used on every card in both mockups.
2. **Status accent strip** on KPI cards (`border-l-4 border-l-primary`, `border-t-4 border-t-emerald-500`).
3. **Pulsing live indicator** — `animate-pulse` dot + `animate-ping` halo for "system online".
4. **Glow shadow** on machine status dots (`shadow-[0_0_8px_rgba(...)]`).
5. **Sidenav hover-expand** (dark) — width transitions from 80px to 256px on group hover.
6. **Material Symbols Outlined icon font** — neither codebase nor mockups use Lucide consistently.
7. **Mono font for codes** (`Space Grotesk` in dark, fallback to Inter in light) for things like `MC-101`, `CHASSIS_BRKT_V3`.

---

## 2. Application Plan

### 2.1 Guiding Principles

1. **One CSS variable system.** Don't fork separate tailwind configs per theme. Use the existing `:root` / `.dark` HSL pattern.
2. **Brand consistency overrides mockup divergence.** Indigo is primary in both modes. Emerald = healthy status only.
3. **Refine, don't replace.** `globals.css` is mostly correct. The work is glass surfaces, status accents, typography, and chrome.
4. **No breaking changes to existing pages.** Plan rolls out behind utility additions; existing components keep working until migrated.

### 2.2 Phased Rollout

#### Phase 1 — Token alignment (2–3 hrs, zero visual regression risk) — ✅ DONE 2026-04-29

**Shipped:**
- `globals.css` `--background` (light) tuned to `270 100% 99%` (`#fcf8ff`); `--background` (dark) to `222 47% 11%` (`#0f172a` slate-900).
- Dark-mode `--card` re-anchored to slate-800 (`217 33% 17%`); `--popover`, `--secondary`, `--muted`, `--border`, `--input` re-aligned to the slate scale.
- `--radius` bumped from `0.375rem` to `0.5rem`.
- New tokens: `--card-glass` and `--card-glass-border` (light + dark) consumed by Phase 2's `.glass-card` utility.
- No `tailwind.config.ts` change needed — `--radius` flows through automatically.


**Files:** `apps/web/src/app/globals.css`, `apps/web/tailwind.config.ts`

- Refine background hues to mockup values:
  - `--background` light: `260 100% 98%` (`#fcf8ff` warm) — currently `220 23% 97%`
  - `--background` dark: `222 47% 11%` (`#0f172a` slate-900) — currently `231 30% 7%`
- Bump `--radius` from `0.375rem` to `0.5rem` to match the light mockup's dominant card radius.
- Add new tokens for glass surfaces:
  ```
  --card-glass: rgba(255,255,255,0.8)            /* light */
  --card-glass: rgba(30,41,59,0.8)               /* dark */
  --card-glass-border: 220 14% 90% / 231 22% 28%
  ```
- Add tokens for KPI accent strips (semantic, not hard-coded):
  ```
  --accent-success / --accent-warning / --accent-critical / --accent-info
  ```
  These map to the same emerald/amber/rose/indigo HSL values already in `--status-*`. Decide whether to consolidate (preferred) — `--status-*` covers it; new aliases are unnecessary churn.

#### Phase 2 — Tailwind utilities + components (4–6 hrs) — ✅ DONE 2026-04-29

**Shipped:**
- `.glass-card` component class added to `globals.css` `@layer components` (translucent `--card-glass` @ 80% alpha, `backdrop-filter: blur(12px)`, light shadow + dark inset highlight).
- `<StatusDot>` component (`packages/ui/src/components/status-dot.tsx`) with tones `running | warning | critical | idle | planned`, plus `pulse`, `glow`, `size`, optional `label`.
- `<LiveIndicator>` component (`packages/ui/src/components/live-indicator.tsx`) — `animate-ping` halo + dot, supports `online: false` for offline state.
- `<KpiCard>` extended (backwards compatible): new `accent: 'primary'|'success'|'warning'|'critical'|'none'` and `variant: 'solid'|'glass'` props plus optional `footer` slot.
- Re-exported new components from `packages/ui/src/index.ts`.
- Decision (Q3): components stay icon-agnostic — `packages/ui` does not depend on Lucide or Material Symbols; consumer apps supply icons.


**Files:** `apps/web/src/app/globals.css` (`@layer components`), new `apps/web/src/components/ui/`

- Add `.glass-card` component class:
  ```css
  @layer components {
    .glass-card {
      @apply bg-card/80 backdrop-blur-md border border-border;
      @apply shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[inset_1px_1px_0_rgba(255,255,255,0.05)];
    }
  }
  ```
- Add a `<KpiCard>` component to `packages/ui` with props `{ accent: 'primary'|'success'|'warning'|'critical', label, value, secondary }`.
- Add a `<StatusDot>` component (`packages/ui`) with `pulse?: boolean` for the glow animation.
- Add a `<LiveIndicator>` component for the "System Online" badge.
- Wrap Material Symbols import: only import outline weights actually used (avoid 600KB font payload). Consider Lucide drop-in instead and document the choice.

#### Phase 3 — Layout chrome (4–6 hrs) — ✅ DONE 2026-04-29

**Shipped:**
- Topbar surface: `border-b bg-card` → `border-b border-border bg-card/80 backdrop-blur-md` with mode-specific shadow and `supports-[backdrop-filter]:bg-card/70` fallback.
- `<LiveIndicator>` inserted into the topbar right cluster as a rounded pill (`rounded-full border bg-background/60`).
- Sidebar surface: `border-r bg-card` → `border-r border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/85`.
- Active sidebar item state: `bg-secondary text-foreground` → `bg-accent text-accent-foreground` (indigo wash) plus a 3px left primary indicator strip via `before:` pseudo.
- Decisions confirmed: Q1 indigo brand in both modes; Q2 persistent sidebar with manual collapse retained.
- i18n: added `topbar.online` / `topbar.offline` keys to en.json, vi.json, ja.json.
- **Not done:** `LiveIndicator` is hard-coded `online`; wiring to actual WebSocket connectivity is deferred.


**Files:** `apps/web/src/app/(app)/layout.tsx`, `apps/web/src/components/layout/`

- Refactor existing top header to match mockup:
  - Light: solid white@80% + slate-200 border, indigo nav active state
  - Dark: slate-900@80% + slate-700 border, indigo nav active state (not emerald)
- Decide sidenav behaviour: choose **either** persistent expanded (light) or collapse-on-default-expand-on-hover (dark). Mixing them per theme will confuse users. Recommendation: **persistent expanded** with a manual collapse toggle, regardless of theme.
- Add the live system indicator (pulse + ping) to the header.

#### Phase 4 — Page redesign (per-page basis, 2–4 hrs/page) — 🟡 PARTIAL 2026-04-29

**Shipped:**
- Dashboard KPI row (`dashboard-stats-row.tsx`): all four cards converted to `variant="glass"`; OEE card carries `accent="primary"` (other three accent-free, mirroring light mockup). Icon hue palette switched from blue/green/orange to indigo/emerald/amber for status-palette consistency. GaugeIcon background tweaked to `bg-muted` and a `var(--border)` → `hsl(var(--border))` token bug fixed.
- CNC Monitoring (`cnc-monitoring-dashboard.tsx`): local KPI card removed; shared `<KpiCard>` adopted with `success`/`critical` accents on Running/Error tiles. `<MachineCard>` rebuilt with `glass-card` + top-strip status accent + `<StatusDot>` (`pulse` only on ERROR, `glow` always on). Status-tone mapping centralised through `STATUS_TONE: Record<CncMachineStatus, StatusTone>`.

**Deferred:**
- Production list KPI summary + table redesign.
- Hourly chart redesign on the dashboard (mockup-style stacked bar+line with Recharts).
- CRUD pages — intentionally untouched; they inherit Phase 1 token tweaks visually without further work.


Apply the new patterns to existing pages in priority order, since not all need the full mockup treatment:
1. **Dashboard / overview** — full mockup application (KPI cards, machine grid, alerts, hourly chart). Greenfield.
2. **CNC Monitoring (`/cnc/monitoring`)** — perfect fit for the mockup machine grid + status dots. Aligns with REQ-020 CNC-FR-026..030.
3. **Production list** — adopt KPI summary cards + table.
4. **Other CRUD pages** — keep current shadcn-style tables; just inherit the new tokens via `--card`, `--background`, etc.

#### Phase 5 — Theme switcher polish (1 hr) — ✅ DONE 2026-04-29

**Shipped:**
- `<ThemeSwitch>` upgraded from a single cycling button to a dropdown menu (system / light / dark) with active-state checkmark, matching the language switcher pattern.
- Trigger icon now reflects `resolvedTheme` when "system" is active, so the icon shows what the user actually sees (sun or moon) instead of the generic monitor glyph.
- All labels routed through next-intl: new i18n keys `topbar.theme.label`, `topbar.theme.system`, `topbar.theme.light`, `topbar.theme.dark` added to en.json, vi.json, ja.json.
- Hydration-mismatch guard retained (renders an empty 9×9 placeholder until mount).
- Persistence: localStorage via `next-themes` is sufficient for now; DB-backed per-user preference deferred.

**Files:** `apps/web/src/components/theme-switch.tsx`

- Verify three-state switch (`light` / `dark` / `system`) works correctly with the new tokens.
- Add a per-user preference persistence (currently `next-themes` uses localStorage only — fine for now; consider DB persistence in a later phase).

### 2.3 Decisions to Confirm Before Coding

| # | Question | Recommendation |
|---|----------|----------------|
| Q1 | Brand primary in dark mode: indigo (consistency) or emerald (mockup)? | **Indigo.** Reserve emerald for status. |
| Q2 | Sidenav: persistent expanded vs hover-expand? | **Persistent + manual collapse.** Hover-expand on touch devices is awkward. |
| Q3 | Icon font: Material Symbols vs existing Lucide? | **Lucide.** Already in shadcn ecosystem; smaller bundle; outline-only style matches both mockups. |
| Q4 | Card radius: `lg` (0.25rem) vs `xl` (0.5rem)? | **xl.** Light mockup uses it consistently and feels more modern. |
| Q5 | Glass cards everywhere or only on dashboard? | **Dashboard + monitoring only.** CRUD tables look noisy with glass. |
| Q6 | Two display fonts (Inter + Space Grotesk) vs one? | **Inter only.** One less font request; mono class can fall back to system mono. |

### 2.4 Risk & Regression

- **Low** — current `globals.css` already uses semantic tokens, so token tweaks ripple safely through shadcn components.
- **Medium** — adding `.glass-card` and accent strips to existing pages could break custom layouts; do per-page migration with visual diff.
- **High (only if mockup adopted verbatim)** — the dark mockup's emerald-primary would require recolouring every active-state CTA, link, and focus ring across the app. **Avoid** unless brand intentionally pivots.

### 2.5 Effort Estimate

| Phase | Effort | Status | Deliverable |
|-------|--------|--------|-------------|
| 1 — Token alignment | 2–3 hrs | ✅ Done 2026-04-29 | Updated `globals.css` (radius, dark-slate alignment, glass tokens) |
| 2 — Utilities + components | 4–6 hrs | ✅ Done 2026-04-29 | `.glass-card`, `<StatusDot>`, `<LiveIndicator>`, extended `<KpiCard>` |
| 3 — Layout chrome | 4–6 hrs | ✅ Done 2026-04-29 | Glass topbar/sidebar, indigo active state, `<LiveIndicator>` placement, i18n |
| 4 — Page redesign (dashboard + CNC monitoring) | 8–12 hrs | 🟡 Partial 2026-04-29 | Dashboard KPI row + CNC monitoring done; production list & chart deferred |
| 5 — Theme switcher polish | 1 hr | ✅ Done 2026-04-29 | Dropdown 3-state switch, resolved-theme icon, i18n |
| **Total** | **~3 working days** | **In progress** | Mockup applied across high-visibility surfaces |

---

## 3. Open Items / Follow-Ups

1. **Confirm Q1–Q6 above** before starting Phase 1.
2. **CNC monitoring page (REQ-020) is the perfect proving ground** for the mockup pattern — implement it concurrently with the design rollout rather than retrofitting later.
3. **Status badge component already exists** at `docs/design-guides/status-badge.md` — verify it aligns with the new emerald/amber/rose status tokens before adding a parallel `<StatusDot>`.
4. **Accessibility check** — verify contrast ratios on the proposed background/foreground combos hit WCAG AA (4.5:1 body, 3:1 large) in both modes. The existing tokens already pass; re-verify after Phase 1 hue tweaks.
5. **Keep mockups in sync** — once Phase 4 ships, re-export updated mockups so the HTML reference doesn't drift from the live app.
