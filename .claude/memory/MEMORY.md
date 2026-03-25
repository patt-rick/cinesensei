# CineSensei — Project Memory

Personalized movie + anime recommender. Next.js App Router, Firebase Auth + Firestore, Tailwind + shadcn/ui, deployed to Cloud Run. See ./CLAUDE.md for full rules.

## Current State

- **Test count**: TBD
- **Deploy URL**: TBD
- **Last major change**: Initial project setup (Prompt 00 — docs)

## Key Decisions

- TMDb API key optional — stubs return curated data when `TMDB_API_KEY` absent
- AniList uses public GraphQL endpoint (no key needed for basic queries)
- Apple OAuth skipped — Google only via Firebase Auth
- Framer Motion for all complex animations; CSS keyframes for lottery wheel spin only
- Dark mode only in v1 — no light mode toggle

## Topic Files

Create as patterns emerge during build.

| File              | When to load                                      |
| ----------------- | ------------------------------------------------- |
| api-layer.md      | Adding/debugging TMDb or AniList API calls        |
| animations.md     | Framer Motion, lottery wheel, reveal sequences    |
| firestore.md      | Schema changes, security rules, index definitions |
| auth.md           | Firebase Auth flows, protected routes             |
| lottery-mode.md   | Lottery selector logic and animation pipeline     |

## Memory File Rules

- One topic per file, 30–80 lines
- Terse: tables, bullets, code — no prose
- Update this index when creating or removing files
