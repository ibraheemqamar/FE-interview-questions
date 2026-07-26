import { Router } from "express";
import { admin } from "../supabase.js";
import { requireAdmin } from "../auth.js";
import { validateQuestion } from "../validate.js";

const router = Router();

// Columns returned to the deck.
const CARD_COLS =
  "id,cat,q,a,fq,fa,difficulty,tags,company,source,submitter_name,upvotes,created_at";

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

// GET /api/questions — approved deck (public).
router.get("/questions", async (_req, res) => {
  const { data, error } = await admin
    .from("submissions")
    .select(CARD_COLS)
    .eq("status", "approved")
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST /api/questions — public submission (always pending). Auth optional.
router.post("/questions", async (req, res) => {
  const result = validateQuestion(req.body);
  if (!result.ok) return res.status(400).json({ errors: result.errors });

  const { error } = await admin.from("submissions").insert({
    ...result.value,
    status: "pending",
    source: "community",
    submitted_by: req.user?.id ?? null,
    submitter_name: (req.body.name || "").trim() || req.user?.email || "Anonymous",
    submitter_email: (req.body.email || "").trim() || req.user?.email || null,
  });
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ ok: true });
});

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

// GET /api/admin/submissions — every question, any status.
router.get("/admin/submissions", requireAdmin, async (_req, res) => {
  const { data, error } = await admin
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

// POST /api/admin/questions — admin creates a live (approved) question.
router.post("/admin/questions", requireAdmin, async (req, res) => {
  const result = validateQuestion(req.body);
  if (!result.ok) return res.status(400).json({ errors: result.errors });

  const { data, error } = await admin
    .from("submissions")
    .insert({
      ...result.value,
      status: "approved",
      source: "community",
      submitter_name: (req.body.name || "").trim() || req.user.email || "Admin",
      reviewed_by: req.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .select(CARD_COLS)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/admin/questions/:id — edit any question.
router.patch("/admin/questions/:id", requireAdmin, async (req, res) => {
  const result = validateQuestion(req.body);
  if (!result.ok) return res.status(400).json({ errors: result.errors });

  const { data, error } = await admin
    .from("submissions")
    .update(result.value)
    .eq("id", req.params.id)
    .select(CARD_COLS)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found." });
  res.json(data);
});

// POST /api/admin/questions/:id/review — approve or reject.
router.post("/admin/questions/:id/review", requireAdmin, async (req, res) => {
  const { status, notes } = req.body || {};
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "status must be 'approved' or 'rejected'." });
  }
  const { data, error } = await admin
    .from("submissions")
    .update({
      status,
      admin_notes: notes || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: req.user.id,
    })
    .eq("id", req.params.id)
    .select("*")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE /api/admin/questions/:id — remove a question.
router.delete("/admin/questions/:id", requireAdmin, async (req, res) => {
  const { error } = await admin.from("submissions").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

export default router;
