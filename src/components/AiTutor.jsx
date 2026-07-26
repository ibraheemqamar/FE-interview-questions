import { useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { streamTutor } from "../lib/ai.js";
import { renderMD } from "../lib/markdown.js";

const MODES = [
  { key: "simpler", label: "Explain simpler", icon: "🧩" },
  { key: "deeper", label: "Go deeper", icon: "🔬" },
  { key: "example", label: "Show example", icon: "💻" },
  { key: "analogy", label: "Analogy", icon: "🎯" },
];

// P2.1 — AI tutor. Reframes the stored answer at a chosen angle, grounded
// server-side in the model answer. Streams tokens as they arrive.
export default function AiTutor({ card }) {
  const { user } = useAuth();
  const [mode, setMode] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  // Cancel any in-flight stream when the card changes or on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);
  useEffect(() => {
    abortRef.current?.abort();
    setMode(null);
    setText("");
    setError("");
    setLoading(false);
  }, [card.id]);

  const run = async (m) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setMode(m);
    setText("");
    setError("");
    setLoading(true);
    try {
      await streamTutor(card.id, m, {
        signal: ctrl.signal,
        onText: (chunk) => setText((t) => t + chunk),
      });
    } catch (err) {
      if (err?.name !== "AbortError") setError(err.message || "Something went wrong.");
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="ai-tutor ai-tutor--locked">
        <span className="ai-tutor-title">✨ AI tutor</span>
        <span className="ai-tutor-hint">Sign in to have Claude explain this answer another way.</span>
      </div>
    );
  }

  return (
    <div className="ai-tutor">
      <div className="ai-tutor-bar">
        <span className="ai-tutor-title">✨ AI tutor</span>
        <div className="ai-tutor-modes">
          {MODES.map((m) => (
            <button
              key={m.key}
              className={"ai-mode" + (mode === m.key ? " on" : "")}
              onClick={() => run(m.key)}
              disabled={loading}
            >
              {m.icon} {m.label}
            </button>
          ))}
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
