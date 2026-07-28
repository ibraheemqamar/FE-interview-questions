-- =============================================================================
-- Migration 005 — Practice: live coding problems + per-user attempts
-- Run this in the Supabase SQL editor AFTER 004_dedupe.sql.
--
-- Mirrors the submissions / user_progress shape (status + source workflow,
-- per-user rows) but for JavaScript/React coding problems executed client-side
-- in a sandboxed iframe. Fully idempotent: safe to re-run.
-- =============================================================================

-- -------------------------
-- problems — the coding problem bank (mirrors `submissions`)
-- -------------------------
CREATE TABLE IF NOT EXISTS problems (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,            -- url-friendly id, e.g. 'debounce-fn'
  title         TEXT NOT NULL,
  prompt_md     TEXT NOT NULL,                   -- problem statement, markdown (trusted, admin-authored)
  category      TEXT NOT NULL,                   -- reuse categories.js CAT_ORDER (Title-Case)
  difficulty    TEXT NOT NULL DEFAULT 'intermediate'
                CHECK (difficulty IN ('beginner','intermediate','advanced')),
  starter_code  TEXT NOT NULL DEFAULT '',
  solution_code TEXT,                            -- shown after solve / give-up, nullable
  -- test_cases: array of { name, call, expect } JS-expression strings, evaluated
  -- inside the sandboxed iframe against the user's submitted code. See
  -- server/validate.js validateProblem() for the authoritative shape + limits.
  test_cases    JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  company       TEXT,                            -- optional, same convention as submissions.company
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','approved','rejected')),
  source        TEXT NOT NULL DEFAULT 'community'
                CHECK (source IN ('core','community')),
  -- Admin review (mirrors submissions).
  admin_notes   TEXT,
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS problems_status_idx   ON problems (status);
CREATE INDEX IF NOT EXISTS problems_category_idx ON problems (category);

-- -------------------------
-- problem_attempts — the user's saved code + status per problem (mirrors user_progress)
-- -------------------------
CREATE TABLE IF NOT EXISTS problem_attempts (
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id    UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'in_progress'
                CHECK (status IN ('in_progress','solved','given_up')),
  last_run_pass_count  INTEGER DEFAULT 0,
  last_run_total_count INTEGER DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, problem_id)
);

-- =============================================================================
-- Row Level Security (RLS) — same style as 001_schema.sql: DROP then CREATE so
-- the whole migration is safely re-runnable (Postgres has no
-- "CREATE POLICY IF NOT EXISTS").
-- =============================================================================

ALTER TABLE problems         ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_attempts ENABLE ROW LEVEL SECURITY;

-- ---- problems: public read for approved, admins read/write anything ----
-- NOTE: all writes actually go through the Node API with the service-role key
-- (which bypasses RLS). These policies are the safety net for the anon key.
DROP POLICY IF EXISTS "approved problems are public" ON problems;
CREATE POLICY "approved problems are public" ON problems
  FOR SELECT USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "admins can insert problems" ON problems;
CREATE POLICY "admins can insert problems" ON problems
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "admins can update problems" ON problems;
CREATE POLICY "admins can update problems" ON problems
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

DROP POLICY IF EXISTS "admins can delete problems" ON problems;
CREATE POLICY "admins can delete problems" ON problems
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

-- ---- problem_attempts: users manage only their own rows (same as user_progress) ----
DROP POLICY IF EXISTS "users manage own attempts" ON problem_attempts;
CREATE POLICY "users manage own attempts" ON problem_attempts
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- Keep updated_at fresh on every UPDATE (reuses the pattern from 002).
-- =============================================================================
CREATE OR REPLACE FUNCTION touch_problem_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_problem_update
  BEFORE UPDATE ON problems
  FOR EACH ROW EXECUTE FUNCTION touch_problem_updated_at();

CREATE OR REPLACE FUNCTION touch_problem_attempt_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_problem_attempt_update
  BEFORE UPDATE ON problem_attempts
  FOR EACH ROW EXECUTE FUNCTION touch_problem_attempt_updated_at();

-- =============================================================================
-- No seed data here — create problems via the admin panel (Practice tab).
-- =============================================================================
