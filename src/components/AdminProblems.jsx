import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useProblems } from "../contexts/ProblemsContext.jsx";
import { CAT_META } from "../data/categories.js";
import { renderMD } from "../lib/markdown.js";
import {
  fetchAllProblems,
  createProblem,
  updateProblem,
  reviewProblem,
  deleteProblem,
} from "../lib/problems.js";
import ProblemForm from "./ProblemForm.jsx";

const STATUS_COLORS = {
  pending:  "#fbbf24",
  approved: "#35d0a0",
  rejected: "#f87171",
};

// Admin management for Practice coding problems. Same interaction model + CSS
// as the questions admin in AdminPage.jsx, bound to the problems API + ProblemForm.
export default function AdminProblems({ user }) {
  const { upsertLocal, removeLocal } = useProblems();

  const [problems, setProblems] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter]     = useState("approved");
  const [expanded, setExpanded] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [acting, setActing]     = useState(null);

  // null = list, "new" = creating, or a problem object = editing.
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);

  const load = async () => {
    setFetching(true);
    try {
      setProblems(await fetchAllProblems());
    } catch (err) {
      toast.error("Failed to load problems: " + err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id, status) => {
    setActing(id);
    try {
      const row = await reviewProblem(id, status, adminNotes[id] || null);
      toast.success(status === "approved" ? "✓ Approved and live!" : "Rejected.");
      setProblems((prev) => prev.map((p) => (p.id === id ? { ...p, ...row } : p)));
      setExpanded(null);
      if (status === "approved") upsertLocal(row);
      else removeLocal(id);
    } catch (err) {
      toast.error("Failed: " + err.message);
    } finally {
      setActing(null);
    }
  };

  const handleSave = async (formValues) => {
    if (!formValues.title.trim() || !formValues.prompt_md.trim()) {
      toast.error("Title and prompt are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        const row = await createProblem(formValues);
        setProblems((prev) => [row, ...prev]);
        upsertLocal(row);
        toast.success("Problem created and live!");
      } else {
        const row = await updateProblem(editing.id, formValues);
        setProblems((prev) => prev.map((p) => (p.id === row.id ? { ...p, ...row } : p)));
        upsertLocal(row);
        toast.success("Saved!");
      }
      setEditing(null);
    } catch (err) {
      toast.error("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete this problem permanently?\n\n"${p.title}"`)) return;
    setActing(p.id);
    try {
      await deleteProblem(p.id);
      setProblems((prev) => prev.filter((x) => x.id !== p.id));
      removeLocal(p.id);
      setExpanded(null);
      toast.success("Deleted.");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setActing(null);
    }
  };

  // ---- editor view ----
  if (editing) {
    return (
      <div>
        <div className="page-header">
          <button className="back-link" onClick={() => setEditing(null)}>← Back to problems</button>
          <h1 className="page-title">{editing === "new" ? "New problem" : "Edit problem"}</h1>
          <p className="page-sub">
            {editing === "new"
              ? "This goes live immediately (status: approved)."
              : "Editing an existing problem."}
          </p>
        </div>
        <ProblemForm
          initial={editing === "new" ? {} : editing}
          onSubmit={handleSave}
          submitLabel={editing === "new" ? "Create problem" : "Save changes"}
          onCancel={() => setEditing(null)}
          busy={saving}
        />
      </div>
    );
  }

  const visible = filter === "all" ? problems : problems.filter((p) => p.status === filter);
  const counts = {
    pending:  problems.filter((p) => p.status === "pending").length,
    approved: problems.filter((p) => p.status === "approved").length,
    rejected: problems.filter((p) => p.status === "rejected").length,
  };

  return (
    <div>
      <div className="chips" style={{ marginBottom: "20px", alignItems: "center" }}>
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            className={"chip" + (filter === s ? " active" : "")}
            style={{ "--c": STATUS_COLORS[s] || "#c7d2e0" }}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
            <span style={{ opacity: 0.6 }}>{s !== "all" ? counts[s] ?? 0 : problems.length}</span>
          </button>
        ))}
        <button className="submit-btn" style={{ marginLeft: "auto" }} onClick={() => setEditing("new")}>
          + New problem
        </button>
      </div>

      {fetching && <div className="empty-state">Loading problems…</div>}
      {!fetching && visible.length === 0 && (
        <div className="empty-state">No {filter} problems.</div>
      )}

      <div className="admin-list">
        {visible.map((p) => {
          const isOpen = expanded === p.id;
          const accent = (CAT_META[p.category] || {}).c || "#5b8def";
          return (
            <div key={p.id} className={"admin-card" + (isOpen ? " open" : "")} style={{ "--accent": accent }}>
              <div className="admin-card-head" onClick={() => setExpanded(isOpen ? null : p.id)}>
                <div className="admin-card-meta">
                  <span className="b-cat" style={{ color: accent, borderColor: "currentColor" }}>
                    {p.category}
                  </span>
                  <span className="status-badge" style={{ color: STATUS_COLORS[p.status] }}>
                    ● {p.status}
                  </span>
                  <span className={"diff-badge diff-badge--" + p.difficulty}>{p.difficulty}</span>
                  {p.source === "core" && <span className="source-badge">core</span>}
                  {p.company && <span className="company-badge company-badge--inline">{p.company}</span>}
                </div>
                <p className="admin-card-q">{p.title}</p>
                <div className="admin-card-byline">
                  <code>{p.slug}</code> · {(p.test_cases?.length ?? 0)} tests · {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>

              {isOpen && (
                <div className="admin-card-body">
                  <div className="admin-section">
                    <div className="admin-section-label">Prompt</div>
                    <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(p.prompt_md || "") }} />
                  </div>

                  {p.test_cases?.length > 0 && (
                    <div className="admin-section">
                      <div className="admin-section-label">Test cases</div>
                      <ul className="tc-preview">
                        {p.test_cases.map((tc, i) => (
                          <li key={i}>
                            <span className="tc-preview-name">{tc.name || `test ${i + 1}`}</span>
                            <code>{tc.call}</code> → <code>{tc.expect}</code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.tags?.length > 0 && (
                    <div className="tag-row">
                      {p.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
                    </div>
                  )}

                  {p.status === "pending" && (
                    <div className="admin-actions">
                      <textarea
                        className="admin-notes-input"
                        placeholder="Admin notes (optional)…"
                        value={adminNotes[p.id] || ""}
                        onChange={(e) => setAdminNotes((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        rows={2}
                      />
                      <div className="admin-btns">
                        <button className="admin-btn approve" disabled={acting === p.id} onClick={() => act(p.id, "approved")}>
                          {acting === p.id ? "…" : "✓ Approve"}
                        </button>
                        <button className="admin-btn reject" disabled={acting === p.id} onClick={() => act(p.id, "rejected")}>
                          {acting === p.id ? "…" : "✗ Reject"}
                        </button>
                      </div>
                    </div>
                  )}

                  {p.status !== "pending" && p.admin_notes && (
                    <div className="admin-section" style={{ marginTop: "12px" }}>
                      <div className="admin-section-label">Admin notes</div>
                      <p style={{ margin: "4px 0", color: "var(--text-dim)", fontStyle: "italic" }}>{p.admin_notes}</p>
                    </div>
                  )}

                  <div className="admin-btns" style={{ marginTop: "14px" }}>
                    <button className="admin-btn edit" onClick={() => setEditing(p)}>✎ Edit</button>
                    <button className="admin-btn delete" disabled={acting === p.id} onClick={() => handleDelete(p)}>
                      {acting === p.id ? "…" : "🗑 Delete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
