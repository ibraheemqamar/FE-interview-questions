import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { CAT_META } from "../data/categories.js";
import { renderMD } from "../lib/markdown.js";

const STATUS_COLORS = {
  pending:  "#fbbf24",
  approved: "#35d0a0",
  rejected: "#f87171",
};

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions]  = useState([]);
  const [fetching, setFetching]        = useState(true);
  const [filter, setFilter]            = useState("pending");
  const [expanded, setExpanded]        = useState(null);
  const [adminNotes, setAdminNotes]    = useState({});
  const [acting, setActing]            = useState(null);

  // Guard: redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/");
  }, [user, isAdmin, loading]);

  const fetchSubmissions = async () => {
    if (!supabase) return;
    setFetching(true);
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setSubmissions(data || []);
    setFetching(false);
  };

  useEffect(() => {
    if (isAdmin) fetchSubmissions();
  }, [isAdmin]);

  const act = async (id, status) => {
    setActing(id);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("submissions")
      .update({
        status,
        admin_notes:  adminNotes[id] || null,
        reviewed_at:  now,
        reviewed_by:  user.id,
      })
      .eq("id", id);

    if (error) {
      toast.error("Failed: " + error.message);
    } else {
      toast.success(status === "approved" ? "✓ Approved and live!" : "Rejected.");
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status, admin_notes: adminNotes[id] || null } : s))
      );
      setExpanded(null);
    }
    setActing(null);
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

  return (
    <div className="wrap page-wrap">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to deck</Link>
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-sub">Review and approve community submissions.</p>
      </div>

      {/* Summary chips */}
      <div className="chips" style={{ marginBottom: "20px" }}>
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
                  <span
                    className="status-badge"
                    style={{ color: STATUS_COLORS[s.status] }}
                  >
                    ● {s.status}
                  </span>
                  <span className="diff-badge diff-badge--{s.difficulty}">{s.difficulty}</span>
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
