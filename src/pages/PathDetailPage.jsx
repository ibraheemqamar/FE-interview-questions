import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuestions } from "../contexts/QuestionsContext.jsx";
import { useProgress } from "../contexts/ProgressContext.jsx";
import { CAT_META } from "../data/categories.js";
import { buildPath } from "../lib/paths.js";
import TopBar from "../components/TopBar.jsx";

const DIFF_COLOR = { beginner: "#35d0a0", intermediate: "#fbbf24", advanced: "#f87171" };

// /paths/:company — the curated path for one company.
export default function PathDetailPage() {
  const { company: raw } = useParams();
  const company = decodeURIComponent(raw || "");
  const navigate = useNavigate();
  const { questions: CARDS, loading } = useQuestions();
  const { progress } = useProgress();

  const { cards, companyCount } = useMemo(
    () => buildPath(CARDS, company),
    [CARDS, company]
  );

  const mastered = cards.filter((c) => progress[c.id]?.status === "known").length;
  const pct = cards.length > 0 ? Math.round((mastered / cards.length) * 100) : 0;

  const startPath = (mode) =>
    navigate("/", {
      state: { seed: { ids: cards.map((c) => c.id), label: company, mode } },
    });

  return (
    <div className="wrap page-wrap">
      <TopBar />
      <div className="page-header">
        <Link to="/paths" className="back-link">← All companies</Link>
        <h1 className="page-title">🏢 {company}</h1>
        <p className="page-sub">
          {companyCount} question{companyCount === 1 ? "" : "s"} tagged {company}
          {cards.length > companyCount
            ? ` · topped up to ${cards.length} with related questions`
            : ""}
          .
        </p>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : cards.length === 0 ? (
        <div className="empty-state">No questions found for this company.</div>
      ) : (
        <>
          <div className="path-progress">
            <div className="path-progress-row">
              <span>{mastered} / {cards.length} mastered</span>
              <span>{pct}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: pct + "%" }} />
            </div>
          </div>

          <div className="path-actions">
            <button className="cram-start" onClick={() => startPath("quiz")}>
              ▶ Start studying
            </button>
            <button className="ghost backup-btn" onClick={() => startPath("cram")}>
              ⚡ Quick review
            </button>
          </div>

          <ol className="path-list">
            {cards.map((c, i) => {
              const status = progress[c.id]?.status;
              const isCompany = c.company === company;
              return (
                <li key={c.id} className="path-item">
                  <span className="path-item-num">{i + 1}</span>
                  <span
                    className="path-item-cat"
                    style={{ color: (CAT_META[c.cat] || {}).c || "#c7d2e0" }}
                  >
                    {(CAT_META[c.cat] || { label: c.cat }).label}
                  </span>
                  <span className="path-item-q">{c.q}</span>
                  {c.difficulty && (
                    <span
                      className="diff-dot"
                      style={{ background: DIFF_COLOR[c.difficulty] }}
                      title={c.difficulty}
                    />
                  )}
                  {isCompany && <span className="path-item-tag">asked here</span>}
                  {status === "known" && <span className="b-status known">✓</span>}
                  {status === "review" && <span className="b-status review">↻</span>}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
}
