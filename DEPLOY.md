# Deploying (frontend on Vercel + backend on Render)

The app is two pieces:

- **Frontend** — Vite + React SPA → **Vercel** (static, global CDN).
- **Backend** — Express API in `server/` → **Render** (long-running Node server,
  runs unchanged). Swap Render for Railway/Fly.io if you prefer; the env vars are
  the same.

The frontend talks to the backend via the absolute `VITE_API_URL`. If you skip
the backend entirely, the app still runs on its offline localStorage cache — you
just lose the AI tutor and crowdsourced submission sync.

---

## 1. Deploy the backend (Render)

1. Push this repo to GitHub.
2. In [Render](https://render.com) → **New +** → **Blueprint** → pick this repo.
   It reads [`render.yaml`](render.yaml) and creates the `fe-interview-api` service.
3. When prompted, fill in the secret env vars:

   | Variable                    | Value |
   |-----------------------------|-------|
   | `SUPABASE_URL`              | `https://<project>.supabase.co` |
   | `SUPABASE_ANON_KEY`         | Supabase → Settings → API → anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key (secret!) |
   | `GEMINI_API_KEY`            | https://aistudio.google.com/apikey (optional — AI features) |
   | `CORS_ORIGINS`              | Your Vercel URL, e.g. `https://<app>.vercel.app` (comma-separate multiple) |

4. Deploy. Note the service URL, e.g. `https://fe-interview-api.onrender.com`.
   Verify it's up: open `https://fe-interview-api.onrender.com/api/health`
   → should return `{"ok":true}`.

> Render's free tier sleeps after ~15 min idle; the first request then cold-starts
> (~50s). Fine for a demo; upgrade the plan to keep it warm.

---

## 2. Deploy the frontend (Vercel)

**CLI:**
```powershell
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # production
```
Or import the repo in the Vercel dashboard (auto-detects Vite via `vercel.json`).

Then set these env vars in **Vercel → Project → Settings → Environment Variables**
(Production scope), and redeploy:

| Variable                 | Value |
|--------------------------|-------|
| `VITE_API_URL`           | `https://fe-interview-api.onrender.com/api` (your Render URL + `/api`) |
| `VITE_SUPABASE_URL`      | `https://<project>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_ADMIN_EMAIL`       | Your admin login email |

> `VITE_*` vars are baked in at **build time**, so you must redeploy after changing
> them (`vercel --prod`, or "Redeploy" in the dashboard).

---

## 3. Wire the two together

- Set `CORS_ORIGINS` on Render to your final Vercel URL (from step 2), then redeploy
  the Render service — otherwise the browser blocks API calls.
- If you add a custom domain later, add it to `CORS_ORIGINS` too.

---

## Security checklist before going public

- [ ] **Rotate** the Supabase service-role key and Gemini key if they were ever
      committed (they were in `.env.example`). Supabase → Settings → API → roll keys.
- [ ] Replace real values in `.env.example` with placeholders.
- [ ] Never expose the service-role key to the browser (it stays server-side / Render only).
