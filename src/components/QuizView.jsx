import Flashcard from "./Flashcard.jsx";
import { CAT_META } from "../data/categories.js";
import { GRADES, GRADE_META } from "../lib/sm2.js";

// Quiz mode: counter, the current flashcard (or empty state), 4-grade recall
// controls (Again/Hard/Good/Easy), nav, and secondary shuffle/reset + hints.
export default function QuizView({
  deck,
  pos,
  card,
  activeCat,
  curGrade,
  revealed,
  followupRevealed,
  onReveal,
  onRevealFollowup,
  onPrev,
  onNext,
  onGrade,
  onShuffle,
  onReset,
}) {
  const empty = deck.length === 0;

  return (
    <main>
      <div className="counter">
        {empty ? null : (
          <>
            <b>{pos + 1}</b> / {deck.length}
            {activeCat !== "All" ? " · " + CAT_META[activeCat].label : ""}
          </>
        )}
      </div>

      {empty ? (
        <article className="card">
          <div className="empty-state">
            No questions match your filters.
            <br />
            Try a different topic or clear the search.
          </div>
        </article>
      ) : (
        <Flashcard
          card={card}
          revealed={revealed}
          followupRevealed={followupRevealed}
          onReveal={onReveal}
          onRevealFollowup={onRevealFollowup}
        />
      )}

      <div className="grade-controls">
        {GRADES.map((g) => (
          <button
            key={g}
            className={"grade grade--" + g + (curGrade === g ? " on" : "")}
            style={{ "--g": GRADE_META[g].color }}
            onClick={() => onGrade(g)}
            disabled={empty}
          >
            {GRADE_META[g].label} <kbd>{GRADE_META[g].key}</kbd>
          </button>
        ))}
      </div>

      <div className="quiz-controls">
        <button className="nav" onClick={onPrev} disabled={empty || pos === 0}>
          ← Prev
        </button>
        <button className="nav" onClick={onNext} disabled={empty || pos >= deck.length - 1}>
          Next →
        </button>
      </div>

      <div className="secondary-controls">
        <button className="ghost" onClick={onShuffle}>
          ⤮ Shuffle
        </button>
        <button className="ghost" onClick={onReset}>
          Reset progress
        </button>
        <span className="kbd-hint">
          <kbd>R</kbd> reveal · <kbd>F</kbd> follow-up · <kbd>←</kbd>
          <kbd>→</kbd> nav · <kbd>1</kbd> again · <kbd>2</kbd> hard · <kbd>3</kbd> good ·{" "}
          <kbd>4</kbd> easy · <kbd>S</kbd> shuffle
        </span>
      </div>
    </main>
  );
}
