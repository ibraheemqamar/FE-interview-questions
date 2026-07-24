import { CAT_META } from "../data/categories.js";
import { renderMD } from "../lib/markdown.js";

function accentFor(cat) {
  return (CAT_META[cat] || {}).c || "#5b8def";
}

const DIFF_COLOR = { beginner: "#35d0a0", intermediate: "#fbbf24", advanced: "#f87171" };

// A single quiz flashcard: category badge, question, then progressively
// revealed answer and "tricky follow-up". Mirrors the original card markup.
export default function Flashcard({ card, revealed, followupRevealed, onReveal, onRevealFollowup }) {
  const accent = accentFor(card.cat);
  return (
    <article className="card" style={{ "--accent": accent }}>
      <div className="card-header-row">
        <span className="card-cat">
          <span className="dot"></span>
          {(CAT_META[card.cat] || { label: card.cat }).label}
        </span>
        <div className="card-badges">
          {card.difficulty && (
            <span
              className="diff-badge"
              style={{ color: DIFF_COLOR[card.difficulty], borderColor: DIFF_COLOR[card.difficulty] + "55" }}
            >
              {card.difficulty}
            </span>
          )}
          {card.community && <span className="community-badge">community</span>}
        </div>
      </div>
      <h2 className="card-q">{card.q}</h2>

      {!revealed ? (
        <button className="reveal-btn" onClick={onReveal}>
          Reveal answer <kbd>R</kbd>
        </button>
      ) : (
        <div>
          <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(card.a) }} />
          {(card.fq || card.fa) && (
            <div className="followup">
              <div className="followup-label">Tricky follow-up</div>
              {card.fq && <p className="followup-q">{card.fq}</p>}
              {!followupRevealed ? (
                <button className="reveal-btn small" onClick={onRevealFollowup}>
                  Reveal follow-up answer <kbd>F</kbd>
                </button>
              ) : (
                card.fa && <div className="answer fa" dangerouslySetInnerHTML={{ __html: renderMD(card.fa) }} />
              )}
            </div>
          )}
          {card.tags?.length > 0 && (
            <div className="tag-row">
              {card.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
