---
title: "Fountain-Inspired UI Redesign"
type: feat
date: 2026-02-04
revised: true
---

# Fountain-Inspired UI Redesign

## Overview

Redesign PodCentral's frontend to adopt a dark-first, artwork-centric aesthetic with a golden yellow (#FFC300) accent color, inspired by [Fountain.fm](https://fountain.fm). The redesign is split into two phases: a visual foundation that ships first and is validated, followed by structural layout changes.

## Problem Statement

PodCentral uses a neutral grayscale palette with standard shadcn/ui defaults. The design is functional but generic. This redesign gives the app a distinctive, premium identity by adopting:

- Dark-first experience with a signature golden yellow accent
- Artwork-centric player and content presentation
- Clean, minimal interface with bold typography
- Single-scroll content pages (Phase B, after visual validation)

## Design Reference

| Element | Target Value |
|---------|-------------|
| Background | `#121212` (deep charcoal) |
| Surface/card | `#202020` |
| Elevated surface | `#323232` |
| Muted | `#555555` |
| Accent | `#FFC300` (golden yellow) |
| Text primary | `#FFFFFF` |
| Text secondary | `#AAAAAA` |
| Font | Inter |
| Player | Artwork-centric, larger artwork, golden controls |

---

## Phase A: Visual Foundation (Ship & Validate First)

Ship the color system, typography, and component restyling. This transforms the entire look without changing any page structure, navigation patterns, or data requirements. **Deploy this, live with it, and validate before moving to Phase B.**

### A1. Color System & Typography

#### `src/app/globals.css`

Replace the `.dark` theme CSS variables with Fountain's palette. Keep the existing light theme mostly intact (dark-first means we optimize for dark; light theme just gets the golden accent on `--primary` and `--ring` so buttons/focus states are consistent).

```css
.dark {
  --background: oklch(0.16 0 0);         /* #121212 */
  --foreground: oklch(0.98 0 0);         /* near white */
  --card: oklch(0.20 0 0);              /* #202020 */
  --card-foreground: oklch(0.98 0 0);
  --popover: oklch(0.20 0 0);
  --popover-foreground: oklch(0.98 0 0);
  --primary: oklch(0.84 0.16 86);       /* #FFC300 golden yellow */
  --primary-foreground: oklch(0.16 0 0);
  --secondary: oklch(0.24 0 0);         /* #323232 */
  --secondary-foreground: oklch(0.98 0 0);
  --muted: oklch(0.24 0 0);
  --muted-foreground: oklch(0.65 0 0);
  --accent: oklch(0.84 0.16 86);        /* golden yellow */
  --accent-foreground: oklch(0.16 0 0);
  --destructive: oklch(0.55 0.22 27);
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 10%);
  --ring: oklch(0.84 0.16 86);

  --sidebar: oklch(0.14 0 0);
  --sidebar-foreground: oklch(0.98 0 0);
  --sidebar-primary: oklch(0.84 0.16 86);
  --sidebar-primary-foreground: oklch(0.16 0 0);
  --sidebar-accent: oklch(0.20 0 0);
  --sidebar-accent-foreground: oklch(0.98 0 0);
  --sidebar-border: oklch(1 0 0 / 6%);
  --sidebar-ring: oklch(0.84 0.16 86);
}
```

For light theme, only update accent-related variables:

```css
:root {
  /* Only override primary/ring/accent — keep the rest as-is */
  --primary: oklch(0.55 0.16 86);
  --primary-foreground: oklch(1 0 0);
  --ring: oklch(0.55 0.16 86);
}
```

**OKLCH browser safety:** Tailwind 4 already uses OKLCH for its default palette, so if the app renders today, OKLCH works in the user's browser. No hex fallbacks needed.

#### `src/app/layout.tsx`

