-- =============================================================================
-- Migration 002 — API-backed questions: company field, source, and full CRUD
-- Run this in the Supabase SQL editor AFTER 001_schema.sql.
-- =============================================================================

-- -------------------------
-- New columns on submissions
-- -------------------------
-- Optional "which company asked this question" tag.
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS company TEXT;

-- Where the question came from: 'core' (seeded from the original deck) or
-- 'community' (submitted through the app). Purely informational.
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'community'
  CHECK (source IN ('core', 'community'));

-- Track edits.
ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- -------------------------
-- Tighten Row Level Security
-- -------------------------
-- The original policy let ANYONE insert a row with ANY status (including
-- 'approved'), which would let the public publish cards without review.
-- Replace it: the public may only insert PENDING rows; admins may insert
-- anything (so they can create already-approved questions directly).
DROP POLICY IF EXISTS "anyone can submit" ON submissions;

CREATE POLICY "public can submit pending" ON submissions
  FOR INSERT WITH CHECK (status = 'pending');

CREATE POLICY "admins can insert any" ON submissions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

-- Admins can delete questions (new — enables the admin "Delete" action).
CREATE POLICY "admins can delete submissions" ON submissions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

-- NOTE: "admins can update submissions" already exists from 001 and covers edits.

-- -------------------------
-- Keep updated_at fresh on every UPDATE
-- -------------------------
CREATE OR REPLACE FUNCTION touch_submission_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_submission_update
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION touch_submission_updated_at();

-- =============================================================================
-- After this migration, run supabase/seed_core_questions.sql once to import the
-- 253 original cards as approved 'core' questions.
-- =============================================================================
