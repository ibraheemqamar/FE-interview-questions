# Progress log

A running summary of feature work on the Frontend Interview Deck.
Stack: React 18 + Vite + React Router 7, Node/Express API (`server/`), Supabase (Postgres + RLS), SM-2 spaced repetition.

_Last updated: 2026-07-26._

> **AI features need a key + `npm run dev:all`.** Set `GEMINI_API_KEY` in `.env.local` (server-side only — never a `VITE_*` var). Free key, no card: https://aistudio.google.com/apikey. Without it the AI tutor/grader degrade gracefully to a 503 and a "Sign in / configure" hint; the rest of the app is unaffected. Model defaults to `gemini-3.5-flash` (override with `AI_MODEL`).

## Roadmap status

| Item | Feature | Key files | Status |
| --- | --- | --- | --- |
| P0.1 | **Cram mode** — timed focused session (setup → session → summary); deck prioritized due → flagged → least-recently-seen → random | [CramView.jsx](src/components/CramView.jsx), [HomePage.jsx](src/pages/HomePage.jsx) | ✅ build |
| P0.2 | **Filters** — clickable tag chips, removable active-filter pills, "Clear all" (company dropdown pre-existed) | [Controls.jsx](src/components/Controls.jsx) | ✅ build |
| P0.4 | **4-grade SM-2** — Again/Hard/Good/Easy → quality 1/3/4/5, keys 1–4 (Quiz + Cram) | [sm2.js](src/lib/sm2.js), [ProgressContext.jsx](src/contexts/ProgressContext.jsx), [QuizView.jsx](src/components/QuizView.jsx) | ✅ build |
| P0.3 | **Export/import + streak** — JSON backup/merge (most-recent-review wins), daily 🔥 streak on TopBar + Stats | [ProgressContext.jsx](src/contexts/ProgressContext.jsx), [StatsPage.jsx](src/pages/StatsPage.jsx), [TopBar.jsx](src/components/TopBar.jsx) | ✅ build |
| P1.1 | **Company study paths** — `/paths` + `/paths/:company`; "Start this path" launches a seeded Quiz/Cram session | [PathsPage.jsx](src/pages/PathsPage.jsx), [PathDetailPage.jsx](src/pages/PathDetailPage.jsx), [lib/paths.js](src/lib/paths.js) | ✅ build |
| P1.2 | **Mock interview (no AI)** — timed sequential round → transcript (yours vs model) → Markdown export | [MockPage.jsx](src/pages/MockPage.jsx) | ✅ build |
| P1.3 | **PWA + offline** — service worker, manifest + icons, cache-first deck, offline progress sync queue, install prompt | [vite.config.js](vite.config.js), [QuestionsContext.jsx](src/contexts/QuestionsContext.jsx), [ProgressContext.jsx](src/contexts/ProgressContext.jsx), [InstallButton.jsx](src/components/InstallButton.jsx), [scripts/gen-icons.mjs](scripts/gen-icons.mjs) | ✅ build + PWA artifacts |
| P2.1 | **AI tutor** — per-card "Explain simpler / Go deeper / Show example / Analogy"; streamed (SSE), grounded server-side in the stored answer | [server/routes/ai.js](server/routes/ai.js), [AiTutor.jsx](src/components/AiTutor.jsx), [Flashcard.jsx](src/components/Flashcard.jsx), [src/lib/ai.js](src/lib/ai.js) | ✅ build + server boot |
| P2.2 | **AI mock grader** — scores your mock answer 0–5 vs the stored answer (verdict / strengths / gaps / one follow-up); structured JSON | [server/routes/ai.js](server/routes/ai.js), [MockPage.jsx](src/pages/MockPage.jsx), [src/lib/ai.js](src/lib/ai.js) | ✅ build + server boot |

## Data enrichment

The original 253 seed questions were all `difficulty = 'intermediate'` with no `tags` and no `company` — which starved the filter, tag-chip, and company-path features. Fixed with three **idempotent, quote-validated** SQL files (the DB was already seeded, so core enrichment is `UPDATE`s, not a reseed):

- [`supabase/migrations/003_enrich_core.sql`](supabase/migrations/003_enrich_core.sql) — 253 `UPDATE`s backfilling real difficulty (**77 beginner / 160 intermediate / 16 advanced**) + tags, matched by exact question text + category.
- [`supabase/seed_extra_questions.sql`](supabase/seed_extra_questions.sql) — **123** net-new questions distilled from the personal study doc (JS internals, React advanced, state management, routing, React Query/RTK Query, Web Components, SSR, tooling, testing, frontend system design). `Performance` doubles as the catch-all category for browser/tooling/testing/system-design.
- [`supabase/seed_jordan_company_bank.sql`](supabase/seed_jordan_company_bank.sql) — **36** curated questions across 12 Jordan (Amman) frontend employers (Aramex, Mawdoo3, Tamatem, ProgressSoft, Madfooatcom, Optimiza, Estarta, Zain, Orange, Arabia Weather, Maysalward, Bayzat). **Representative prep, not verified "asked-at" transcripts** (stated in the file header).

**Recommended run order:** `001` → `002` → core seed → `003` → `seed_extra` → `seed_jordan_company_bank`.
After `003`, verify all rows matched: `SELECT count(*) FROM submissions WHERE source='core' AND tags = '{}';` should return **0**.

## Running the app

```bash
npm run dev:all   # BOTH the API (:3001) and the web app (:5173)
```

