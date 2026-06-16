# The Dresden Half 🏃‍♀️

A personal training PWA for Katie's two 2026 goal races:

- **B-race:** Copenhagen 1-Mile — Sep 19, 2026 (goal sub-6:00)
- **A-race:** Dresden Half Marathon — Oct 25, 2026 (goal sub-1:45)

It tracks the day-by-day plan, workouts, strength, mobility, fueling/macros,
weight, morning check-ins, and a VDOT-based race predictor — all offline-capable
and synced across devices.

## Tech stack

- **Frontend:** vanilla HTML/CSS/JS, no framework. Loaded as classic scripts
  that share one global scope (`plan.js` → `lib/training-math.js` → `app.js`).
- **PWA:** `manifest.json` + `sw.js` service worker (offline + installable).
- **Backend:** Supabase (Postgres + Row-Level Security) for cross-device sync;
  Vercel serverless functions in `api/` proxy third-party APIs so secrets never
  reach the browser.
- **Hosting:** Vercel (static site + serverless functions). No build step
  required — files are served as-is.

## Project layout

```
Katie_Mile_Training_Calendar_Interactive.html  # the app shell (entry; index.html redirects here)
app.js                  # application logic (rendering, state, sync, UI)
plan.js                 # the training plan as data (weeks, workouts, phases)
lib/training-math.js    # pure running math (VDOT engine, time fmt) — testable
styles.css              # all styles (design tokens + light/dark themes)
sw.js                   # service worker (stale-while-revalidate for app code)
api/                    # Vercel serverless proxies
  _cors.js              #   shared CORS helper
  _ratelimit.js         #   shared per-IP rate limiter
  label/proxy.js        #   nutrition-label photo → Claude vision
  usda/proxy.js         #   food search (USDA FoodData Central)
  fatsecret/proxy.js    #   food search (FatSecret, alternate)
  strava/*.js           #   Strava OAuth exchange/refresh
supabase-setup.sql      # one-time DB schema + RLS policies
tests/                  # node:test unit tests for lib/
scripts/build.js        # optional esbuild minify (opt-in; not required)
*_SETUP.md              # setup notes for each integration
Dresden-Half-Training-Plan.md  # the NRC-based dual-race plan writeup
```

## Local development

It's a static site — open the HTML directly, or serve the folder:

```bash
npx serve .        # or: python3 -m http.server
```

Then open the served URL. (Service worker + camera need https or localhost.)

## Testing

Pure logic lives in `lib/training-math.js` and is covered by Node's built-in
test runner (no dependencies):

```bash
npm test
```

When you change anything in `lib/`, add/extend a test in `tests/`. Keep new
pure helpers in `lib/` so they stay testable.

## Optional minify build

The app runs fine unbuilt; this just emits smaller copies into `dist/`:

```bash
npm install      # one-time, pulls esbuild
npm run build
```

`dist/` is git-ignored. Deploying the minified copies is optional.

## Data & sync

- State is stored in `localStorage` first (instant, offline), then synced to
  Supabase when signed in. Sync uses last-write-wins per record with local-only
  entries preserved (see `pushToCloud` / `pullFromCloud` in `app.js`).
- A `schemaVersion` + migration runner (`runSchemaMigrations` in `app.js`) makes
  future changes to stored-data shape explicit and one-time per device.
- To set up the database, run `supabase-setup.sql` once in the Supabase SQL
  editor (idempotent — safe to re-run; it also adds new tables/columns).

## Integrations

Each needs environment variables in Vercel → Settings → Environment Variables.
See the per-integration setup docs:

- `SCAN_SETUP.md` — nutrition-label photo reader (`ANTHROPIC_API_KEY`)
- `USDA_SETUP.md` — food search (`USDA_API_KEY`)
- `FATSECRET_SETUP.md` — alternate food search
- Strava — `STRAVA_CLIENT_SECRET` (client ID is public, in `app.js`)
- `ALLOWED_ORIGIN` — locks the API proxies to your deployment URL

The serverless proxies are rate-limited per IP (`api/_ratelimit.js`); the
label/Claude proxy is capped tightest since it costs money per call.
