-- =============================================================================
-- Frontend Interview Deck — Supabase Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================================

-- -------------------------
-- Admin Users
-- -------------------------
CREATE TABLE IF NOT EXISTS admins (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT: Insert your own email so you can access the admin panel
-- INSERT INTO admins (email) VALUES ('your-email@example.com');

-- -------------------------
-- Community Submissions
-- -------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  cat         TEXT        NOT NULL,
  q           TEXT        NOT NULL,
  a           TEXT        NOT NULL,
  fq          TEXT        NOT NULL DEFAULT '',
  fa          TEXT        NOT NULL DEFAULT '',
  difficulty  TEXT        NOT NULL DEFAULT 'intermediate'
              CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  status      TEXT        NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Submitter info (authenticated or anonymous)
  submitted_by    UUID   REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name  TEXT   NOT NULL DEFAULT 'Anonymous',
  submitter_email TEXT,
  -- Admin review
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID   REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Voting
  upvotes     INTEGER NOT NULL DEFAULT 0,
  -- Timestamps
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- User Progress (Spaced Repetition)
-- -------------------------
CREATE TABLE IF NOT EXISTS user_progress (
  user_id       UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_ref      TEXT    NOT NULL,   -- 's{n}' for static cards, UUID for community
  status        TEXT    CHECK (status IN ('known', 'review')),
  -- SM-2 fields
  ease_factor   FLOAT   NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 1,
  repetitions   INTEGER NOT NULL DEFAULT 0,
  next_review   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_reviewed TIMESTAMPTZ,
  PRIMARY KEY (user_id, card_ref)
);

-- -------------------------
-- Votes
-- -------------------------
CREATE TABLE IF NOT EXISTS votes (
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  PRIMARY KEY (submission_id, user_id)
);

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

ALTER TABLE admins       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes        ENABLE ROW LEVEL SECURITY;

-- ---- admins table: only admins can read their own row ----
CREATE POLICY "admins can read self" ON admins
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- ---- submissions: public read for approved, admin reads all, anyone can insert ----
CREATE POLICY "approved submissions are public" ON submissions
  FOR SELECT USING (
    status = 'approved'
    OR EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

CREATE POLICY "anyone can submit" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "admins can update submissions" ON submissions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email')
  );

-- ---- user_progress: users manage only their own rows ----
CREATE POLICY "users manage own progress" ON user_progress
  FOR ALL USING (auth.uid() = user_id);

-- ---- votes: authenticated users can vote, read is public ----
CREATE POLICY "public can view votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "authenticated users can vote" ON votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can remove own vote" ON votes
  FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- Helper: Update upvotes count on vote insert/delete
-- =============================================================================
CREATE OR REPLACE FUNCTION update_submission_upvotes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE submissions SET upvotes = upvotes + 1 WHERE id = NEW.submission_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE submissions SET upvotes = upvotes - 1 WHERE id = OLD.submission_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER on_vote_change
  AFTER INSERT OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_submission_upvotes();

-- =============================================================================
-- Enable GitHub OAuth in Supabase Dashboard:
--   Authentication → Providers → GitHub → enable + add Client ID/Secret
--   Redirect URL to add in GitHub OAuth app: https://<your-project>.supabase.co/auth/v1/callback
-- =============================================================================
