import { useState } from "react";
import { CAT_ORDER, CAT_META } from "../data/categories.js";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const emptyCase = () => ({ name: "", call: "", expect: "" });

// Admin editor for a Practice coding problem. Same look/feel as QuestionForm.
// Test cases are { name, call, expect } JS-expression strings evaluated in the
// sandbox against the user's code (see server/validate.js for the contract).
export default function ProblemForm({
  initial = {},
  onSubmit,
  submitLabel = "Save",
  onCancel,
  busy = false,
}) {
  const [form, setForm] = useState({
    title:         initial.title         ?? "",
    slug:          initial.slug          ?? "",
    category:      initial.category      ?? CAT_ORDER[0],
    difficulty:    initial.difficulty    ?? "intermediate",
    prompt_md:     initial.prompt_md     ?? "",
    starter_code:  initial.starter_code  ?? "",
    solution_code: initial.solution_code ?? "",
    tags:          Array.isArray(initial.tags) ? initial.tags.join(", ") : (initial.tags ?? ""),
    company:       initial.company       ?? "",
  });
  const [cases, setCases] = useState(
    Array.isArray(initial.test_cases) && initial.test_cases.length
      ? initial.test_cases.map((c) => ({ name: c.name ?? "", call: c.call ?? "", expect: c.expect ?? "" }))
      : [emptyCase()]
  );

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setCase = (i, field) => (e) =>
    setCases((cs) => cs.map((c, j) => (j === i ? { ...c, [field]: e.target.value } : c)));
  const addCase = () => setCases((cs) => [...cs, emptyCase()]);
  const removeCase = (i) => setCases((cs) => (cs.length > 1 ? cs.filter((_, j) => j !== i) : cs));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Drop fully-empty rows; the server also normalizes + validates.
    const test_cases = cases
      .map((c) => ({ name: c.name.trim(), call: c.call.trim(), expect: c.expect.trim() }))
      .filter((c) => c.call || c.expect || c.name);
    onSubmit({ ...form, test_cases });
  };

  return (
    <form className="submit-form" onSubmit={handleSubmit}>
      <div className="form-row two-col">
        <div className="form-field">
          <label>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={set("title")}
            placeholder="Implement debounce"
            required
          />
        </div>
        <div className="form-field">
          <label>Slug <span className="form-optional">(optional — derived from title)</span></label>
          <input
            type="text"
            value={form.slug}
            onChange={set("slug")}
            placeholder="debounce-fn"
          />
          <span className="form-hint">Lowercase letters, numbers and hyphens. Must be unique.</span>
        </div>
      </div>

      <div className="form-row two-col">
        <div className="form-field">
          <label>Category *</label>
          <select value={form.category} onChange={set("category")}>
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
        <label>Prompt *</label>
        <textarea
          value={form.prompt_md}
          onChange={set("prompt_md")}
          placeholder="Describe the problem. You can use **bold**, `code`, and ```code blocks```."
          rows={6}
          required
        />
        <span className="form-hint">Supports Markdown: **bold**, `code`, ```code blocks```</span>
      </div>

      <div className="form-field">
        <label>Starter code <span className="form-optional">(shown in the editor to begin)</span></label>
        <textarea
          className="code-input"
          value={form.starter_code}
          onChange={set("starter_code")}
          placeholder={"function debounce(fn, wait) {\n  // your code here\n}"}
          rows={6}
          spellCheck={false}
        />
      </div>

      <div className="form-field">
        <label>Solution code <span className="form-optional">(optional — revealed after solve / give-up)</span></label>
        <textarea
          className="code-input"
          value={form.solution_code}
          onChange={set("solution_code")}
          placeholder={"function debounce(fn, wait) {\n  let t;\n  return (...args) => { ... };\n}"}
          rows={6}
          spellCheck={false}
        />
      </div>

      {/* Test cases -------------------------------------------------------- */}
      <div className="form-field">
        <label>Test cases <span className="form-optional">(run in the sandbox against the user's code)</span></label>
        <span className="form-hint">
          <code>call</code> and <code>expect</code> are JS expressions. The user's code defines the function;
          e.g. call <code>sum([1,2,3])</code>, expect <code>6</code>. Compared with deep equality.
        </span>
        <div className="tc-list">
          {cases.map((c, i) => (
            <div key={i} className="tc-row">
              <div className="tc-row-head">
                <span className="tc-index">#{i + 1}</span>
                <input
                  type="text"
                  className="tc-name"
                  value={c.name}
                  onChange={setCase(i, "name")}
                  placeholder="describe this case (optional)"
                />
                <button
                  type="button"
                  className="tc-remove"
                  onClick={() => removeCase(i)}
                  disabled={cases.length === 1}
                  title="Remove test case"
                >
                  ✕
                </button>
              </div>
              <div className="form-row two-col">
                <div className="form-field">
                  <label className="tc-sublabel">call</label>
                  <input
                    type="text"
                    className="code-input"
                    value={c.call}
                    onChange={setCase(i, "call")}
                    placeholder="sum([1,2,3])"
                    spellCheck={false}
                  />
                </div>
                <div className="form-field">
                  <label className="tc-sublabel">expect</label>
                  <input
                    type="text"
                    className="code-input"
                    value={c.expect}
                    onChange={setCase(i, "expect")}
                    placeholder="6"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="chip tc-add" onClick={addCase}>
          + Add test case
        </button>
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
        </div>
        <div className="form-field">
          <label>Tags <span className="form-optional">(comma-separated, optional)</span></label>
          <input
            type="text"
            value={form.tags}
            onChange={set("tags")}
            placeholder="closures, timers, higher-order"
          />
        </div>
      </div>

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
