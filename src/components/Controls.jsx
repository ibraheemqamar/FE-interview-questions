import { useMemo } from "react";
import { CAT_META, CAT_ORDER } from "../data/categories.js";

const DIFFICULTIES = [
  { id: "All", label: "All levels" },
  { id: "beginner",     label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced",     label: "Advanced" },
];

// Chip row (category filters) + search + Quiz/Browse mode toggle.
export default function Controls({
  mode, setMode,
  activeCat, setActiveCat,
  query, setQuery,
  diffFilter, setDiffFilter,
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
          <button className={mode === "browse" ? "active" : ""} onClick={() => setMode("browse")}>
            Browse
          </button>
        </div>
      </div>
    </div>
  );
}
