# CineSensei — AI Codebase Guide

CineSensei is a personalized movie and anime recommender app with AI-driven suggestions,
a lottery-style random selector, animated UI, user watchlists, and data from free public
APIs (TMDb, AniList). Built with Next.js, Firebase, and Tailwind CSS, deployed to Cloud Run.

## Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | Next.js (App Router) + TypeScript               |
| Styling    | Tailwind CSS + shadcn/ui                        |
| Database   | Firebase Firestore                              |
| Auth       | Firebase Auth (Google OAuth)                    |
| Hosting    | Google Cloud Run                                |
| APIs       | TMDb (movies), AniList (anime, GraphQL)         |
| Tests      | Playwright (E2E) + Jest (unit)                  |
| Icons      | lucide-react                                    |

## PRD Analysis Summary

- **App**: CineSensei — movie + anime recommender with AI suggestions and lottery selector
- **Complexity**: high (6+ pages, auth, multiple external APIs, real-time data)
- **Auth**: Firebase Auth — Google OAuth only (Apple OAuth skipped — needs Apple Developer account)
- **Unsupported/stubbed**:
  - TMDb API → stub endpoints; inject `TMDB_API_KEY` via env var when available
  - AniList/MyAnimeList → stub endpoints; inject key via env var when available
  - Apple OAuth → Google only via Firebase Auth
  - Sound effects → Web Audio API / bundled assets (no external audio CDN)
  - Streaming platform availability → static badge metadata
  - PWA offline mode → manifest only, no full service worker caching

## Pages / Routes

| Route            | Page              | Description                                      |
| ---------------- | ----------------- | ------------------------------------------------ |
| `/`              | Home              | Animated carousel, trending section              |
| `/discover`      | Discover          | Grid + filters (genre, year, language, platform) |
| `/lottery`       | Lottery Mode      | Spinning wheel → confetti → card flip reveal     |
| `/watchlist`     | Watchlist         | Saved titles, swipe-to-remove, progress          |
| `/profile`       | Profile           | Stats, favorites, ratings, settings              |
| `/search`        | Search            | Full-text search + advanced filters              |
| `/api/*`         | API Routes        | Proxy to TMDb/AniList, Firestore writes          |

## Key Architectural Rules

### API Layer
- All external API calls go through `/app/api/` route handlers — never call TMDb/AniList directly from client components
- If `TMDB_API_KEY` env var is absent, return curated stub data (never throw 500)
- AniList is a public GraphQL API (no key needed for basic queries) — call directly from server

### Firestore Collections
- `users/{uid}` — profile, preferences, stats
- `users/{uid}/watchlist/{titleId}` — saved titles
- `users/{uid}/ratings/{titleId}` — user ratings
- `titles/{titleId}` — cached title metadata (TTL: 24h)

### Animation Rules
- Use Framer Motion for all transitions — never raw CSS animations for complex sequences
- Lottery wheel: CSS `@keyframes` spin + Framer Motion for reveal sequence
- Keep animations ≤ 300ms for navigation, ≤ 600ms for reveals
- `prefers-reduced-motion` must be respected — wrap all animations

### Auth Boundaries
- Watchlist and ratings require auth — redirect to `/` with login modal if unauthenticated
- Home, Discover, Lottery, Search are public (read-only)
- Firestore security rules: users can only read/write their own subcollections

### Release Date Display
- Movies: show release date from TMDb `release_date`
- Series: show `next_episode_to_air.air_date` from TMDb if available
- Anime: show `nextAiringEpisode.airingAt` from AniList (Unix timestamp → format)
- Display as relative ("in 3 days") + absolute ("Apr 2, 2026") using `date-fns`

## Design System

- **Background**: `#0a0a0a` (page), `#111827` (surface/card), `#1f2937` (border)
- **Accent neon**: `#6366f1` (indigo), `#a855f7` (purple), `#06b6d4` (cyan)
- **Success**: `#22c55e` · **Error**: `#ef4444` · **Warning**: `#f59e0b`
- **Dark mode default** — no light mode in v1
- **Navigation**: bottom tab bar on mobile, sidebar on desktop (Home, Discover, Lottery, Watchlist, Profile)
- **Font**: Geist Sans (body), Geist Mono (metadata/dates)
- **Icons**: lucide-react only — never images for UI icons

## Environment Variables

```bash
TMDB_API_KEY=          # Optional — stubs used if absent
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
FIREBASE_SERVICE_ACCOUNT_JSON=   # Server-side admin SDK
```

## Build & Run Commands

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run test       # Jest unit tests
npm run test:e2e   # Playwright E2E
```

## Current State

- **Deploy URL**: https://cinesensei-s5r2ggkjeq-uc.a.run.app
- **Smoke tests**: PASSING (deployed 2026-03-25)
- **E2E tests**: Playwright suite in `e2e/` (api, discover, home, lottery, navigation, search, auth, smoke)
- **Unit tests**: Jest configured; no unit test files yet
- **Final review**: Google avatar domain added to CSP/remotePatterns, console.error replaced with toast, aria-labels complete

## Documentation Hierarchy

| Layer                     | Loaded             | What goes here                                 |
| ------------------------- | ------------------ | ---------------------------------------------- |
| **CLAUDE.md** (this file) | Every conversation | Rules that prevent mistakes on ANY task        |
| **MEMORY.md**             | Every conversation | Cross-cutting patterns learned across sessions |
| **.claude/memory/**       | On demand          | Feature-specific deep dives                    |
| **Inline comments**       | When code is read  | Non-obvious "why" explanations                 |

### Sub-Memory Files

| File                | When to load                                      |
| ------------------- | ------------------------------------------------- |
| api-layer.md        | Adding/debugging TMDb or AniList API calls        |
| animations.md       | Framer Motion, lottery wheel, reveal sequences    |
| firestore.md        | Schema changes, security rules, index definitions |
| auth.md             | Firebase Auth flows, protected routes             |
| lottery-mode.md     | Lottery selector logic and animation pipeline     |
