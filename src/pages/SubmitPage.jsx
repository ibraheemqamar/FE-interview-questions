import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { CAT_ORDER, CAT_META } from "../data/categories.js";
import AuthModal from "../components/AuthModal.jsx";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function SubmitPage() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const [form, setForm] = useState({
    cat:         CAT_ORDER[0],
    q:           "",
    a:           "",
    fq:          "",
    fa:          "",
    difficulty:  "intermediate",
    tags:        "",
    name:        user?.user_metadata?.full_name || user?.email || "",
    email:       user?.email || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.q.trim() || !form.a.trim()) {
      toast.error("Question and answer are required.");
      return;
    }

    if (!supabase) {
      toast.error("Supabase is not configured yet. Ask the admin to set it up.");
      return;
    }

    setSubmitting(true);
    const tags = form.tags
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const { error } = await supabase.from("submissions").insert({
      cat:            form.cat,
      q:              form.q.trim(),
      a:              form.a.trim(),
      fq:             form.fq.trim(),
      fa:             form.fa.trim(),
      difficulty:     form.difficulty,
      tags,
      submitted_by:   user?.id ?? null,
      submitter_name: form.name.trim() || "Anonymous",
      submitter_email: form.email.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit: " + error.message);
    } else {
      setSubmitted(true);
      toast.success("Question submitted! The admin will review it shortly.");
    }
  };

  if (submitted) {
    return (
      <div className="wrap page-wrap">
        <div className="success-state">
          <div className="success-icon">✓</div>
          <h2>Question submitted!</h2>
          <p>The admin will review your question and approve it if it meets the quality bar.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "20px" }}>
            <button className="chip active" onClick={() => setSubmitted(false)}>
              Submit another
            </button>
            <Link to="/" className="chip">← Back to deck</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap page-wrap">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to deck</Link>
        <h1 className="page-title">Submit a Question</h1>
        <p className="page-sub">
          Contribute to the community deck. The admin reviews and approves every submission before it goes live.
        </p>
        {!user && (
          <div className="auth-notice">
            <span>Sign in to track your submissions.</span>
            <button className="auth-btn" onClick={() => setShowAuth(true)}>Sign in</button>
          </div>
        )}
      </div>

      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="form-row two-col">
          <div className="form-field">
            <label>Category *</label>
            <select value={form.cat} onChange={set("cat")}>
              {CAT_ORDER.map((c) => (
                <option key={c} value={c}>{CAT_META[c].label}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Difficulty *</label>
            <select value={form.difficulty} onChange={set("difficulty")}>
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label>Question *</label>
          <textarea
            value={form.q}
            onChange={set("q")}
            placeholder="What does the CSS `position: sticky` property do?"
            rows={3}
            required
          />
        </div>

        <div className="form-field">
          <label>Answer *</label>
          <textarea
            value={form.a}
            onChange={set("a")}
            placeholder="Explain clearly. You can use **bold**, `code`, and ```code blocks```."
            rows={5}
            required
          />
          <span className="form-hint">Supports Markdown: **bold**, `code`, ```code blocks```</span>
        </div>

        <div className="form-field">
          <label>Tricky follow-up question <span className="form-optional">(optional but encouraged)</span></label>
          <textarea
            value={form.fq}
            onChange={set("fq")}
            placeholder="A harder follow-up the interviewer might ask next…"
            rows={2}
          />
        </div>

        <div className="form-field">
          <label>Follow-up answer <span className="form-optional">(optional)</span></label>
          <textarea
            value={form.fa}
            onChange={set("fa")}
            placeholder="The answer to the follow-up above…"
            rows={3}
          />
        </div>

        <div className="form-field">
          <label>Tags <span className="form-optional">(comma-separated, optional)</span></label>
          <input
            type="text"
            value={form.tags}
            onChange={set("tags")}
            placeholder="closure, hoisting, event-loop"
          />
        </div>

        <div className="form-divider" />

        <div className="form-row two-col">
          <div className="form-field">
            <label>Your name <span className="form-optional">(optional)</span></label>
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="Anonymous"
            />
          </div>
          <div className="form-field">
            <label>Your email <span className="form-optional">(optional, not shown publicly)</span></label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </div>
      </form>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}
