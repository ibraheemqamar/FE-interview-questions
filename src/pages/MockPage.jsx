import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQuestions } from "../contexts/QuestionsContext.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { CAT_ORDER, CAT_META } from "../data/categories.js";
import { renderMD } from "../lib/markdown.js";
import { listCompanies } from "../lib/paths.js";
import { gradeAnswer } from "../lib/ai.js";
import TopBar from "../components/TopBar.jsx";

const COUNTS = [5, 10, 15];
const TIMES = [60, 90, 120, 180];
const DIFFS = ["All", "beginner", "intermediate", "advanced"];

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scoreColor(s) {
  return s >= 4 ? "#35d0a0" : s >= 2 ? "#fbbf24" : "#f87171";
}

// P2.2 — AI grade of one answer against the stored answer. `entry` is
// undefined | {status:'loading'} | {status:'error',error} | {status:'done',result}.
function GradePanel({ entry, onGrade }) {
  if (!entry) {
    return (
      <button className="ghost ai-grade-btn" onClick={onGrade}>
        ✨ Grade my answer with AI
      </button>
    );
  }
  if (entry.status === "loading") {
    return (
      <div className="ai-grade ai-grade--loading">
        <span className="ai-dot" /><span className="ai-dot" /><span className="ai-dot" /> Grading…
      </div>
    );
  }
  if (entry.status === "error") {
    return (
      <div className="ai-grade-error">
        {entry.error} <button className="linklike" onClick={onGrade}>Retry</button>
      </div>
    );
  }
  const r = entry.result;
  return (
    <div className="ai-grade">
      <div className="ai-grade-head">
        <span className="ai-grade-score" style={{ color: scoreColor(r.score) }}>{r.score}/5</span>
        <span className="ai-grade-verdict">{r.verdict}</span>
      </div>
      {r.strengths?.length > 0 && (
        <div className="ai-grade-sec">
          <div className="ai-grade-label">Strengths</div>
          <ul>{r.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {r.gaps?.length > 0 && (
        <div className="ai-grade-sec">
          <div className="ai-grade-label">Gaps</div>
          <ul>{r.gaps.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {r.followUp && (
        <div className="ai-grade-followup">
          <span className="ai-grade-label">Follow-up</span> {r.followUp}
        </div>
      )}
    </div>
  );
}

// /mock — a timed, sequential mock-interview simulation. Type your answer under
// a countdown, self-compare against the stored answer, then optionally have
// Claude grade it (grounded in the stored answer) — P2.2.
export default function MockPage() {
  const { questions: CARDS } = useQuestions();
  const { user } = useAuth();
  const companies = useMemo(() => listCompanies(CARDS), [CARDS]);

  const [phase, setPhase] = useState("setup"); // setup | running | done
  const [cat, setCat] = useState("All");
  const [company, setCompany] = useState("All");
  const [diff, setDiff] = useState("All");
  const [count, setCount] = useState(5);
  const [spq, setSpq] = useState(90);

  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // idx -> text
  const [grades, setGrades] = useState({}); // idx -> {status, result|error}
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const textRef = useRef(null);

  const grade = async (i) => {
    setGrades((g) => ({ ...g, [i]: { status: "loading" } }));
    try {
      const result = await gradeAnswer(questions[i].id, answers[i] || "");
      setGrades((g) => ({ ...g, [i]: { status: "done", result } }));
    } catch (err) {
      setGrades((g) => ({ ...g, [i]: { status: "error", error: err.message } }));
    }
  };

  const pool = useMemo(
    () =>
      CARDS.filter(
        (c) =>
          (cat === "All" || c.cat === cat) &&
          (company === "All" || c.company === company) &&
          (diff === "All" || c.difficulty === diff)
      ),
    [CARDS, cat, company, diff]
  );

  // Countdown: ticks while a question is unanswered; auto-reveals at zero.
  useEffect(() => {
    if (phase !== "running" || revealed) return;
    if (timeLeft <= 0) { setRevealed(true); return; }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, revealed, timeLeft]);

  // Focus the answer box when a fresh question appears.
  useEffect(() => {
    if (phase === "running" && !revealed) textRef.current?.focus();
  }, [idx, phase, revealed]);

  const start = () => {
    if (pool.length === 0) {
      toast.error("No questions match those settings.");
      return;
    }
    setQuestions(shuffle(pool).slice(0, Math.min(count, pool.length)));
    setIdx(0);
    setAnswers({});
    setGrades({});
    setRevealed(false);
    setTimeLeft(spq);
    setPhase("running");
  };

  const nextQ = () => {
    if (idx >= questions.length - 1) {
      setPhase("done");
    } else {
      setIdx((i) => i + 1);
      setRevealed(false);
      setTimeLeft(spq);
    }
  };

  const exportMarkdown = () => {
    const lines = [`# Mock interview transcript`, ""];
    questions.forEach((q, i) => {
      lines.push(`## Q${i + 1} · ${q.cat}${q.difficulty ? ` · ${q.difficulty}` : ""}${q.company ? ` · asked at ${q.company}` : ""}`);
      lines.push("", `**Question:** ${q.q}`, "");
      lines.push(`**Your answer:**`, "", (answers[i] || "_(left blank)_"), "");
      lines.push(`**Model answer:**`, "", q.a, "");
      if (q.fq) lines.push(`**Follow-up:** ${q.fq}`, "");
      if (q.fa) lines.push(q.fa, "");
      lines.push("---", "");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mock-interview-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Transcript exported.");
  };

  const current = questions[idx];

  return (
    <div className="wrap page-wrap">
      <TopBar />
      <div className="page-header">
        <h1 className="page-title">Mock interview</h1>
        <p className="page-sub">
          A timed, sequential round. Type your answer under the clock, then
          compare against the model answer. Nothing is graded — it’s practice.
        </p>
      </div>

      {phase === "setup" && (
        <div className="mock-setup">
          <div className="mock-field">
            <label>Topic</label>
            <select className="company-select" value={cat} onChange={(e) => setCat(e.target.value)}>
              <option value="All">All topics</option>
              {CAT_ORDER.map((c) => (
                <option key={c} value={c}>{CAT_META[c].label}</option>
              ))}
            </select>
          </div>
          <div className="mock-field">
            <label>Company</label>
            <select className="company-select" value={company} onChange={(e) => setCompany(e.target.value)}>
              <option value="All">Any company</option>
              {companies.map(({ company: co }) => (
                <option key={co} value={co}>{co}</option>
              ))}
            </select>
          </div>
          <div className="mock-field">
            <label>Difficulty</label>
            <div className="diff-toggle">
              {DIFFS.map((d) => (
                <button key={d} className={diff === d ? "active" : ""} onClick={() => setDiff(d)}>
                  {d === "All" ? "All" : d}
                </button>
              ))}
            </div>
          </div>
          <div className="mock-field">
            <label>Questions</label>
            <div className="cram-size-btns">
              {COUNTS.map((n) => (
                <button key={n} className={"cram-size" + (count === n ? " active" : "")} onClick={() => setCount(n)}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="mock-field">
            <label>Seconds / question</label>
            <div className="cram-size-btns">
              {TIMES.map((t) => (
                <button key={t} className={"cram-size" + (spq === t ? " active" : "")} onClick={() => setSpq(t)}>
                  {t}s
                </button>
              ))}
            </div>
          </div>
          <div className="mock-start-row">
            <button className="cram-start" onClick={start}>
              Start round · {Math.min(count, pool.length)} questions
            </button>
            <span className="cram-avail">{pool.length} match your settings</span>
          </div>
        </div>
      )}

      {phase === "running" && current && (
        <div className="mock-run">
          <div className="mock-run-head">
            <span className="counter"><b>{idx + 1}</b> / {questions.length}</span>
            <span className={"mock-timer" + (timeLeft <= 10 && !revealed ? " urgent" : "")}>
              ⏱ {revealed ? "time up" : fmt(timeLeft)}
            </span>
          </div>

          <article className="card" style={{ "--accent": (CAT_META[current.cat] || {}).c || "#5b8def" }}>
            <span className="card-cat"><span className="dot" />{(CAT_META[current.cat] || { label: current.cat }).label}</span>
            <h2 className="card-q">{current.q}</h2>
            {current.company && <div className="company-badge">asked at {current.company}</div>}

            <textarea
              ref={textRef}
              className="mock-answer"
              placeholder="Type your answer…"
              value={answers[idx] || ""}
              onChange={(e) => setAnswers((a) => ({ ...a, [idx]: e.target.value }))}
            />

            {revealed && (
              <div className="mock-model">
                <div className="followup-label">Model answer</div>
                <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(current.a) }} />
                {(current.fq || current.fa) && (
                  <div className="followup">
                    <div className="followup-label">Tricky follow-up</div>
                    {current.fq && <p className="followup-q">{current.fq}</p>}
                    {current.fa && <div className="answer fa" dangerouslySetInnerHTML={{ __html: renderMD(current.fa) }} />}
                  </div>
                )}
              </div>
            )}
            {revealed && (
              user ? (
                <div className="mock-grade">
                  <GradePanel entry={grades[idx]} onGrade={() => grade(idx)} />
                </div>
              ) : (
                <div className="ai-tutor ai-tutor--locked" style={{ marginTop: "1rem" }}>
                  <span className="ai-tutor-hint">Sign in to have Claude grade your answer.</span>
                </div>
              )
            )}
          </article>

          <div className="quiz-controls">
            {!revealed ? (
              <button className="nav" onClick={() => setRevealed(true)}>Reveal answer</button>
            ) : (
              <span className="mock-hint">Compare your answer, then continue.</span>
            )}
            <button className="mark got" onClick={nextQ}>
              {idx >= questions.length - 1 ? "Finish →" : "Next question →"}
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <div className="mock-transcript">
          <div className="mock-transcript-head">
            <h2 className="section-title" style={{ margin: 0 }}>Transcript</h2>
            <div className="path-actions" style={{ margin: 0 }}>
              <button className="ghost backup-btn" onClick={exportMarkdown}>⭳ Export as Markdown</button>
              <button className="ghost backup-btn" onClick={() => setPhase("setup")}>New round</button>
            </div>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} className="tr-item">
              <div className="tr-q">
                <span className="tr-num">Q{i + 1}</span>
                <span className="tr-cat" style={{ color: (CAT_META[q.cat] || {}).c }}>
                  {(CAT_META[q.cat] || { label: q.cat }).label}
                </span>
                {q.q}
              </div>
              <div className="tr-cols">
                <div className="tr-col">
                  <div className="tr-col-label">Your answer</div>
                  <div className="tr-yours">{answers[i] || <em>(left blank)</em>}</div>
                </div>
                <div className="tr-col">
                  <div className="tr-col-label">Model answer</div>
                  <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(q.a) }} />
                </div>
              </div>
              {user && (
                <div className="mock-grade">
                  <GradePanel entry={grades[i]} onGrade={() => grade(i)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
