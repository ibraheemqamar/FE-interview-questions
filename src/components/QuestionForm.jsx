import { useState } from "react";
import { CAT_ORDER, CAT_META } from "../data/categories.js";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

// Shared question editor used by both the public Submit page and the admin
// create/edit flows. Set `showSubmitter` to include name/email fields.
export default function QuestionForm({
  initial = {},
  onSubmit,
  submitLabel = "Save",
  onCancel,
  showSubmitter = false,
  busy = false,
}) {
  const [form, setForm] = useState({
    cat:        initial.cat        ?? CAT_ORDER[0],
    q:          initial.q          ?? "",
    a:          initial.a          ?? "",
    fq:         initial.fq         ?? "",
    fa:         initial.fa         ?? "",
    difficulty: initial.difficulty ?? "intermediate",
    tags:       Array.isArray(initial.tags) ? initial.tags.join(", ") : (initial.tags ?? ""),
    company:    initial.company    ?? "",
    name:       initial.name       ?? "",
    email:      initial.email      ?? "",
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
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

      <div className="form-row two-col">
        <div className="form-field">
          <label>Company <span className="form-optional">(optional)</span></label>
          <input
            type="text"
            value={form.company}
            onChange={set("company")}
            placeholder="Which company asked this? e.g. Google"
          />
          <span className="form-hint">Where this question was asked in an interview.</span>
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
      </div>

      {showSubmitter && (
        <>
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
        </>
      )}

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="chip" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button type="submit" className="submit-btn" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