A bare `npm run dev` starts only the frontend, so every `/api/*` call 500s through the Vite proxy (the backend on :3001 isn't there). The API is up when the terminal shows `[server] API listening on http://localhost:3001`.

**Testing the PWA:** the service worker is disabled in `vite dev`. Run `npm run build && npm run preview`, then DevTools → Network → **Offline** to verify offline studying + progress sync.

## UX clarity pass (2026-07-27)

Information-architecture + consistency pass across all pages (palette kept):

- **Global nav on every page.** `TopBar` is now self-sufficient (reads the deck count from `useQuestions` instead of an `allCards` prop) and renders on Deck, Paths, Path detail, Mock, Stats, Submit, Admin. Previously sub-pages had *no* nav — only a "← Back to deck" link, a dead-end. Removed those; kept contextual back-links ("← All paths", "← Back to admin").
- **Deck page hierarchy** ([Controls.jsx](src/components/Controls.jsx)): split into a primary **Mode** selector (Quiz / Cram / Browse, each a card with icon + one-line description) over a grouped, secondary **Filter** panel (search + difficulty/company dropdowns + category chips + tags + active pills). Difficulty is now a dropdown (was a toggle), so it's usable on mobile. Added a dismissible first-run hint (localStorage `fid-deck-hint-dismissed-v1`).
- Removed the mobile `.diff-toggle{display:none}` rule (it was hiding the Mock setup's difficulty picker on phones); tidied unused `Link` imports; display-font on the Cram setup heading.
- Build passes. Not visually verified in a browser by me — worth a quick `npm run dev:all` pass.

## Open decisions / flags

- **`Performance` is a catch-all category** for browser/tooling/testing/system-design questions (no dedicated category exists). Could add real `Browser` / `Testing` / `Architecture` categories instead (edits to `categories.js`, `validate.js`, `CAT_ORDER`).
- **Company bank renders "🏢 asked at X"** — overclaims for curated content. Optional one-line softening in [Flashcard.jsx](src/components/Flashcard.jsx) (e.g. "prep for X").
- **Not runtime-verified**: the SQL against the live Supabase DB, and actual PWA install/offline behavior — both need a manual pass.

## Phase 2 — the AI layer (built 2026-07-26)

Both AI features are **grounded server-side**: the routes never trust the client to supply the "model answer" — they re-read the approved question from Supabase by id and build the prompt from that, so generation can't drift from (or be spoofed past) the curated answer. The API key is server-side only. Access is gated to **signed-in users** (`requireUser`); anonymous visitors keep the full deck/quiz/cram/mock and just see a "sign in" hint on the AI bits. A naive in-memory per-user rate limit (30 req / 5 min) backstops usage.

**Provider: Google Gemini (free tier)** — [server/gemini.js](server/gemini.js), SDK `@google/genai`, model `gemini-3.5-flash` (override with `AI_MODEL`). Chosen for a genuinely free tier (no card). Thinking is disabled (`thinkingConfig.thinkingBudget: 0`) on both calls for latency/cost; the tutor streams (`generateContentStream`), the grader uses structured output (`responseMimeType: application/json` + `responseJsonSchema`, reusing the same JSON schema). **The provider lives entirely in `server/gemini.js` + the two calls in `server/routes/ai.js`** — the client (SSE stream + `{score,verdict,strengths,gaps,followUp}` shape) is provider-agnostic, so this was swapped in from the original Anthropic wiring without touching a single frontend file.

- **P2.1 AI tutor** ✅ — [AiTutor.jsx](src/components/AiTutor.jsx) renders inside every revealed [Flashcard.jsx](src/components/Flashcard.jsx) (so it works in Quiz **and** Browse). Four modes → `POST /api/ai/tutor` → SSE token stream → rendered as Markdown live. Aborts on card-change/unmount (`req.on("close")` server-side stops billing).
- **P2.2 AI mock grader** ✅ — [MockPage.jsx](src/pages/MockPage.jsx) gained a "Grade my answer with AI" button (running phase after reveal + per-item in the transcript) → `POST /api/ai/mock` → structured `{ score, verdict, strengths[], gaps[], followUp }`.

**Not runtime-verified by me:** the actual Gemini generation path — I have no `GEMINI_API_KEY`. Verified instead: `npm run build` passes, the server boots and mounts `/api/ai` cleanly alongside `/api/questions`, the disabled-key path returns 503, and the auth gate returns 401 when a key is present but the caller is unauthenticated. Needs a real (free) key + `npm run dev:all` for an end-to-end check.

> ⚠️ **Mount gotcha (resolved):** the AI router is mounted at its own base `app.use("/api/ai", ai)` — **not** a second `app.use("/api", ...)` alongside the questions router. Two real routers sharing `/api` in Express 5 produced a routing collision (requests 404'd past the second router). The distinct base also reads better. (Also: `pkill` does not reliably kill backgrounded `node` on Windows/Git Bash — a stale listener on :3001 masked this for several test cycles; kill by PID via `taskkill //F //PID`.)

## Next up (Phase 3 — monetization + polish)

- **P3.1 Stripe** + **P3.2 pricing** — gate AI features (or higher rate limits) behind a paid tier.
- **P1.4 shareable cards** / **P3.3 SEO**.

Guiding rule (still): every AI feature stays grounded in the stored answer (never free-floating generation), and the API key stays server-side only (never a `VITE_*` var). Provider is isolated to `server/gemini.js` + two calls in `server/routes/ai.js` — swappable without touching the client.
