# Setup Guide — Frontend Interview Deck

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name and a strong database password → **Create**
3. Wait ~2 minutes for the project to provision

---

## 2. Run the Database Schema

Run these in the Supabase **SQL Editor**, in order:

1. Paste + **Run** `supabase/migrations/001_schema.sql` (base tables + RLS).
2. Paste + **Run** `supabase/migrations/002_questions_crud.sql`
   (adds the `company` / `source` / `updated_at` columns, tightens the insert
   policy, and adds the admin delete policy + CRUD support).
3. Add yourself as admin:
   ```sql
   INSERT INTO admins (email) VALUES ('your-email@example.com');
   ```

### Seed the original 253 questions (optional but recommended)

Paste + **Run** `supabase/seed_core_questions.sql`. It imports the original
deck as approved `core` questions.

> ⚠️ Run the seed **once** — re-running appends duplicates unless you
> `TRUNCATE submissions;` first.

---

## 3. Enable GitHub OAuth (recommended)

1. Go to Supabase → **Authentication** → **Providers** → **GitHub** → Enable
2. Copy the **Callback URL** shown (e.g. `https://xxx.supabase.co/auth/v1/callback`)
3. Go to [github.com/settings/applications/new](https://github.com/settings/applications/new)
4. Create a new OAuth app with that callback URL
5. Copy the **Client ID** and generate a **Client Secret**
6. Paste both back into Supabase's GitHub provider settings → **Save**

### Optional: Enable magic-link email

This works out of the box in Supabase — no extra setup needed.  
Check **Authentication → Email** to configure your sender name.

---

## 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in the values from your Supabase project dashboard (**Settings → API**):

```env
# Frontend (browser) — public anon key only
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=your-email@example.com

# Node API (server-side only)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Settings → API → service_role
PORT=3001
CORS_ORIGINS=http://localhost:5173
```

> 🔐 The **service-role** key bypasses Row Level Security. Keep it only in
> `.env.local` and your host's env — never in a `VITE_*` var or the browser.

---

## 5. Run Locally

```bash
npm install
npm run dev:all      # API on :3001 + web app on :5173
```

Or run them in separate terminals: `npm run server` and `npm run dev`.
The web app proxies `/api` to the Node server, so open http://localhost:5173.

---

## 6. Deploy

There are **two** deployables: the frontend and the Node API.

### Frontend → Vercel

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add these environment variables in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
   - `VITE_API_URL` — your deployed API URL (e.g. `https://your-api.onrender.com/api`),
     or leave it as `/api` if the API is served from the same domain
4. Click **Deploy**

Vercel auto-deploys on every `git push`. The `vercel.json` in this repo handles SPA routing.

### API (`server/`) → any Node host

Deploy `server/` to Render, Railway, Fly, a VM, or Vercel serverless. Set:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `CORS_ORIGINS` — your frontend's origin(s), comma-separated
  (e.g. `https://flashcards.yourdomain.com`)

Start command: `npm run server`. Health check: `GET /api/health`.

### Add your custom domain:

1. In Vercel → your project → **Settings → Domains**
2. Add your domain (e.g. `flashcards.yourdomain.com`)
3. Follow the DNS instructions (add a CNAME record at your domain registrar)

---

## 7. Supabase Auth Redirect URLs

Add your production domain to Supabase's allowed redirect URLs:

1. Supabase → **Authentication → URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://yourdomain.com
   https://your-vercel-preview.vercel.app
   ```

---

## How the Approval & CRUD Flow Works

1. Anyone visits `/submit` and fills in the form (incl. an optional **company**)
   → saved as `status: 'pending'`
2. You sign in with your admin email → the **Admin** nav link appears
3. Visit `/admin`:
   - See all pending submissions, expand to read the full answer
   - **✓ Approve** → card instantly goes live for all users
   - **✗ Reject** → can add a note explaining why
   - **+ New question** → create a question that goes live immediately
   - Expand any card → **✎ Edit** to change it, or **🗑 Delete** to remove it

---

## App Routes

| Route | Description |
|---|---|
| `/` | Main quiz + browse deck |
| `/stats` | Your personal progress + spaced repetition |
| `/submit` | Community question submission form |
| `/admin` | Admin approval panel (your email only) |
