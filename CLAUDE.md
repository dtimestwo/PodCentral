# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PodCentral — a Podcasting 2.0 client prototype built with Next.js, shadcn/ui, audio-ui.xyz, and Tailwind CSS. Implements the full Podcasting 2.0 namespace feature set with dummy data (no database). Desktop-first layout with sidebar, main content area, and persistent bottom audio player.

## Commands

- `pnpm dev` — Start development server (Turbopack)
- `pnpm build` — Production build
- `pnpm lint` — Run ESLint
- `pnpm tsc --noEmit` — Type check without emitting

## Architecture

### Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript, `src/` dir)
- **Styling:** Tailwind CSS 4 with shadcn/ui CSS variables for theming
- **UI Components:** shadcn/ui (Radix-based, source in `src/components/ui/`)
- **Audio:** audio-ui.xyz registry (source in `src/components/audio/`), backed by Zustand store in `src/lib/audio-store.ts`
- **State:** Zustand stores in `src/stores/` for library and wallet; audio-ui's own store for playback
- **Icons:** Lucide React
- **Package Manager:** pnpm

### Key Patterns
- **AudioProvider** wraps the entire app in `layout.tsx` — manages HTML5 audio lifecycle, syncs with Zustand store
- **useAudioStore** (from `src/lib/audio-store.ts`) is the single source of truth for playback state — use `setQueueAndPlay()` to play episodes
- **Track type** (from `src/lib/html-audio.ts`) is the audio-ui track format — map Episode data to Track when playing
- **Dummy data** lives in `src/data/*.ts` — typed arrays that mirror Podcast Index API shapes. No API calls, no database
- **Dark mode** via next-themes, default dark. Toggle in Settings page

### Layout Structure
- `layout.tsx` → ThemeProvider → TooltipProvider → AudioProvider → SidebarProvider → [Sidebar + SidebarInset + PlayerBar]
- Sidebar: `src/components/layout/app-sidebar.tsx`
- Player bar: `src/components/layout/player-bar.tsx` (fixed bottom, always visible)
- Main content: each route in `src/app/*/page.tsx`

### Routes
- `/` — Home/Discover (featured hero, trending carousel, categories, recent episodes)
- `/search` — Client-side search with podcast/episode tabs
- `/podcast/[podcastId]` — Podcast detail (SSR) with Episodes/About/Value tabs
- `/podcast/[podcastId]/episode/[episodeId]` — Episode detail (client) with Description/Chapters/Transcript/Comments/Soundbites tabs
- `/live` — Live streams with chat
- `/library` — Subscriptions, queue, history
- `/settings` — Appearance, playback, wallet, identity

### External Image Domains
Configured in `next.config.ts`: picsum.photos, i.pravatar.cc, cdn.pixabay.com

### ESLint
`react/display-name` is disabled for `src/components/audio/` and `src/components/ui/` since these are vendor components from shadcn/audio-ui registries.
