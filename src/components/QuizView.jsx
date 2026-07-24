import Flashcard from "./Flashcard.jsx";
import { CAT_META } from "../data/categories.js";

// Quiz mode: counter, the current flashcard (or empty state), mark/nav controls,
// and secondary shuffle/reset + keyboard hints.
export default function QuizView({
  deck,
  pos,
  card,
  activeCat,
  curStatus,
  revealed,
  followupRevealed,
  onReveal,
  onRevealFollowup,
  onPrev,
  onNext,
  onMarkGot,
  onMarkReview,
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

      <div className="quiz-controls">
        <button className="nav" onClick={onPrev} disabled={empty || pos === 0}>
          ← Prev
        </button>
        <button
          className={"mark review" + (curStatus === "review" ? " on" : "")}
          onClick={onMarkReview}
          disabled={empty}
        >
          Review again
        </button>
        <button className={"mark got" + (curStatus === "known" ? " on" : "")} onClick={onMarkGot} disabled={empty}>
          Got it ✓
        </button>
        <button className="nav" onClick={onNext} disabled={empty || pos >= deck.length - 1}>
          Next →
        </button>
      </div>

      <div className="secondary-controls">
        <button className="ghost" onClick={onShuffle}>
          ⤮ Shuffle deck
        </button>
        <button className="ghost" onClick={onReset}>
          Reset progress
        </button>
        <span className="kbd-hint">
          <kbd>R</kbd> reveal · <kbd>F</kbd> follow-up · <kbd>←</kbd>
          <kbd>→</kbd> nav · <kbd>1</kbd> got it · <kbd>2</kbd> review · <kbd>S</kbd> shuffle
        </span>
      </div>
    </main>
  );
}
