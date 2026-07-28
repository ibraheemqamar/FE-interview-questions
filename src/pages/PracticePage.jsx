import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProblems } from "../contexts/ProblemsContext.jsx";
import { CAT_META, CAT_ORDER } from "../data/categories.js";
import TopBar from "../components/TopBar.jsx";

const DIFFICULTIES = [
  { id: "All", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

// /practice — the coding-problem list, filterable by category / difficulty /
// company / search (same filter vocabulary as the flashcard deck's Controls).
export default function PracticePage() {
  const { problems, loading, error } = useProblems();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [diff, setDiff] = useState("All");
  const [company, setCompany] = useState("All");

  const companies = useMemo(
    () => [...new Set(problems.map((p) => p.company).filter(Boolean))].sort(),
    [problems]
  );

  const counts = useMemo(() => {
    const c = {};
    CAT_ORDER.forEach((cat) => (c[cat] = problems.filter((p) => p.category === cat).length));
    return c;
  }, [problems]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (activeCat !== "All" && p.category !== activeCat) return false;
      if (diff !== "All" && p.difficulty !== diff) return false;
      if (company !== "All" && p.company !== company) return false;
      if (q) {
        const hay = `${p.title} ${(p.tags || []).join(" ")} ${p.company || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [problems, query, activeCat, diff, company]);

  return (
    <div className="wrap page-wrap">
      <TopBar />
      <div className="page-header">
        <h1 className="page-title">Practice</h1>
        <p className="page-sub">
          Live coding problems — write a solution in the editor, run it against the
          tests, and get AI hints. Runs entirely in your browser.
        </p>
      </div>

      {error && !problems.length ? (
        <div className="empty-state">Couldn’t load problems. Check your connection and retry.</div>
      ) : (
        <>
          <div className="filters">
            <div className="control-row">
              <input
                className="search"
                type="text"
                placeholder="Search problems, tags…"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select className="company-select" value={diff} onChange={(e) => setDiff(e.target.value)} title="Filter by difficulty">
                {DIFFICULTIES.map((d) => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
              {companies.length > 0 && (
                <select className="company-select" value={company} onChange={(e) => setCompany(e.target.value)} title="Filter by company">
                  <option value="All">All companies</option>
                  {companies.map((co) => (
                    <option key={co} value={co}>{co}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="chips">
              <button
                className={"chip" + (activeCat === "All" ? " active" : "")}
                style={{ "--c": "#c7d2e0" }}
                onClick={() => setActiveCat("All")}
              >
                All <span style={{ opacity: 0.6 }}>{problems.length}</span>
              </button>
              {CAT_ORDER.filter((cat) => counts[cat] > 0).map((cat) => (
                <button
                  key={cat}
                  className={"chip" + (activeCat === cat ? " active" : "")}
                  style={{ "--c": CAT_META[cat].c }}
                  onClick={() => setActiveCat(cat)}
                >
                  <span className="dot" />
                  {CAT_META[cat].label} <span style={{ opacity: 0.6 }}>{counts[cat]}</span>
                </button>
              ))}
            </div>
          </div>

          {loading && !problems.length ? (
            <div className="empty-state">Loading problems…</div>
          ) : visible.length === 0 ? (
            <div className="empty-state">
              {problems.length === 0
                ? "No problems yet. An admin can add them from the Admin → Practice problems tab."
                : "No problems match these filters."}
            </div>
          ) : (
            <div className="practice-grid">
              {visible.map((p) => {
                const accent = (CAT_META[p.category] || {}).c || "#5b8def";
                return (
                  <Link key={p.id} to={`/practice/${encodeURIComponent(p.slug)}`} className="practice-card" style={{ "--accent": accent }}>
                    <div className="practice-card-meta">
                      <span className="b-cat" style={{ color: accent, borderColor: "currentColor" }}>{p.category}</span>
                      <span className={"diff-badge diff-badge--" + p.difficulty}>{p.difficulty}</span>
                      {p.company && <span className="company-badge company-badge--inline">{p.company}</span>}
                    </div>
                    <h3 className="practice-card-title">{p.title}</h3>
                    {p.tags?.length > 0 && (
                      <div className="tag-row">
                        {p.tags.slice(0, 4).map((t) => <span key={t} className="tag-pill">{t}</span>)}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
