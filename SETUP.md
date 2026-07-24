# Setup Guide — Frontend Interview Deck

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Choose a name and a strong database password → **Create**
3. Wait ~2 minutes for the project to provision

---

## 2. Run the Database Schema

1. In your Supabase dashboard → **SQL Editor** → **New query**
2. Paste the contents of `supabase/migrations/001_schema.sql`
3. Click **Run**
4. In the same editor, add yourself as admin:
   ```sql
   INSERT INTO admins (email) VALUES ('your-email@example.com');
   ```

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
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_EMAIL=your-email@example.com
```

---

## 5. Run Locally

```bash
npm install
npm run dev      # http://localhost:5173
```

---

## 6. Deploy to Vercel

### One-time setup:

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all three environment variables in **Settings → Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
4. Click **Deploy**

Vercel auto-deploys on every `git push`. The `vercel.json` in this repo handles SPA routing.

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

## How the Approval Flow Works

1. Anyone visits `/submit` and fills in the form → saved as `status: 'pending'`
2. You sign in with your admin email → the **Admin** nav link appears
3. Visit `/admin` → see all pending submissions, expand to read full answer
4. Click **✓ Approve** → card instantly goes live for all users
5. Click **✗ Reject** → can add a note explaining why

---

## App Routes

| Route | Description |
|---|---|
| `/` | Main quiz + browse deck |
| `/stats` | Your personal progress + spaced repetition |
| `/submit` | Community question submission form |
| `/admin` | Admin approval panel (your email only) |