Switch from Geist to Inter:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
```

Update `globals.css`:
```css
--font-sans: var(--font-inter);
```

The `display: "swap"` prevents invisible text during font load.

**Files:** `src/app/globals.css`, `src/app/layout.tsx`

---

### A2. Sidebar

Make the sidebar blend with the dark canvas instead of being a separate panel:

- Remove distinct border between sidebar and content (set `--sidebar-border` to transparent or match bg)
- Active nav item: golden yellow icon + text, subtle `primary/10%` background tint
- Inactive: muted foreground (white/gray)
- Logo badge: golden accent background

**File:** `src/components/layout/app-sidebar.tsx`

---

### A3. Player Bar

Make the player artwork-forward with golden controls:

- Increase artwork from `size-12` (48px) to `size-14` (56px)
- Play button uses primary (golden) variant
- Chapter subtitle (already implemented via `useCurrentChapter`) displays normally — no extra styling needed beyond the theme change which makes `text-muted-foreground` work with the new palette
- The seek bar and controls automatically pick up the new `--primary` color since they use CSS variables

**File:** `src/components/layout/player-bar.tsx`

---

### A4. Home Page — Restyle Only

Keep the existing page structure (hero, trending, categories, recent episodes). The golden accent propagates automatically through buttons, badges, and interactive elements via CSS variables. Specific changes:

- Hero "View Podcast" button is now golden (automatic from `--primary` change)
- "Value Enabled" badge picks up new accent colors
- Category grid hover states pick up `--accent`
- Section headers remain as-is (clean, no decorative underlines)

**No structural changes.** Do NOT add "Recently Played" (requires data layer work). Do NOT remove the hero banner. Do NOT replace the category grid with a carousel.

**File:** `src/app/page.tsx` — Minimal changes if any, mostly CSS-variable-driven.

---

### A5. Component Touch-ups

Most component restyling happens automatically via CSS variable changes. Only make targeted edits where the component has hardcoded styles that fight the new theme:

#### `src/components/podcast/podcast-card.tsx`
- Verify hover state uses `hover:bg-accent` (already does) — golden comes free

#### `src/components/podcast/episode-row.tsx`
- Play button: if it uses `variant="ghost"`, it should pick up golden hover automatically. Verify.

#### Buttons and Badges
- `src/components/ui/button.tsx` — The `default` variant uses `bg-primary`. It's now golden. Verify it looks good with dark foreground text.
- `src/components/ui/badge.tsx` — Same: `default` variant becomes golden. Verify.

**Files:** Verify and adjust only where needed. Most work is done by globals.css.

---

### Phase A Validation Checklist

After shipping Phase A, verify before proceeding to Phase B:

- [ ] All pages render in dark mode with the new palette
- [ ] Golden accent is visible on: primary buttons, active sidebar item, badges, focus rings
- [ ] Play button in player bar and episode rows is golden
- [ ] Seek bar progress uses golden color
- [ ] Inter font loads correctly (no layout shift on Fast 3G)
- [ ] Contrast ratio of golden (#FFC300) on dark (#121212) bg ≈ 8.6:1 (passes WCAG AAA)
- [ ] Light mode is not broken (golden primary, rest unchanged)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm lint` passes (no new errors)
- [ ] `pnpm build` succeeds
- [ ] No console errors in browser

**Rollback:** If the golden accent doesn't work, revert `globals.css` to the previous values. The CSS variable architecture means one file revert restores the old theme. Keep old values in a git stash or comment block during development.

---

## Phase B: Structural Changes (After Phase A Validated)

These changes affect page layout and navigation. Only proceed after Phase A is live and confirmed to look good.

### B1. Content Pages — Single Scroll

Replace tabbed layouts with single-scroll pages. This is the biggest structural change.

#### `src/app/podcast/[podcastId]/page.tsx`

Current: Tabs (Episodes | About | Value)

Redesigned:
- Podcast header with golden CTA button
- Episode list inline (no tab switch needed — episodes are the primary content)
- "About" section below episodes, collapsed by default with a "Show more" toggle (use Radix Collapsible, not a new component)
- Value info as an inline badge/indicator, not a tab

#### `src/app/podcast/[podcastId]/episode/[episodeId]/page.tsx`

Current: Tabs (Description | Chapters | Transcript | Comments | Soundbites)

Redesigned (single scroll):
1. Episode header (larger artwork, golden play button)
2. Description — always visible
3. Chapters — inline list (if present)
4. Soundbites — inline (if present)
5. Transcript — inline with "Show more" expansion (Radix Collapsible, collapsed to ~10 lines by default). **No modal.** Keep it on the page. Modals are interruptions.
6. Comments — inline at bottom

**Files:**
- `src/app/podcast/[podcastId]/page.tsx`
- `src/app/podcast/[podcastId]/episode/[episodeId]/page.tsx`

