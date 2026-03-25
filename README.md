# CineSensei

A personalized movie and anime recommender with AI-driven suggestions, a lottery-style random
selector, animated UI, and user watchlists. Data is sourced from TMDb (movies/TV) and AniList
(anime), with stub data as a fallback when API keys are absent.

**Live app:** https://cinesensei-s5r2ggkjeq-uc.a.run.app
**GitHub:** https://github.com/patt-rick/cinesensei

---

## Prerequisites

- **Node.js 18+**
- A [Firebase project](https://console.firebase.google.com/) with Firestore and Google Auth enabled
- A [TMDb API key](https://www.themoviedb.org/settings/api) *(optional — stubs used if absent)*

---

## Local Setup

```bash
git clone https://github.com/patt-rick/cinesensei.git
cd cinesensei
npm install
cp .env.local.example .env.local   # then fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file with the following:

```bash
# Firebase — required for auth and watchlist
NEXT_PUBLIC_FIREBASE_API_KEY=         # Firebase project API key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=     # e.g. your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=      # e.g. your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=  # e.g. your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# TMDb — optional; curated stubs are used when absent
TMDB_API_KEY=                         # https://www.themoviedb.org/settings/api

# Firestore Admin — optional; only needed for server-side admin SDK usage
FIREBASE_SERVICE_ACCOUNT_JSON=        # JSON content of your service account key
```

---

## Running Tests

```bash
npm run test        # Jest unit tests
npm run test:e2e    # Playwright end-to-end tests (requires a running dev server)
```

---

## Build & Deploy

```bash
npm run build   # Produces an optimized Next.js build
npm start       # Serves the production build locally
```

The app is deployed to Google Cloud Run. See `Dockerfile` and `cloudbuild.yaml` for the
container build and deploy configuration.

---

## Pages

| Route        | Description                                        |
| ------------ | -------------------------------------------------- |
| `/`          | Hero carousel + trending movies & anime            |
| `/discover`  | Browse with genre, year, language, platform filter |
| `/lottery`   | Spinning wheel → confetti → random title reveal    |
| `/watchlist` | Saved titles with status and star ratings          |
| `/profile`   | User stats and genre breakdown                     |
| `/search`    | Full-text search + advanced filters                |
