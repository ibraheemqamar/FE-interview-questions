import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuestions } from "../contexts/QuestionsContext.jsx";
import { useProgress } from "../contexts/ProgressContext.jsx";
import { listCompanies } from "../lib/paths.js";
import TopBar from "../components/TopBar.jsx";

// /paths — pick a company to study a curated path of its real questions.
export default function PathsPage() {
  const { questions: CARDS, loading } = useQuestions();
  const { progress } = useProgress();

  const companies = useMemo(() => listCompanies(CARDS), [CARDS]);

  return (
    <div className="wrap page-wrap">
      <TopBar />
      <div className="page-header">
        <h1 className="page-title">Company study paths</h1>
        <p className="page-sub">
          Drill the questions really asked at a company — its tagged questions
          first, padded with high-signal questions in the same topics.
        </p>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : companies.length === 0 ? (
        <div className="empty-state">
          No company-tagged questions yet. Add a company when you submit or edit a
          question, then a path will appear here.
        </div>
      ) : (
        <div className="paths-grid">
          {companies.map(({ company, count }) => {
            const own = CARDS.filter((c) => c.company === company);
            const mastered = own.filter((c) => progress[c.id]?.status === "known").length;
            const pct = count > 0 ? Math.round((mastered / count) * 100) : 0;
            return (
              <Link
                key={company}
                to={`/paths/${encodeURIComponent(company)}`}
                className="path-card"
              >
                <div className="path-card-head">
                  <span className="path-card-name">🏢 {company}</span>
                  <span className="path-card-count">{count} Q</span>
                </div>
                <div className="path-card-bar">
                  <div className="path-card-fill" style={{ width: pct + "%" }} />
                </div>
                <div className="path-card-sub">
                  {mastered} / {count} mastered
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
