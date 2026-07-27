import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProgress } from "../contexts/ProgressContext.jsx";
import { useQuestions } from "../contexts/QuestionsContext.jsx";
import TopBar from "../components/TopBar.jsx";
import Controls from "../components/Controls.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import QuizView from "../components/QuizView.jsx";
import BrowseView from "../components/BrowseView.jsx";
import CramView from "../components/CramView.jsx";
import Footer from "../components/Footer.jsx";

// Indices into allCards that match the current category, company, tags, and
// search query.
function filteredIndices(allCards, activeCat, query, companyFilter, tagFilter) {
  const q = query.trim().toLowerCase();
  const out = [];
  allCards.forEach((c, i) => {
    if (activeCat !== "All" && c.cat !== activeCat) return;
    if (companyFilter !== "All" && (c.company || "") !== companyFilter) return;
    if (tagFilter.size > 0 && !(c.tags || []).some((t) => tagFilter.has(t))) return;
    if (
      q &&
      !(
        c.q + " " + c.a + " " + (c.fq || "") + " " + (c.fa || "") +
        " " + (c.tags || []).join(" ") + " " + (c.company || "")
      )
        .toLowerCase()
        .includes(q)
    )
      return;
    out.push(i);
  });
  return out;
}

export default function HomePage() {
  const { progress, record, reset: progressReset } = useProgress();
  const { questions, loading, error } = useQuestions();
  const location = useLocation();
  const navigate = useNavigate();

  // A "seeded session" comes from a company study path: an explicit, ordered
  // list of card ids to study, bypassing the normal filters.
  const [seed, setSeed] = useState(() => location.state?.seed || null);

  const [mode, setMode]         = useState(() => location.state?.seed?.mode || "quiz");
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery]       = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [companyFilter, setCompanyFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState(() => new Set());

  // Every card now comes from the API (approved questions).
  const allCards = questions;

  // Distinct companies present in the deck (for the filter dropdown).
  const companies = useMemo(() => {
    const set = new Set();
    allCards.forEach((c) => { if (c.company) set.add(c.company); });
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [allCards]);

  // Most common tags across the deck (for the clickable tag chips).
  const topTags = useMemo(() => {
    const freq = new Map();
    allCards.forEach((c) => (c.tags || []).forEach((t) => freq.set(t, (freq.get(t) || 0) + 1)));
    return [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([t]) => t);
  }, [allCards]);

  // Reset the company filter if the selected company disappears from the deck.
  useEffect(() => {
    if (companyFilter !== "All" && !companies.includes(companyFilter)) {
      setCompanyFilter("All");
    }
  }, [companies, companyFilter]);

  // Drop any selected tags that no longer exist in the deck.
  useEffect(() => {
    const present = new Set();
    allCards.forEach((c) => (c.tags || []).forEach((t) => present.add(t)));
    setTagFilter((prev) => {
      const next = new Set([...prev].filter((t) => present.has(t)));
      return next.size === prev.size ? prev : next;
    });
  }, [allCards]);

  const toggleTag = (t) =>
    setTagFilter((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });

  const resetFilters = () => {
    setActiveCat("All");
    setQuery("");
    setDiffFilter("All");
    setCompanyFilter("All");
    setTagFilter(new Set());
  };

  const filtered = useMemo(
    () => filteredIndices(allCards, activeCat, query, companyFilter, tagFilter),
    [allCards, activeCat, query, companyFilter, tagFilter]
  );

  // Apply difficulty filter on top
  const filteredWithDiff = useMemo(() => {
    if (diffFilter === "All") return filtered;
    return filtered.filter((i) => {
      const d = allCards[i].difficulty;
      return d === diffFilter;
    });
  }, [filtered, diffFilter, allCards]);

  // Resolve a seeded path (ordered card ids) to deck indices, preserving order.
  const idToIndex = useMemo(() => {
    const m = new Map();
    allCards.forEach((c, i) => m.set(c.id, i));
    return m;
  }, [allCards]);

  const seedDeck = useMemo(() => {
    if (!seed) return null;
    return seed.ids.map((id) => idToIndex.get(id)).filter((i) => i !== undefined);
  }, [seed, idToIndex]);

  // A seeded session ignores the filters; otherwise use the filtered deck.
  const activePool = seed ? (seedDeck || []) : filteredWithDiff;

  const exitSeed = () => {
    setSeed(null);
    setMode("quiz");
    navigate("/", { replace: true, state: {} });
  };

  const [deck, setDeck] = useState([]);
  const [pos,  setPos]  = useState(0);

  // Rebuild deck whenever the active pool changes (filters or seeded path)
  useEffect(() => {
    setDeck(activePool);
    setPos(0);
  }, [activePool]);

  const [revealed,         setRevealed]         = useState(false);
  const [followupRevealed, setFollowupRevealed] = useState(false);
  const [browseOpen,       setBrowseOpen]       = useState(() => new Set());

  const currentCard = deck[pos] !== undefined ? allCards[deck[pos]] : null;

  useEffect(() => {
    setRevealed(false);
    setFollowupRevealed(false);
  }, [currentCard?.id, mode]);

  // ---- actions ----
  const next = () => setPos((p) => (p < deck.length - 1 ? p + 1 : p));
  const prev = () => setPos((p) => (p > 0 ? p - 1 : p));

  // Grade the current card (again/hard/good/easy) and advance.
  const gradeCard = (grade) => {
    if (!currentCard) return;
    record(currentCard.id, grade);
    setTimeout(next, 180);
  };

  const shuffle = () => {
    setDeck((d) => {
      const a = [...d];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    });
    setPos(0);
  };

  const toggleBrowse = (key) =>
    setBrowseOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // ---- keyboard shortcuts (quiz mode) ----
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    if (mode !== "quiz") return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    switch (e.key) {
      case " ":
      case "ArrowRight": e.preventDefault(); next(); break;
      case "ArrowLeft":  e.preventDefault(); prev(); break;
      case "r": case "R":
        if (!revealed) setRevealed(true);
        else if (!followupRevealed) setFollowupRevealed(true);
        break;
      case "f": case "F":
        setRevealed(true); setFollowupRevealed(true); break;
      case "1": gradeCard("again"); break;
      case "2": gradeCard("hard");  break;
      case "3": gradeCard("good");  break;
      case "4": gradeCard("easy");  break;
      case "s": case "S": shuffle(); break;
      default: break;
    }
  };
  useEffect(() => {
    const handler = (e) => keyRef.current?.(e);
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // ---- progress bar counts ----
  let got = 0, rev = 0;
  deck.forEach((i) => {
    const s = progress[allCards[i]?.id]?.status;
    if (s === "known")  got++;
    if (s === "review") rev++;
  });

  const curGrade = currentCard ? progress[currentCard.id]?.grade : undefined;

  return (
    <div className="wrap">
      <TopBar />
      {seed ? (
        <div className="path-banner">
          <div className="path-banner-info">
            <span className="path-banner-label">📌 {seed.label}</span>
            <span className="path-banner-count">{activePool.length} cards</span>
          </div>
          <div className="path-banner-actions">
            <div className="modeToggle">
              <button className={mode === "quiz" ? "active" : ""} onClick={() => setMode("quiz")}>
                Quiz
              </button>
              <button className={mode === "cram" ? "active" : ""} onClick={() => setMode("cram")}>
                Cram
              </button>
            </div>
            <button className="ghost" onClick={exitSeed}>Exit path</button>
          </div>
        </div>
      ) : (
        <Controls
          mode={mode}
          setMode={setMode}
          activeCat={activeCat}
          setActiveCat={setActiveCat}
          query={query}
          setQuery={setQuery}
          diffFilter={diffFilter}
          setDiffFilter={setDiffFilter}
          companyFilter={companyFilter}
          setCompanyFilter={setCompanyFilter}
          companies={companies}
          topTags={topTags}
          tagFilter={tagFilter}
          onToggleTag={toggleTag}
          onResetFilters={resetFilters}
          allCards={allCards}
        />
      )}
      {loading && <div className="empty-state">Loading questions…</div>}
      {!loading && error && (
        <div className="empty-state">
          Couldn’t load questions. Check your Supabase config and refresh.
        </div>
      )}
      {!loading && !error && allCards.length === 0 && (
        <div className="empty-state">
          No questions yet. Add some from the <a href="/admin">Admin</a> panel or the{" "}
          <a href="/submit">Submit</a> page.
        </div>
      )}
      {!loading && !error && allCards.length > 0 && mode === "quiz" && (
        <ProgressBar deckLength={deck.length} got={got} rev={rev} />
      )}
      {!loading && !error && allCards.length > 0 && (
        mode === "quiz" ? (
          <QuizView
            deck={deck}
            pos={pos}
            card={currentCard}
            activeCat={activeCat}
            curGrade={curGrade}
            revealed={revealed}
            followupRevealed={followupRevealed}
            onReveal={() => setRevealed(true)}
            onRevealFollowup={() => setFollowupRevealed(true)}
            onPrev={prev}
            onNext={next}
            onGrade={gradeCard}
            onShuffle={shuffle}
            onReset={progressReset}
          />
        ) : mode === "cram" ? (
          <CramView
            pool={activePool}
            allCards={allCards}
            progress={progress}
            onGrade={record}
          />
        ) : (
          <BrowseView
            allCards={allCards}
            filtered={filteredWithDiff}
            browseOpen={browseOpen}
            onToggle={toggleBrowse}
            progress={progress}
          />
        )
      )}
      <Footer allCards={allCards} />
    </div>
  );
}
