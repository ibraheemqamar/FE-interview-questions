import { useMemo } from "react";
import { CAT_META, CAT_ORDER } from "../data/categories.js";

const DIFFICULTIES = [
  { id: "All", label: "All levels" },
  { id: "beginner",     label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced",     label: "Advanced" },
];

const DIFF_LABEL = Object.fromEntries(DIFFICULTIES.map((d) => [d.id, d.label]));

// Chip row (category filters) + search + tag chips + active-filter pills +
// Quiz/Cram/Browse mode toggle.
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
      <div className="chips">
        <Chip id="All" label="All" color="" count={allCards.length} />
        {CAT_ORDER.map((cat) => (
          <Chip key={cat} id={cat} label={CAT_META[cat].label} color={CAT_META[cat].c} count={counts[cat] ?? 0} />
        ))}
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
        <div className="diff-toggle">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              className={diffFilter === d.id ? "active" : ""}
              onClick={() => setDiffFilter(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="modeToggle">
          <button className={mode === "quiz" ? "active" : ""} onClick={() => setMode("quiz")}>
            Quiz
          </button>
          <button className={mode === "cram" ? "active" : ""} onClick={() => setMode("cram")}>
            Cram
          </button>
          <button className={mode === "browse" ? "active" : ""} onClick={() => setMode("browse")}>
            Browse
          </button>
        </div>
      </div>

      {topTags.length > 0 && (
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
      )}

      {pills.length > 0 && (
        <div className="filter-pills">
          <span className="filter-pills-label">Filters:</span>
          {pills.map((p) => (
            <button key={p.key} className="filter-pill" onClick={p.clear} title="Remove filter">
              {p.label} <span className="filter-pill-x">×</span>
            </button>
          ))}
          <button className="filter-clear" onClick={onResetFilters}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
