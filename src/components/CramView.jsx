import { useEffect, useRef, useState } from "react";
import Flashcard from "./Flashcard.jsx";
import { isDue, GRADES, GRADE_META } from "../lib/sm2.js";

const SIZES = [10, 20, 40];

// Build a prioritised cram session from a pool of card indices:
//  (1) cards due today per SM-2, then
//  (2) cards previously marked "Review again", then
//  (3) least-recently-seen / never-seen cards,
// with a random tiebreak. Returns up to `size` indices into allCards.
function buildSession(pool, allCards, progress, size) {
  const scored = pool.map((idx) => {
    const p = progress[allCards[idx].id];
    let bucket;
    if (p && p.repetitions > 0 && isDue(p)) bucket = 0;   // due review
    else if (p?.status === "review") bucket = 1;          // marked "review again"
    else bucket = 2;                                       // least-recently-seen / new
    // Never-seen cards get seenAt=0 so they sort ahead of anything reviewed.
    const seenAt = p?.lastReviewed ? new Date(p.lastReviewed).getTime() : 0;
    return { idx, bucket, seenAt, rand: Math.random() };
  });
  scored.sort((a, b) => a.bucket - b.bucket || a.seenAt - b.seenAt || a.rand - b.rand);
  return scored.slice(0, size).map((s) => s.idx);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Cram mode: a focused, timed study session built from the currently-filtered
// deck. Setup → active session → summary. Grades feed the real SM-2 progress.
export default function CramView({ pool, allCards, progress, onGrade }) {
  const [phase, setPhase]       = useState("setup"); // setup | active | summary
  const [size, setSize]         = useState(20);
  const [session, setSession]   = useState([]);      // indices into allCards
  const [pos, setPos]           = useState(0);
  const [results, setResults]   = useState({});      // cardId -> grade name
  const [revealed, setRevealed] = useState(false);
  const [fRevealed, setFRevealed] = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const startRef = useRef(0);

  const maxAvail = pool.length;

  // Timer ticks only while a session is active.
  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(
      () => setElapsed(Math.round((Date.now() - startRef.current) / 1000)),
      1000
    );
    return () => clearInterval(id);
  }, [phase]);

  const start = (indices) => {
    if (!indices.length) return;
    setSession(indices);
    setPos(0);
    setResults({});
    setRevealed(false);
    setFRevealed(false);
    startRef.current = Date.now();
    setElapsed(0);
    setPhase("active");
  };

  const beginSession = (n) =>
    start(buildSession(pool, allCards, progress, Math.min(n, maxAvail)));

  const card = phase === "active" ? allCards[session[pos]] : null;

  const finish = () => {
    setElapsed(Math.round((Date.now() - startRef.current) / 1000));
    setPhase("summary");
  };

  const grade = (g) => {
    if (!card) return;
    onGrade(card.id, g);
    setResults((r) => ({ ...r, [card.id]: g }));
    if (pos >= session.length - 1) {
      finish();
    } else {
      setPos((p) => p + 1);
      setRevealed(false);
      setFRevealed(false);
    }
  };

  // ---- keyboard shortcuts (active session only) ----
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    if (phase !== "active") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    switch (e.key) {
      case "r": case "R":
        if (!revealed) setRevealed(true);
        else if (!fRevealed) setFRevealed(true);
        break;
      case "f": case "F":
        setRevealed(true); setFRevealed(true); break;
      case "1": grade("again"); break;
      case "2": grade("hard");  break;
      case "3": grade("good");  break;
      case "4": grade("easy");  break;
      default: break;
    }
  };
  useEffect(() => {
    const handler = (e) => keyRef.current?.(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ---- setup ----
  if (phase === "setup") {
    return (
      <main>
        <div className="cram-setup">
          <h2 className="cram-setup-title">Quick review</h2>
          <p className="cram-setup-sub">
            A focused, timed run through your due reviews, questions you flagged,
            and the ones you’ve seen least — drawn from your current filters.
          </p>
          {maxAvail === 0 ? (
            <div className="empty-state">
              No questions match your filters. Adjust them to start a quick review.
            </div>
          ) : (
            <>
              <div className="cram-size-label">How many questions?</div>
              <div className="cram-size-btns">
                {SIZES.map((n) => (
                  <button
                    key={n}
                    className={"cram-size" + (size === n ? " active" : "")}
                    onClick={() => setSize(n)}
                  >
                    {n > maxAvail ? `${maxAvail} (all)` : n}
                  </button>
                ))}
              </div>
              <button className="cram-start" onClick={() => beginSession(size)}>
                Start · {Math.min(size, maxAvail)} questions
              </button>
              <div className="cram-avail">{maxAvail} questions available</div>
            </>
          )}
        </div>
      </main>
    );
  }

  // ---- summary ----
  if (phase === "summary") {
    const graded = Object.values(results);
    const got = graded.filter((g) => GRADE_META[g]?.status === "known").length;
    const rev = graded.filter((g) => GRADE_META[g]?.status === "review").length;
    const total = got + rev;
    const accuracy = total ? Math.round((got / total) * 100) : 0;
    const missed = session.filter((i) => GRADE_META[results[allCards[i].id]]?.status === "review");

    return (
      <main>
        <div className="cram-summary">
          <h2 className="cram-setup-title">Review complete</h2>
          <div className="cram-stats">
            <div className="cram-stat">
              <div className="cram-stat-num" style={{ color: "#35d0a0" }}>{got}</div>
              <div className="cram-stat-label">Got it</div>
            </div>
            <div className="cram-stat">
              <div className="cram-stat-num" style={{ color: "#fbbf24" }}>{rev}</div>
              <div className="cram-stat-label">To review</div>
            </div>
            <div className="cram-stat">
              <div className="cram-stat-num">{accuracy}%</div>
              <div className="cram-stat-label">Accuracy</div>
            </div>
            <div className="cram-stat">
              <div className="cram-stat-num">{fmtTime(elapsed)}</div>
              <div className="cram-stat-label">Time</div>
            </div>
          </div>
          <div className="cram-summary-actions">
            {missed.length > 0 && (
              <button className="cram-start" onClick={() => start(missed)}>
                Restart with the {missed.length} I missed
              </button>
            )}
            <button className="ghost" onClick={() => setPhase("setup")}>
              New review
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---- active ----
  const curGrade = results[card.id];
  return (
    <main>
      <div className="cram-header">
        <div className="counter">
          <b>{pos + 1}</b> / {session.length}
        </div>
        <div className="cram-timer">⏱ {fmtTime(elapsed)}</div>
      </div>

      <Flashcard
        card={card}
        revealed={revealed}
        followupRevealed={fRevealed}
        onReveal={() => setRevealed(true)}
        onRevealFollowup={() => setFRevealed(true)}
      />

      <div className="grade-controls">
        {GRADES.map((g) => (
          <button
            key={g}
            className={"grade grade--" + g + (curGrade === g ? " on" : "")}
            style={{ "--g": GRADE_META[g].color }}
            onClick={() => grade(g)}
          >
            {GRADE_META[g].label} <kbd>{GRADE_META[g].key}</kbd>
          </button>
        ))}
      </div>

      <div className="secondary-controls">
        <button className="ghost" onClick={finish}>
          End early
        </button>
        <span className="kbd-hint">
          <kbd>R</kbd> reveal · <kbd>F</kbd> follow-up · <kbd>1</kbd> again ·{" "}
          <kbd>2</kbd> hard · <kbd>3</kbd> good · <kbd>4</kbd> easy
        </span>
      </div>
    </main>
  );
}
