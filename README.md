# Frontend Interview Deck

A React flashcard app for frontend-interview prep. Study questions across 8
topics, each with an answer and a "tricky follow-up" — in a **quiz** mode
(one card at a time, keyboard-driven, spaced repetition), a **cram** mode
(a focused, timed session with a summary), or a **browse** mode
(accordion of every card).

Every question is stored in **Supabase** and served through a **Node/Express
API** (`server/`) that owns all question create/edit/delete logic. Anyone can
submit a question for review; an admin can **add, edit, delete, approve, and
reject** questions from an in-app admin panel. Questions can optionally record
**which company** asked them in an interview.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [How the data works (API-backed)](#how-the-data-works-api-backed)
- [The `company` field](#the-company-field)
- [Getting started](#getting-started)
- [Database setup & migrations](#database-setup--migrations)
- [Seeding the original 253 questions](#seeding-the-original-253-questions)
- [App routes](#app-routes)
- [Project structure](#project-structure)
- [Data model](#data-model)
- [Auth & roles](#auth--roles)
- [Progress & spaced repetition](#progress--spaced-repetition)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Adding / editing questions](#adding--editing-questions)
- [Deployment](#deployment)
- [Security notes](#security-notes)

## Features

- **8 topics** — HTML, CSS, JavaScript, Tailwind, React, Next.js, TypeScript,
  Performance. (Categories are configured in code; questions live in the DB.)
- **Quiz mode** — one card at a time, reveal answer → reveal follow-up, grade
  recall on a 4-point scale (_Again / Hard / Good / Easy_), progress bar, fully
  keyboard-driven.
- **Cram mode** — a focused, timed session of N cards (10 / 20 / 40) prioritised
  by what you most need to see: cards due today, then ones you flagged, then the
  least-recently-seen. Ends with a summary (got-it vs review, accuracy, time)
  and a "restart with the ones I missed" button.
- **Browse mode** — an accordion of every card, expand to read inline.
- **Filters** — category chips, **company** dropdown, clickable **tag chips**,
  difficulty filter, and full-text search across question / answer / follow-up /
  tags. Active filters show as removable pills with a "Clear all"; plus shuffle
  and reset.
- **Community submissions** — anyone can submit a question; it stays `pending`
  until an admin approves it.
- **Admin panel** — approve / reject submissions, **create / edit / delete**
  any question directly, all from the browser.
- **Optional company tag** — record which company asked a question ("asked at
  Google").
- **Difficulty** — beginner / intermediate / advanced, with badges and a filter.
- **Tags** — free-form, searchable.
- **Upvotes** — signed-in users can upvote questions.
- **Accounts** — GitHub OAuth or email magic-link (via Supabase Auth).
- **Progress + spaced repetition** — 4-grade SM-2 scheduling; progress is saved
  locally and synced to the cloud when signed in; a stats dashboard shows mastery
  per topic and cards due for review.
- **Study streak** — a daily streak (consecutive days with ≥1 review) shown as a
  🔥 pill in the top bar and a banner on the stats page.
- **Export / import progress** — download a JSON backup of your spaced-repetition
  state, or merge one in (most-recently-reviewed version of each card wins).
- **Installable PWA + offline study** — a service worker caches the app shell and
  the last-fetched deck (stale-while-revalidate), so you can study with no
  network. Reviews made offline queue in `localStorage` and sync to Supabase when
  you reconnect. An "Install" prompt and an offline indicator appear when relevant.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 18 + React Router 7 |
| Build | Vite 5 |
| PWA | vite-plugin-pwa + Workbox (offline service worker, installable) |
| API | Node.js + Express (`server/`) — question CRUD + validation |
| DB / Auth | Supabase (Postgres + Row Level Security) |
| Toasts | react-hot-toast |
| Hosting | Vercel (SPA, `vercel.json` handles routing) + Node host for the API |

## How the data works (API-backed)

**All questions come from the Node API — there is no static question data in the
bundle anymore.** (Earlier versions shipped 253 cards baked into JS; those were
migrated into the database and the static files were removed.)

The request flow:

```
  Browser (React)                Node/Express API (server/)          Supabase
  ───────────────                ──────────────────────────         ──────────
  QuestionsContext ──GET /api/questions───▶ validate + query ──service role──▶ submissions
  SubmitPage       ──POST /api/questions──▶ validate → pending ─────────────▶ (RLS bypassed)
  AdminPage        ──POST/PATCH/DELETE────▶ requireAdmin + validate ────────▶
                       (Bearer token)          │
                                               ▼
                                    checks `admins` table

  Auth (login) + user progress + votes still go browser → Supabase directly (RLS-protected).
```

- One table, `submissions`, holds **every** question (both seeded "core"
  questions and community ones). A `source` column (`core` / `community`) and a
  `status` column (`pending` / `approved` / `rejected`) distinguish them.
- The public deck shows only `status = 'approved'` rows.
- The **server** ([server/](server/)) is the only thing that writes questions.
  It uses the Supabase **service-role** key (bypasses RLS) and enforces all
  rules itself: category/difficulty enums, required fields, length limits, tag
  normalization ([server/validate.js](server/validate.js)), and admin
  authorization from the Bearer token ([server/auth.js](server/auth.js)).
- Frontend API layer: [`src/lib/api.js`](src/lib/api.js) attaches the Supabase
  access token; [`src/lib/questions.js`](src/lib/questions.js) wraps each
  endpoint (`fetchApprovedQuestions`, `submitQuestion`, `fetchAllSubmissions`,
  `createQuestion`, `updateQuestion`, `reviewQuestion`, `deleteQuestion`).
- [`src/contexts/QuestionsContext.jsx`](src/contexts/QuestionsContext.jsx)
  fetches the approved deck once and shares it with the deck + stats pages, and
  applies admin edits optimistically (no full refetch).

### Why a Node layer (and not browser → Supabase directly)?

It centralizes add/edit/delete **business rules** on the server where the client
can't bypass them, keeps the powerful service-role key off the browser, and
gives one place to add future logic (rate limits, moderation, audit logs).
Auth, progress, and votes stay Supabase-direct because RLS already guards them.

## Backend API

Base path `/api` (Vite proxies it to the server in dev; same-origin in prod).

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | public | Liveness check |
| `GET` | `/api/questions` | public | Approved deck |
| `POST` | `/api/questions` | public | Submit a question (saved `pending`) |
| `GET` | `/api/admin/submissions` | admin | All questions, any status |
| `POST` | `/api/admin/questions` | admin | Create a live (approved) question |
| `PATCH` | `/api/admin/questions/:id` | admin | Edit a question |
| `POST` | `/api/admin/questions/:id/review` | admin | Approve / reject |
| `DELETE` | `/api/admin/questions/:id` | admin | Delete a question |

Admin routes require an `Authorization: Bearer <supabase-access-token>` header;
the server verifies the token and checks the `admins` table.

## The `company` field

When someone submits or an admin creates a question, they can **optionally** add
the company that asked it (e.g. "Google", "Stripe"). It's stored in the nullable
`company` column and shown as an "🏢 asked at _Company_" badge on the card
(and a compact pill in browse / admin lists). Leaving it blank stores `NULL` and
renders nothing.

## Getting started

```bash
npm install
npm run dev:all  # start BOTH the API (:3001) and the web app (:5173)

# or run them separately:
npm run server   # Node API only  (http://localhost:3001)
npm run dev      # Vite web app only (http://localhost:5173), proxies /api → :3001

npm run build    # production build of the frontend → dist/
npm run preview  # preview the production build
```

You need a Supabase project for questions to load, and the **API must be
running** — the first load has no offline data. Without valid env vars the app
runs but the deck will be empty.

> 📴 **Testing the PWA / offline mode:** the service worker is disabled in
> `vite dev`. Run `npm run build && npm run preview`, open the preview URL, then
> toggle **DevTools → Network → Offline** (or Application → Service Workers) to
> verify the deck and your progress still work. Install via the address-bar
> install icon or the in-app **Install** button.

Environment variables (copy `.env.example` → `.env.local`):

```env
# Frontend (browser) — public anon key only
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=your-email@example.com

# Node API (server-side only — never exposed to the browser)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
CORS_ORIGINS=http://localhost:5173
```

> 🔐 The **service-role key** bypasses RLS. Keep it only in `.env.local` (git-
> ignored) and your host's server env — never in `VITE_*` vars or the browser.

## Database setup & migrations

Run these in the Supabase SQL editor **in order**:

1. [`supabase/migrations/001_schema.sql`](supabase/migrations/001_schema.sql) —
   base tables (`admins`, `submissions`, `user_progress`, `votes`), RLS
   policies, and the upvote trigger.
2. [`supabase/migrations/002_questions_crud.sql`](supabase/migrations/002_questions_crud.sql) —
   adds the `company`, `source`, and `updated_at` columns; tightens the insert
   policy (public can only insert `pending`, admins can insert anything); adds an
   admin **DELETE** policy; adds an `updated_at` trigger.
3. [`supabase/migrations/003_enrich_core.sql`](supabase/migrations/003_enrich_core.sql) —
   backfills real **difficulty** (was all `intermediate`) and **tags** on the 253
   core questions. Non-destructive `UPDATE`s matched by exact question text; safe
   to re-run. **Run this only after the core seed exists** (see below).
4. Add yourself as an admin:
   ```sql
   INSERT INTO admins (email) VALUES ('your-email@example.com');
   ```

Full step-by-step (OAuth, Vercel, redirect URLs) is in [SETUP.md](SETUP.md).

## Seeding the original 253 questions

The original hand-written deck (253 cards) is preserved as SQL and can be
imported once:

- Run [`supabase/seed_core_questions.sql`](supabase/seed_core_questions.sql) in
  the Supabase SQL editor. It inserts all 253 cards as `status='approved'`,
  `source='core'`.

That file was generated from the old static data by
[`scripts/generate-seed.mjs`](scripts/generate-seed.mjs) (kept for the record;
the static source files it read have since been removed).

> ⚠️ Run the seed **once**. Re-running it appends duplicates unless you
> `TRUNCATE submissions` first.

After the core seed + `003_enrich_core.sql`, two optional content packs add more
cards (both **idempotent** — each insert is guarded by `NOT EXISTS`, so they are
safe to re-run):

- [`supabase/seed_extra_questions.sql`](supabase/seed_extra_questions.sql) — 123
  additional questions (JS internals, React advanced, state management, routing,
  React Query / RTK Query, Web Components, SSR, tooling, testing, and frontend
  system-design), each with difficulty + tags. `Performance` doubles as the
  catch-all category for browser/tooling/testing/system-design topics.
- [`supabase/seed_jordan_company_bank.sql`](supabase/seed_jordan_company_bank.sql) —
  36 **curated / representative** prep questions tagged with well-known Jordan
  (Amman) frontend employers (Aramex, Mawdoo3, ProgressSoft, Zain, etc.). These
  are *not* verified "asked-at" transcripts — each is a question a candidate
  should reasonably expect given the company's domain. The card UI renders the
  tag as "🏢 asked at X"; soften that copy in
  [Flashcard.jsx](src/components/Flashcard.jsx) if you want a weaker claim.

Recommended run order: `001` → `002` → core seed → `003` → `seed_extra` →
`seed_jordan_company_bank`.

## App routes

| Route | Description |
| --- | --- |
| `/` | Main quiz + browse deck |
| `/stats` | Your personal progress + spaced-repetition dashboard |
| `/submit` | Community question submission form (with optional company) |
| `/admin` | Admin panel — review, create, edit, delete (admin email only) |

## Project structure

```
src/
  main.jsx                    # React entry
  App.jsx                     # Router + Auth/Progress/Questions providers
  styles.css                  # All styles (design ported from the original HTML deck)
  lib/
    supabase.js               # Supabase client (auth + progress; null if env missing)
    api.js                    # fetch wrapper — attaches the Supabase access token
    questions.js              # Calls the Node API (fetch/submit/create/update/review/delete)
    sm2.js                    # SM-2 spaced-repetition algorithm + 4-grade scale
    markdown.js               # Tiny trusted markdown renderer
  contexts/
    AuthContext.jsx           # Session, sign-in/out, isAdmin check
    ProgressContext.jsx       # Local + cloud progress, 4-grade SM-2, streak, export/import
    QuestionsContext.jsx      # Loads approved deck from API, admin mutations
  components/
    TopBar.jsx                # Brand, nav, auth menu, streak pill, deck stats
    Controls.jsx              # Category chips, search, company/tag filters, pills, mode toggles
    ProgressBar.jsx           # Reviewed / got-it / to-review meter
    QuizView.jsx              # Counter, card, 4-grade & nav controls
    CramView.jsx              # Focused timed session (setup → session → summary)
    Flashcard.jsx             # A single quiz card (+ company badge)
    InstallButton.jsx         # PWA install prompt + offline indicator
    BrowseView.jsx            # Accordion list of all cards
    QuestionForm.jsx          # Shared question editor (submit + admin), company field
    AuthModal.jsx             # GitHub / magic-link sign-in
    Footer.jsx
  pages/
    HomePage.jsx              # Deck orchestration (filters, deck, keyboard)
    SubmitPage.jsx            # Public submission page
    AdminPage.jsx             # Admin review + CRUD
    StatsPage.jsx             # Progress dashboard
  data/
    categories.js             # Category labels + accent colors (config, not content)
server/                       # Node/Express API
  index.js                    # App entry: middleware, routes, listen
  env.js                      # Loads + validates server env vars
  supabase.js                 # Service-role + anon Supabase clients
  auth.js                     # attachUser / requireUser / requireAdmin middleware
  validate.js                 # Question validation + business rules
  routes/questions.js         # Public + admin question routes
supabase/
  migrations/001_schema.sql   # Base schema + RLS
  migrations/002_questions_crud.sql  # company/source, RLS tightening, delete, CRUD
  seed_core_questions.sql     # The original 253 cards as INSERTs
scripts/
  generate-seed.mjs           # Generator that produced the seed (historical)
  gen-icons.mjs               # Generates the PWA/app icons in public/ (no deps)
public/                       # Static assets served at / (PWA icons, favicon)
```

## Data model

`submissions` — every question (see `001` + `002`):

| Column | Notes |
| --- | --- |
| `id` | UUID, primary key |
| `cat` | Category id (must match a key in `categories.js`) |
| `q`, `a` | Question / answer (answer supports markdown) |
| `fq`, `fa` | Optional follow-up question / answer |
| `difficulty` | `beginner` \| `intermediate` \| `advanced` |
| `tags` | `text[]`, searchable |
| `company` | **Optional** — which company asked it (nullable) |
| `source` | `core` (seeded) \| `community` (submitted/created in-app) |
| `status` | `pending` \| `approved` \| `rejected` |
| `submitted_by` / `submitter_name` / `submitter_email` | Who submitted it |
| `admin_notes`, `reviewed_at`, `reviewed_by` | Review metadata |
| `upvotes` | Maintained by a trigger on the `votes` table |
| `created_at`, `updated_at` | Timestamps |

Other tables: `admins` (email allow-list), `user_progress` (per-user SM-2 state),
`votes` (one row per user per submission).

## Auth & roles

- **Auth** via Supabase — GitHub OAuth or email magic-link
  ([AuthContext.jsx](src/contexts/AuthContext.jsx)).
- **Admin** = your email is present in the `admins` table. The Admin nav link
  and `/admin` route only work for admins; RLS enforces this on the server too.
- **RLS summary** — approved questions are world-readable; the public can insert
  only `pending` rows; admins can insert/update/delete anything; users manage
  only their own progress and votes.

## Progress & spaced repetition

- Grading a card on the 4-point scale runs the **SM-2** algorithm
  ([sm2.js](src/lib/sm2.js)) to schedule the next review. The grades map to SM-2
  quality values: **Again** = 1 (resets the card), **Hard** = 3, **Good** = 4,
  **Easy** = 5. For the coarse two-bucket views (progress bar, stats, browse),
  again/hard count as _review_ and good/easy as _known_.
- Progress is stored in `localStorage` and, when signed in, synced to
  `user_progress` (cloud wins on merge) — see
  [ProgressContext.jsx](src/contexts/ProgressContext.jsx). The exact grade is
  kept locally only; the DB `status` column stays `known`/`review`, and the finer
  signal already rides the synced SM-2 numbers, so **no DB migration is needed**.
- **Streak** — a per-identity daily streak (consecutive days with ≥1 review) is
  tracked in `localStorage` and surfaced in the top bar and stats page.
- **Export / import** — the Stats page can download a JSON snapshot of your SM-2
  state + streak and merge one back in (most-recent review wins per card). Works
  signed-out (local only) and signed-in (merged winners are pushed to the cloud).
- The Stats page shows cards studied, mastered, to-review, due today, and a
  per-topic breakdown.

> Note: progress is keyed by question `id` (a UUID). If you re-seed / recreate
> questions, their ids change and previously tracked progress won't map to the
> new rows.

## Keyboard shortcuts (Quiz & Cram)

| Key | Action |
| --- | --- |
| `R` | Reveal answer / then follow-up |
| `F` | Reveal follow-up |
| `←` `→` / `Space` | Previous / next card (Quiz) |
| `1` | Grade _Again_ |
| `2` | Grade _Hard_ |
| `3` | Grade _Good_ |
| `4` | Grade _Easy_ |
| `S` | Shuffle deck (Quiz) |

### Practice (coding problems)

| Key | Action |
| --- | --- |
| `⌘/Ctrl` + `Enter` | Run your code against the tests (editor focused) |

## Adding / editing questions

- **As a visitor:** go to `/submit`, fill in the form (category, difficulty,
  question, answer, optional follow-up, **optional company**, tags). It's saved
  as `pending` for admin review.
- **As an admin:** go to `/admin`.
  - **+ New question** creates a question that goes live immediately.
  - Expand any card → **✎ Edit** to change it, or **🗑 Delete** to remove it.
  - Pending submissions also show **✓ Approve** / **✗ Reject**.

To add a whole new **topic**, add an entry to `CAT_META` and `CAT_ORDER` in
[categories.js](src/data/categories.js), then author questions with that `cat`.

## Practice (coding problems)

`/practice` is a bank of live JavaScript/React coding problems. Users write a
solution in an in-browser [CodeMirror](https://codemirror.net/) editor, run it
against the problem's test cases, and get AI coaching (hint / review / explain a
failing test). All code execution happens **client-side** in a sandboxed
`<iframe sandbox="allow-scripts">` (no `allow-same-origin`), so untrusted code
can't touch cookies, `localStorage`, or the Supabase session — see
[src/lib/sandbox.js](src/lib/sandbox.js). A per-run timeout guards against
infinite loops.

- **Run the migration first:** apply
  [supabase/migrations/005_problems_schema.sql](supabase/migrations/005_problems_schema.sql)
  in the Supabase SQL editor (creates `problems` + `problem_attempts` with RLS).
- **Author problems:** go to `/admin` → **Practice problems** tab → **+ New
  problem** (title, prompt, starter/solution code, and `{ name, call, expect }`
  test cases). New problems go live immediately.
- **AI coach** reuses the same Gemini setup as the flashcard tutor
  (`GEMINI_API_KEY`, server-side only) — no extra key needed. It's rate-limited
  per user and gracefully disabled (503) when no key is set.

## Deployment

Two pieces now deploy:

- **Frontend** → Vercel (SPA; `vercel.json` handles routing). Set the `VITE_*`
  env vars, plus `VITE_API_URL` pointing at your deployed API if it's on another
  host. Add your production domain to Supabase's allowed redirect URLs.
- **API (`server/`)** → any Node host (Render, Railway, Fly, a VM, or Vercel
  serverless). Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGINS` (your frontend's origin).
  Start it with `npm run server`.

If you host both behind the same domain, leave `VITE_API_URL` as `/api` and
route `/api/*` to the Node server. Full instructions in [SETUP.md](SETUP.md).

## Security notes

- **`.env.example` contains placeholders only.** Never commit real Supabase
  URLs, keys, or admin emails — put those in `.env.local` (git-ignored) and in
  your host's env settings. (`.env` / `.env.*` are also git-ignored now.)
- **The service-role key lives only on the server.** It bypasses RLS, so it must
  never appear in a `VITE_*` var or reach the browser. All admin authorization
  is re-checked server-side ([server/auth.js](server/auth.js)) — the client's
  `isAdmin` is only for showing/hiding UI.
- The markdown renderer ([markdown.js](src/lib/markdown.js)) injects HTML via
  `dangerouslySetInnerHTML`. It escapes input first, but answer content is
  effectively trusted — only admins can publish it, so keep the admin allow-list
  tight.
- Answer/question content is user-authored once approved; the approval step is
  your quality/safety gate.
