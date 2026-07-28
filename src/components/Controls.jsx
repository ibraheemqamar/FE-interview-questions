import { useMemo, useState } from "react";
import { CAT_META, CAT_ORDER } from "../data/categories.js";

const DIFFICULTIES = [
  { id: "All", label: "All levels" },
  { id: "beginner",     label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced",     label: "Advanced" },
];

const DIFF_LABEL = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d.label]));

// The three ways to study — the primary choice on this page. NOTE: the `id`
// values are internal keys used across the app (mode switching, saved sessions,
// keyboard shortcuts); only the labels/descriptions are user-facing copy.
const MODES = [
  { id: "quiz",   icon: "🎯", label: "Practice",      desc: "See a question, recall it, then grade yourself" },
  { id: "cram",   icon: "⚡", label: "Quick review",  desc: "Fast, timed run through a batch" },
  { id: "browse", icon: "📖", label: "Read all",      desc: "Read every answer, nothing graded" },
];

const HINT_KEY = "fid-deck-hint-dismissed-v1";

// Primary "Mode" selector (what you're doing) over a grouped, secondary
// "Filter" block (what you're studying): search + category chips + difficulty
// + company + tags + active-filter pills.
export default function Controls({
  mode, setMode,
  activeCat, setActiveCat,
  query, setQuery,
  diffFilter, setDiffFilter,
  companyFilter, setCompanyFilter,
  companies = [],
  topTags = [],
  tagFilter = new Set(),
  onToggleTag = () => {},
  onResetFilters = () => {},
  allCards = [],
}) {
  const [hintOpen, setHintOpen] = useState(
    () => typeof localStorage !== "undefined" && !localStorage.getItem(HINT_KEY)
  );
  const dismissHint = () => {
    setHintOpen(false);
    try { localStorage.setItem(HINT_KEY, "1"); } catch { /* ignore */ }
  };

  const counts = useMemo(() => {
    const c = {};
    CAT_ORDER.forEach((cat) => (c[cat] = allCards.filter((card) => card.cat === cat).length));
    return c;
  }, [allCards]);

  const Chip = ({ id, label, color, count }) => {
    const active = activeCat === id;
    return (
      <button
        className={"chip" + (active ? " active" : "")}
        style={{ "--c": color || "#c7d2e0" }}
        onClick={() => setActiveCat(id)}
      >
        {color ? <span className="dot"></span> : null}
        {label} <span style={{ opacity: 0.6 }}>{count}</span>
      </button>
    );
  };

  // Active, non-default filters shown as removable pills.
  const pills = [];
  if (activeCat !== "All")
    pills.push({ key: "cat", label: (CAT_META[activeCat]?.label || activeCat), clear: () => setActiveCat("All") });
  if (diffFilter !== "All")
    pills.push({ key: "diff", label: DIFF_LABEL[diffFilter] || diffFilter, clear: () => setDiffFilter("All") });
  if (companyFilter !== "All")
    pills.push({ key: "co", label: "🏢 " + companyFilter, clear: () => setCompanyFilter("All") });
  [...tagFilter].forEach((t) =>
    pills.push({ key: "tag:" + t, label: "#" + t, clear: () => onToggleTag(t) })
  );
  if (query.trim())
    pills.push({ key: "q", label: `“${query.trim()}”`, clear: () => setQuery("") });

  return (
    <div className="controls">
      {hintOpen && (
        <div className="deck-hint">
          <span className="deck-hint-text">
            👋 Pick a <b>mode</b> below (how you study), then optionally <b>filter</b> the questions (what you study).
          </span>
          <button className="deck-hint-x" onClick={dismissHint} title="Got it">×</button>
        </div>
      )}

      {/* Primary: how you want to study */}
      <div className="mode-select" role="tablist" aria-label="Study mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            className={"mode-opt" + (mode === m.id ? " on" : "")}
            onClick={() => setMode(m.id)}
          >
            <span className="mode-opt-icon">{m.icon}</span>
            <span className="mode-opt-body">
              <span className="mode-opt-label">{m.label}</span>
              <span className="mode-opt-desc">{m.desc}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Secondary: what you want to study */}
      <div className="filters">
        <div className="filters-head">
          <span className="filters-label">Filter</span>
          {pills.length > 0 && (
            <button className="filter-clear" onClick={onResetFilters}>Clear all</button>
          )}
        </div>

        <div className="control-row">
          <input
            className="search"
            type="text"
            placeholder="Search questions, answers, keywords…"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="company-select"
            value={diffFilter}
            onChange={(e) => setDiffFilter(e.target.value)}
            title="Filter by difficulty"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
          {companies.length > 0 && (
            <select
              className="company-select"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              title="Filter by company"
            >
              <option value="All">All companies</option>
              {companies.map((co) => (
                <option key={co} value={co}>{co}</option>
              ))}
            </select>
          )}
        </div>

        <div className="filter-group">
          <div className="filter-group-head">
            <span className="filter-group-label">Category</span>
            <span className="filter-group-hint">Pick one</span>
            {activeCat !== "All" && (
              <span className="filter-group-count">{CAT_META[activeCat]?.label || activeCat}</span>
            )}
          </div>
          <div className="chips">
            <Chip id="All" label="All" color="" count={allCards.length} />
            {CAT_ORDER.map((cat) => (
              <Chip key={cat} id={cat} label={CAT_META[cat].label} color={CAT_META[cat].c} count={counts[cat] ?? 0} />
            ))}
          </div>
        </div>

        {topTags.length > 0 && (
          <div className="filter-group">
            <div className="filter-group-head">
              <span className="filter-group-label">Popular tags</span>
              <span className="filter-group-hint">Combine any</span>
              {tagFilter.size > 0 && (
                <span className="filter-group-count">{tagFilter.size} selected</span>
              )}
            </div>
            <div className="tag-chips">
              {topTags.map((t) => (
                <button
                  key={t}
                  className={"tag-chip" + (tagFilter.has(t) ? " active" : "")}
                  onClick={() => onToggleTag(t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          </div>
        )}

        {pills.length > 0 && (
          <div className="filter-pills">
            <span className="filter-pills-label">Active:</span>
            {pills.map((p) => (
              <button key={p.key} className="filter-pill" onClick={p.clear} title="Remove filter">
                {p.label} <span className="filter-pill-x">×</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
