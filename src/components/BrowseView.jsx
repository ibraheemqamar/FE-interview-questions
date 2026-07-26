import { CAT_META } from "../data/categories.js";
import { renderMD } from "../lib/markdown.js";

function accentFor(cat) {
  return (CAT_META[cat] || {}).c || "#5b8def";
}

const DIFF_COLOR = { beginner: "#35d0a0", intermediate: "#fbbf24", advanced: "#f87171" };

// Browse mode: an accordion list of every filtered card. Click to expand the
// answer + follow-up inline.
export default function BrowseView({ allCards = [], filtered, browseOpen, onToggle, progress = {} }) {
  if (filtered.length === 0) {
    return (
      <div className="browse-list">
        <div className="empty-state">No questions match your filters.</div>
      </div>
    );
  }

  return (
    <div className="browse-list">
      {filtered.map((i) => {
        const c    = allCards[i];
        const key  = c.id ?? i;
        const open = browseOpen.has(key);
        const cardStatus = progress[c.id]?.status;
        return (
          <div key={key} className={"b-item" + (open ? " open" : "")} style={{ "--accent": accentFor(c.cat) }}>
            <button className="b-head" aria-expanded={open} onClick={() => onToggle(key)}>
              <span className="b-cat">{(CAT_META[c.cat] || { label: c.cat }).label}</span>
              <span className="b-q">{c.q}</span>
              {c.difficulty && c.difficulty !== 'intermediate' && (
                <span className="diff-dot" style={{ background: DIFF_COLOR[c.difficulty] }} title={c.difficulty} />
              )}
              {c.company && <span className="company-badge company-badge--inline">{c.company}</span>}
              {c.source === "community" && <span className="community-badge">community</span>}
              {cardStatus === 'known'  && <span className="b-status known">✓</span>}
              {cardStatus === 'review' && <span className="b-status review">↻</span>}
              <span className="b-caret">▶</span>
            </button>
            {open && (
              <div className="b-body">
                <div className="answer" dangerouslySetInnerHTML={{ __html: renderMD(c.a) }} />
                {(c.fq || c.fa) && (
                  <div className="followup">
                    <div className="followup-label">Tricky follow-up</div>
                    {c.fq && <p className="followup-q">{c.fq}</p>}
                    {c.fa && <div className="answer fa" dangerouslySetInnerHTML={{ __html: renderMD(c.fa) }} />}
                  </div>
                )}
                {c.tags?.length > 0 && (
                  <div className="tag-row">
                    {c.tags.map((t) => <span key={t} className="tag-pill">{t}</span>)}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
