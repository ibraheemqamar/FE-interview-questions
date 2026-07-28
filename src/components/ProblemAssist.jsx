import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { streamAssist } from "../lib/ai.js";
import { renderMD } from "../lib/markdown.js";

// Practice AI coach. Streams a hint / review / explain-failure grounded
// server-side in the problem statement (and, for reasoning only, the reference
// solution). Mirrors AiTutor.jsx.
export default function ProblemAssist({ problemId, code, failingTest }) {
  const { user } = useAuth();
  const [mode, setMode] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  // Cancel any in-flight stream when the problem changes or on unmount.
  useEffect(() => () => abortRef.current?.abort(), []);
  useEffect(() => {
    abortRef.current?.abort();
    setMode(null);
    setText("");
    setError("");
    setLoading(false);
  }, [problemId]);

  const run = async (m) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setMode(m);
    setText("");
    setError("");
    setLoading(true);
    try {
      await streamAssist(
        problemId,
        { mode: m, code, failingTest: m === "explain-failure" ? failingTest : undefined },
        {
          signal: ctrl.signal,
          onText: (chunk) => setText((t) => t + chunk),
        }
      );
    } catch (err) {
      if (err?.name !== "AbortError") setError(err.message || "Something went wrong.");
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="ai-tutor ai-tutor--locked">
        <span className="ai-tutor-title">✨ AI coach</span>
        <span className="ai-tutor-hint">Sign in for hints, a code review, and failure explanations.</span>
      </div>
    );
  }

  return (
    <div className="ai-tutor">
      <div className="ai-tutor-bar">
        <span className="ai-tutor-title">✨ AI coach</span>
        <div className="ai-tutor-modes">
          <button className={"ai-mode" + (mode === "hint" ? " on" : "")} onClick={() => run("hint")} disabled={loading}>
            💡 Hint
          </button>
          <button className={"ai-mode" + (mode === "review" ? " on" : "")} onClick={() => run("review")} disabled={loading}>
            🔍 Review
          </button>
          <button
            className={"ai-mode" + (mode === "explain-failure" ? " on" : "")}
            onClick={() => run("explain-failure")}
            disabled={loading || !failingTest}
            title={failingTest ? "Explain the first failing test" : "Run your code and get a failing test first"}
          >
            🐞 Explain failure
          </button>
        </div>
      </div>

      {error && <div className="ai-tutor-error">{error}</div>}

      {(loading || text) && (
        <div className="ai-tutor-out">
          {text ? (
            <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(text) }} />
          ) : (
            <div className="ai-tutor-thinking">
              <span className="ai-dot" /> <span className="ai-dot" /> <span className="ai-dot" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
