import { useMemo } from "react";
import { Link } from "react-router-dom";
import { CARDS } from "../data/cards.js";
import { CAT_ORDER, CAT_META } from "../data/categories.js";
import { useProgress } from "../contexts/ProgressContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { isDue } from "../lib/sm2.js";

export default function StatsPage() {
  const { progress, reset } = useProgress();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const entries = Object.entries(progress);
    const known   = entries.filter(([, v]) => v.status === "known").length;
    const review  = entries.filter(([, v]) => v.status === "review").length;
    const studied  = entries.length;

    // Cards due for review today (spaced repetition)
    const dueCount = entries.filter(([, v]) => isDue(v)).length;

    // By category (static cards only)
    const byCat = {};
    CAT_ORDER.forEach((cat) => {
      const catCards = CARDS.filter((c) => c.cat === cat);
      const catEntries = catCards.map((c) => progress[c.id]).filter(Boolean);
      byCat[cat] = {
        total:  catCards.length,
        known:  catEntries.filter((v) => v.status === "known").length,
        review: catEntries.filter((v) => v.status === "review").length,
      };
    });

    return { known, review, studied, dueCount, byCat };
  }, [progress]);

  const totalStatic = CARDS.length;
  const pctDone = totalStatic > 0 ? Math.round((stats.studied / totalStatic) * 100) : 0;

  return (
    <div className="wrap page-wrap">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to deck</Link>
        <h1 className="page-title">Your Stats</h1>
        <p className="page-sub">
          {user ? `Progress synced to cloud for ${user.email}.` : "Progress saved locally. Sign in to sync across devices."}
        </p>
      </div>

      {/* Summary grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.studied}</div>
          <div className="stat-label">Cards studied</div>
          <div className="stat-sub">of {totalStatic} total</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-value">{stats.known}</div>
          <div className="stat-label">Got it ✓</div>
          <div className="stat-sub">mastered</div>
        </div>
        <div className="stat-card stat-card--yellow">
          <div className="stat-value">{stats.review}</div>
          <div className="stat-label">Review again ↻</div>
          <div className="stat-sub">still learning</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-value">{stats.dueCount}</div>
          <div className="stat-label">Due for review</div>
          <div className="stat-sub">spaced repetition</div>
        </div>
      </div>

      {/* Overall progress bar */}
      <div style={{ margin: "28px 0 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: ".78rem", color: "var(--text-dim)" }}>
            Overall completion
          </span>
          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: ".78rem", color: "var(--text)" }}>
            {pctDone}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: pctDone + "%" }} />
        </div>
      </div>

      {/* Per-category breakdown */}
      <h2 className="section-title">By topic</h2>
      <div className="cat-stats-list">
        {CAT_ORDER.map((cat) => {
          const d = stats.byCat[cat];
          const pct = d.total > 0 ? Math.round((d.known / d.total) * 100) : 0;
          const accent = CAT_META[cat].c;
          return (
            <div key={cat} className="cat-stat-row" style={{ "--accent": accent }}>
              <div className="cat-stat-label">
                <span className="dot" style={{ background: accent }} />
                {CAT_META[cat].label}
              </div>
              <div className="cat-stat-bar-wrap">
                <div className="cat-stat-bar">
                  <div
                    className="cat-stat-fill"
                    style={{ width: pct + "%", background: accent }}
                  />
                </div>
                <span className="cat-stat-nums">
                  <span style={{ color: "#35d0a0" }}>{d.known}</span>
                  {" / "}
                  <span style={{ color: "#fbbf24" }}>{d.review}</span>
                  {" / "}
                  {d.total}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "40px", textAlign: "center" }}>
        <button
          className="ghost"
          style={{ color: "#f87171", border: "1px solid #f8717140", borderRadius: "8px", padding: "8px 20px" }}
          onClick={() => {
            if (window.confirm("Reset all progress? This cannot be undone.")) reset();
          }}
        >
          Reset all progress
        </button>
      </div>
    </div>
  );
}
