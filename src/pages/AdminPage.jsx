import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useQuestions } from "../contexts/QuestionsContext.jsx";
import { CAT_META } from "../data/categories.js";
import { renderMD } from "../lib/markdown.js";
import {
  fetchAllSubmissions,
  createQuestion,
  updateQuestion,
  reviewQuestion,
  deleteQuestion,
} from "../lib/questions.js";
import QuestionForm from "../components/QuestionForm.jsx";
import TopBar from "../components/TopBar.jsx";

const STATUS_COLORS = {
  pending:  "#fbbf24",
  approved: "#35d0a0",
  rejected: "#f87171",
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const { upsertLocal, removeLocal } = useQuestions();
  const navigate = useNavigate();

  const [submissions, setSubmissions]  = useState([]);
  const [fetching, setFetching]        = useState(true);
  const [filter, setFilter]            = useState("pending");
  const [expanded, setExpanded]        = useState(null);
  const [adminNotes, setAdminNotes]    = useState({});
  const [acting, setActing]            = useState(null);

  // CRUD editor state: null = closed, "new" = creating, or a submission object = editing.
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);

  // Guard: redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading]);

  const fetchSubmissions = async () => {
    setFetching(true);
    try {
      setSubmissions(await fetchAllSubmissions());
    } catch (err) {
      toast.error("Failed to load: " + err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchSubmissions();
  }, [isAdmin]);

  // ---- approve / reject ----
  const act = async (id, status) => {
    setActing(id);
    try {
      const row = await reviewQuestion(id, status, adminNotes[id] || null);
      toast.success(status === "approved" ? "✓ Approved and live!" : "Rejected.");
      setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, ...row } : s)));
      setExpanded(null);
      // Keep the live deck in sync.
      if (status === "approved") upsertLocal(row);
      else removeLocal(id);
    } catch (err) {
      toast.error("Failed: " + err.message);
    } finally {
      setActing(null);
    }
  };

  // ---- create / edit ----
  const handleSave = async (form) => {
    if (!form.q.trim() || !form.a.trim()) {
      toast.error("Question and answer are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing === "new") {
        const row = await createQuestion(form, user);
        setSubmissions((prev) => [row, ...prev]);
        upsertLocal(row);
        toast.success("Question created and live!");
      } else {
        const row = await updateQuestion(editing.id, form);
        setSubmissions((prev) => prev.map((s) => (s.id === row.id ? { ...s, ...row } : s)));
        // Reflect edits in the deck (or drop it if it isn't approved).
        if (row.status === "approved" || editing.status === "approved") upsertLocal(row);
        toast.success("Saved!");
      }
      setEditing(null);
    } catch (err) {
      toast.error("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // ---- delete ----
  const handleDelete = async (s) => {
    if (!window.confirm(`Delete this question permanently?\n\n"${s.q}"`)) return;
    setActing(s.id);
    try {
      await deleteQuestion(s.id);
      setSubmissions((prev) => prev.filter((x) => x.id !== s.id));
      removeLocal(s.id);
      setExpanded(null);
      toast.success("Deleted.");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setActing(null);
    }
  };

  if (loading || (!isAdmin && user)) {
    return <div className="wrap page-wrap"><div className="empty-state">Checking access…</div></div>;
  }

  if (!user) return null; // useEffect will redirect

  const visible = filter === "all"
    ? submissions
    : submissions.filter((s) => s.status === filter);

  const counts = {
    pending:  submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  // ---- editor view ----
  if (editing) {
    return (
      <div className="wrap page-wrap">
        <TopBar />
        <div className="page-header">
          <button className="back-link" onClick={() => setEditing(null)}>← Back to admin</button>
          <h1 className="page-title">{editing === "new" ? "New question" : "Edit question"}</h1>
          <p className="page-sub">
            {editing === "new"
              ? "This goes live immediately (status: approved)."
              : "Editing an existing question."}
          </p>
        </div>
        <QuestionForm
          initial={editing === "new" ? {} : editing}
          onSubmit={handleSave}
          submitLabel={editing === "new" ? "Create question" : "Save changes"}
          onCancel={() => setEditing(null)}
          busy={saving}
        />
      </div>
    );
  }

  return (
    <div className="wrap page-wrap">
      <TopBar />
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Review submissions and manage the question bank.</p>
      </div>

      {/* Filter chips + New button */}
      <div className="chips" style={{ marginBottom: "20px", alignItems: "center" }}>
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            className={"chip" + (filter === s ? " active" : "")}
            style={{ "--c": STATUS_COLORS[s] || "#c7d2e0" }}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}{" "}
            <span style={{ opacity: 0.6 }}>{s !== "all" ? counts[s] ?? 0 : submissions.length}</span>
          </button>
        ))}
        <button className="submit-btn" style={{ marginLeft: "auto" }} onClick={() => setEditing("new")}>
          + New question
        </button>
      </div>

      {fetching && <div className="empty-state">Loading submissions…</div>}

      {!fetching && visible.length === 0 && (
        <div className="empty-state">No {filter} submissions.</div>
      )}

      <div className="admin-list">
        {visible.map((s) => {
          const isOpen  = expanded === s.id;
          const accent  = (CAT_META[s.cat] || {}).c || "#5b8def";
          return (
            <div key={s.id} className={"admin-card" + (isOpen ? " open" : "")} style={{ "--accent": accent }}>
              <div className="admin-card-head" onClick={() => setExpanded(isOpen ? null : s.id)}>
                <div className="admin-card-meta">
                  <span className="b-cat" style={{ color: accent, borderColor: "currentColor" }}>
                    {s.cat}
                  </span>
                  <span className="status-badge" style={{ color: STATUS_COLORS[s.status] }}>
                    ● {s.status}
                  </span>
                  <span className={"diff-badge diff-badge--" + s.difficulty}>{s.difficulty}</span>
                  {s.source === "core" && <span className="source-badge">core</span>}
                  {s.company && <span className="company-badge company-badge--inline">{s.company}</span>}
                </div>
                <p className="admin-card-q">{s.q}</p>
                <div className="admin-card-byline">
                  by {s.submitter_name || "Anonymous"} · {new Date(s.created_at).toLocaleDateString()}
                  {s.upvotes > 0 && <span> · ▲ {s.upvotes}</span>}
                </div>
              </div>

              {isOpen && (
                <div className="admin-card-body">
                  <div className="admin-section">
                    <div className="admin-section-label">Answer</div>
                    <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(s.a) }} />
                  </div>
                  {s.fq && (
                    <div className="admin-section">
                      <div className="admin-section-label">Follow-up Q</div>
                      <p style={{ margin: "4px 0", color: "var(--text-dim)" }}>{s.fq}</p>
                    </div>
                  )}
                  {s.fa && (
                    <div className="admin-section">
                      <div className="admin-section-label">Follow-up A</div>
                      <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(s.fa) }} />
                    </div>
                  )}
                  {s.tags?.length > 0 && (
                    <div className="tag-row">
                      {s.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
                    </div>
                  )}
                  {s.submitter_email && (
                    <p className="admin-section-label" style={{ marginTop: "12px" }}>
                      Email: {s.submitter_email}
                    </p>
                  )}

                  {s.status === "pending" && (
                    <div className="admin-actions">
                      <textarea
                        className="admin-notes-input"
                        placeholder="Admin notes (optional, shown to submitter on rejection)…"
                        value={adminNotes[s.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({ ...prev, [s.id]: e.target.value }))
                        }
                        rows={2}
                      />
                      <div className="admin-btns">
                        <button
                          className="admin-btn approve"
                          disabled={acting === s.id}
                          onClick={() => act(s.id, "approved")}
                        >
                          {acting === s.id ? "…" : "✓ Approve"}
                        </button>
                        <button
                          className="admin-btn reject"
                          disabled={acting === s.id}
                          onClick={() => act(s.id, "rejected")}
                        >
                          {acting === s.id ? "…" : "✗ Reject"}
                        </button>
                      </div>
                    </div>
                  )}

                  {s.status !== "pending" && s.admin_notes && (
                    <div className="admin-section" style={{ marginTop: "12px" }}>
                      <div className="admin-section-label">Admin notes</div>
                      <p style={{ margin: "4px 0", color: "var(--text-dim)", fontStyle: "italic" }}>
                        {s.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Edit / delete available on every question */}
                  <div className="admin-btns" style={{ marginTop: "14px" }}>
                    <button className="admin-btn edit" onClick={() => setEditing(s)}>
                      ✎ Edit
                    </button>
                    <button
                      className="admin-btn delete"
                      disabled={acting === s.id}
                      onClick={() => handleDelete(s)}
                    >
                      {acting === s.id ? "…" : "🗑 Delete"}
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
