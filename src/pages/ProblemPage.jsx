import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext.jsx";
import { fetchProblem, fetchAttempt, saveAttempt, fetchSolution } from "../lib/problems.js";
import { runInSandbox } from "../lib/sandbox.js";
import { renderMD } from "../lib/markdown.js";
import { CAT_META } from "../data/categories.js";
import TopBar from "../components/TopBar.jsx";
import RunResults from "../components/RunResults.jsx";
import ProblemAssist from "../components/ProblemAssist.jsx";

// CodeMirror is heavy — lazy-split so it never lands in the main/PWA bundle.
const CodeEditor = lazy(() => import("../components/CodeEditor.jsx"));

export default function ProblemPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [problem, setProblem] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [code, setCode] = useState("");
  const [run, setRun] = useState(null); // null | {running} | resolved result
  const [attemptStatus, setAttemptStatus] = useState(null);
  const [running, setRunning] = useState(false);

  const [solution, setSolution] = useState(null);
  const [revealing, setRevealing] = useState(false);

  // Load problem detail, then (if signed in) the user's saved attempt.
  useEffect(() => {
    let alive = true;
    setLoadState("loading");
    setProblem(null);
    setRun(null);
    setSolution(null);
    (async () => {
      try {
        const p = await fetchProblem(slug);
        if (!alive) return;
        setProblem(p);
        let restored = null;
        if (user) {
          try {
            const a = await fetchAttempt(p.id);
            if (a) restored = a;
          } catch { /* attempt is best-effort */ }
        }
        if (!alive) return;
        setCode(restored?.code ?? p.starter_code ?? "");
        setAttemptStatus(restored?.status ?? null);
        setLoadState("ready");
      } catch (e) {
        if (!alive) return;
        setLoadState("error");
        toast.error(e.message || "Could not load this problem.");
      }
    })();
    return () => { alive = false; };
  }, [slug, user]);

  const persist = useCallback(
    (status, res) => {
      if (!user || !problem) return;
      const pass = res?.results?.filter((r) => r.pass).length ?? 0;
      const total = res?.results?.length ?? 0;
      saveAttempt(problem.id, {
        code,
        status,
        last_run_pass_count: pass,
        last_run_total_count: total,
        bumpAttempt: !!res,
      })
        .then((row) => setAttemptStatus(row.status))
        .catch(() => { /* non-blocking */ });
    },
    [user, problem, code]
  );

  const doRun = useCallback(async () => {
    if (!problem || running) return;
    setRunning(true);
    setRun({ running: true });
    const res = await runInSandbox(code, problem.test_cases || []);
    setRun(res);
    setRunning(false);

    const total = res.results.length;
    const passed = res.results.filter((r) => r.pass).length;
    const allPass = !res.timedOut && !res.error && total > 0 && passed === total;
    const wasSolved = attemptStatus === "solved";
    const nextStatus = allPass ? "solved" : attemptStatus === "given_up" ? "given_up" : attemptStatus === "solved" ? "solved" : "in_progress";
    persist(nextStatus, res);
    if (allPass && !wasSolved) toast.success("Solved — all tests passing! 🎉");
  }, [problem, code, running, attemptStatus, persist]);

  const resetToStarter = () => {
    if (!problem) return;
    setCode(problem.starter_code ?? "");
    setRun(null);
  };

  const revealSolution = async () => {
    if (!user) {
      toast.error("Sign in to see the reference solution.");
      return;
    }
    if (solution !== null) return;
    // Not solved/given up yet → confirm giving up.
    if (attemptStatus !== "solved" && attemptStatus !== "given_up") {
      if (!window.confirm("Reveal the reference solution? This marks the problem as given up.")) return;
      await new Promise((resolve) => {
        if (!problem) return resolve();
        saveAttempt(problem.id, {
          code,
          status: "given_up",
          last_run_pass_count: run?.results?.filter((r) => r.pass).length ?? 0,
          last_run_total_count: run?.results?.length ?? 0,
        })
          .then((row) => setAttemptStatus(row.status))
          .catch(() => {})
          .finally(resolve);
      });
    }
    setRevealing(true);
    try {
      const { solution_code } = await fetchSolution(problem.id);
      if (!solution_code) {
        toast("No reference solution was provided for this problem.");
        setSolution("");
      } else {
        setSolution(solution_code);
      }
    } catch (e) {
      toast.error(e.message || "Could not load the solution.");
    } finally {
      setRevealing(false);
    }
  };

  const firstFailing = useMemo(
    () => (run && !run.running ? run.results?.find((r) => !r.pass) || null : null),
    [run]
  );

  if (loadState === "loading") {
    return (
      <div className="wrap page-wrap">
        <TopBar />
        <div className="empty-state">Loading problem…</div>
      </div>
    );
  }
  if (loadState === "error" || !problem) {
    return (
      <div className="wrap page-wrap">
        <TopBar />
        <div className="page-header">
          <Link className="back-link" to="/practice">← Back to Practice</Link>
          <h1 className="page-title">Problem not found</h1>
        </div>
      </div>
    );
  }

  const accent = (CAT_META[problem.category] || {}).c || "#5b8def";

  return (
    <div className="wrap page-wrap">
      <TopBar />
      <div className="page-header">
        <Link className="back-link" to="/practice">← Back to Practice</Link>
        <div className="solve-title-row">
          <h1 className="page-title" style={{ margin: 0 }}>{problem.title}</h1>
          {attemptStatus === "solved" && <span className="solve-status solve-status--solved">✓ Solved</span>}
          {attemptStatus === "given_up" && <span className="solve-status solve-status--gaveup">Gave up</span>}
        </div>
        <div className="admin-card-meta" style={{ marginTop: "8px" }}>
          <span className="b-cat" style={{ color: accent, borderColor: "currentColor" }}>{problem.category}</span>
          <span className={"diff-badge diff-badge--" + problem.difficulty}>{problem.difficulty}</span>
          {problem.company && <span className="company-badge company-badge--inline">{problem.company}</span>}
        </div>
      </div>

      <div className="solve-layout">
        {/* Prompt */}
        <section className="solve-prompt">
          <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(problem.prompt_md || "") }} />
          {problem.tags?.length > 0 && (
            <div className="tag-row" style={{ marginTop: "14px" }}>
              {problem.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
            </div>
          )}
        </section>

        {/* Work area */}
        <section className="solve-work">
          <div className="solve-editor-bar">
            <span className="solve-editor-label">Your code</span>
            <div className="solve-editor-actions">
              <button className="chip" onClick={resetToStarter} title="Reset to starter code">↺ Reset</button>
              <button className="submit-btn solve-run-btn" onClick={doRun} disabled={running}>
                {running ? "Running…" : "▶ Run  ⌘/Ctrl+↵"}
              </button>
            </div>
          </div>

          <div className="code-editor-shell">
            <Suspense fallback={<div className="editor-loading">Loading editor…</div>}>
              <CodeEditor value={code} onChange={setCode} onRun={doRun} minHeight="280px" />
            </Suspense>
          </div>

          <RunResults run={run} />

          <ProblemAssist problemId={problem.id} code={code} failingTest={firstFailing} />

          {/* Solution reveal */}
          <div className="solve-solution">
            {solution === null ? (
              <button className="chip solve-reveal-btn" onClick={revealSolution} disabled={revealing}>
                {revealing ? "Loading…" : "👀 Reveal solution"}
              </button>
            ) : solution === "" ? (
              <div className="empty-state" style={{ marginTop: 0 }}>No reference solution provided.</div>
            ) : (
              <div className="solve-solution-body">
                <div className="admin-section-label">Reference solution</div>
                <div className="code-editor-shell">
                  <Suspense fallback={<div className="editor-loading">Loading…</div>}>
                    <CodeEditor value={solution} onChange={() => {}} readOnly minHeight="160px" />
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