**No new files.** Use Radix Collapsible (already available via shadcn) for expandable sections instead of building a transcript modal.

---

### B2. Home Page — Section Restructure

After validating Phase A's visual refresh, restructure the home page sections:

- Remove hero banner — replace with a compact "Featured" horizontal row
- Restyle trending section with golden accent headers
- Keep category grid but restyle as card-based (no carousel — carousels add complexity for touch, keyboard, and accessibility)
- Keep recent episodes list

Do NOT add "Recently Played" — that requires listening history data infrastructure, which is a separate project.

**Files:**
- `src/app/page.tsx`
- `src/components/discover/featured-hero.tsx` — Simplify to compact row or delete

---

### B3. Remaining Pages

Restyle Search, Library, Live, Settings pages:

- Search: golden focus ring on input (automatic from `--ring`), keep existing tabs
- Library: keep existing tabs, golden active indicator comes from theme
- Live: golden "Join" button (automatic from `--primary`), card surfaces from theme
- Settings: card surfaces from theme, golden slider track

Most of this is already handled by Phase A's CSS variable changes. Only make targeted edits where needed.

**Files:** `src/app/search/page.tsx`, `src/app/library/page.tsx`, `src/app/live/page.tsx`, `src/app/settings/page.tsx` — verify and adjust only.

---

## Files Changed (Complete List)

### Phase A (ship first)
1. `src/app/globals.css` — Color variables, font variable
2. `src/app/layout.tsx` — Inter font import
3. `src/components/layout/app-sidebar.tsx` — Golden active states, blend with canvas
4. `src/components/layout/player-bar.tsx` — Larger artwork
5. `src/components/ui/button.tsx` — Verify golden primary looks correct
6. `src/components/ui/badge.tsx` — Verify golden default looks correct
7. `src/components/podcast/podcast-card.tsx` — Verify hover states
8. `src/components/podcast/episode-row.tsx` — Verify play button accent

### Phase B (after validation)
9. `src/app/podcast/[podcastId]/page.tsx` — Single scroll
10. `src/app/podcast/[podcastId]/episode/[episodeId]/page.tsx` — Single scroll
11. `src/app/page.tsx` — Section restructure
12. `src/components/discover/featured-hero.tsx` — Simplify or remove
13. `src/app/search/page.tsx` — Verify/adjust
14. `src/app/library/page.tsx` — Verify/adjust
15. `src/app/live/page.tsx` — Verify/adjust
16. `src/app/settings/page.tsx` — Verify/adjust

**Total: 16 files (all modifications, zero new files)**

---

## Risk Analysis

| Risk | Mitigation |
|------|-----------|
| Golden accent doesn't look right | Ship Phase A first, validate visually. One-file revert of globals.css restores old theme. |
| Single-scroll is worse than tabs | Phase B is separate — don't ship it until Phase A is validated. Can keep tabs indefinitely. |
| Inter font causes layout shifts | `display: "swap"` on font config. Test on throttled network. |
| Component styles fight new colors | Phase A includes verification of button, badge, card, row components. Fix any hardcoded colors. |

---

## What Was Cut (Per Reviewer Feedback)

| Cut | Reason |
|-----|--------|
| "Recently Played" section | Requires new data infrastructure — scope creep |
| Transcript modal (`transcript-modal.tsx`) | New component = new complexity. Use inline Collapsible instead. |
| Seek bar glow effect | Decorative, zero user value |
| Carousel replacing category grid | Complex (touch, keyboard, a11y). Just restyle the grid. |
| Progress indicators on episodes | Requires playback history tracking — separate project |
| Extensive light theme rework | Dark-first redesign. Light theme gets golden accent only. |
| Filter pills replacing tabs (Library/Search) | Tabs work. Restyle, don't restructure. |
| 7-phase rollout | Collapsed to 2 phases: visual foundation + structural changes |

---

## References

- [Fountain 1.3 — Likes, Home Tab, Search](https://blog.fountain.fm/p/1-3)
- [Fountain 1.2.8 — Player Design Refresh](https://blog.fountain.fm/p/1-2-8)
- [Fountain 1.2 — Library & Content Pages Design](https://blog.fountain.fm/p/1-2-1)
- [Fountain 1.1.6 — Nested Navigation](https://blog.fountain.fm/p/1-1-6)
- [Fountain Features](https://fountain.fm/features)
