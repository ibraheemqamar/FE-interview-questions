import { useEffect, useMemo, useRef, useState } from "react";
import { CARDS } from "../data/cards.js";
import { supabase } from "../lib/supabase.js";
import { useProgress } from "../contexts/ProgressContext.jsx";
import TopBar from "../components/TopBar.jsx";
import Controls from "../components/Controls.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import QuizView from "../components/QuizView.jsx";
import BrowseView from "../components/BrowseView.jsx";
import Footer from "../components/Footer.jsx";

// Indices into allCards that match the current category + search query.
function filteredIndices(allCards, activeCat, query) {
  const q = query.trim().toLowerCase();
  const out = [];
  allCards.forEach((c, i) => {
    if (activeCat !== "All" && c.cat !== activeCat) return;
    if (
      q &&
      !(c.q + " " + c.a + " " + (c.fq || "") + " " + (c.fa || "") + " " + (c.tags || []).join(" "))
        .toLowerCase()
        .includes(q)
    )
      return;
    out.push(i);
  });
  return out;
}

export default function HomePage() {
  const { progress, mark: progressMark, reset: progressReset } = useProgress();

  const [mode, setMode]         = useState("quiz");
  const [activeCat, setActiveCat] = useState("All");
  const [query, setQuery]       = useState("");
  const [diffFilter, setDiffFilter] = useState("All");

  // Community cards loaded from Supabase
  const [communityCards, setCommunityCards] = useState([]);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("submissions")
      .select("id,cat,q,a,fq,fa,difficulty,tags,submitter_name,upvotes")
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .then(({ data }) => setCommunityCards(data || []));
  }, []);

  // Merge static + community into one flat array
  const allCards = useMemo(
    () => [
      ...CARDS,
      ...communityCards.map((c) => ({ ...c, community: true })),
    ],
    [communityCards]
  );

  const filtered = useMemo(
    () => filteredIndices(allCards, activeCat, query),
    [allCards, activeCat, query]
  );

  // Apply difficulty filter on top
  const filteredWithDiff = useMemo(() => {
    if (diffFilter === "All") return filtered;
    return filtered.filter((i) => {
      const d = allCards[i].difficulty;
      return d === diffFilter;
    });
  }, [filtered, diffFilter, allCards]);

  const [deck, setDeck] = useState([]);
  const [pos,  setPos]  = useState(0);

  // Rebuild deck whenever filters change
  useEffect(() => {
    setDeck(filteredWithDiff);
    setPos(0);
  }, [filteredWithDiff]);

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

  const mark = (kind) => {
    if (!currentCard) return;
    const currentStatus = progress[currentCard.id]?.status;
    const newKind = currentStatus === kind ? undefined : kind;
    progressMark(currentCard.id, newKind);
    if (newKind === "known") setTimeout(next, 180);
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
      case "1": mark("known");  break;
      case "2": mark("review"); break;
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

  const curStatus = currentCard ? progress[currentCard.id]?.status : undefined;

  return (
    <div className="wrap">
      <TopBar allCards={allCards} />
      <Controls
        mode={mode}
        setMode={setMode}
        activeCat={activeCat}
        setActiveCat={setActiveCat}
        query={query}
        setQuery={setQuery}
        diffFilter={diffFilter}
        setDiffFilter={setDiffFilter}
      />
      {mode === "quiz" && (
        <ProgressBar deckLength={deck.length} got={got} rev={rev} />
      )}
      {mode === "quiz" ? (
        <QuizView
          deck={deck}
          pos={pos}
          card={currentCard}
          activeCat={activeCat}
          curStatus={curStatus}
          revealed={revealed}
          followupRevealed={followupRevealed}
          onReveal={() => setRevealed(true)}
          onRevealFollowup={() => setFollowupRevealed(true)}
          onPrev={prev}
          onNext={next}
          onMarkGot={() => mark("known")}
          onMarkReview={() => mark("review")}
          onShuffle={shuffle}
          onReset={progressReset}
        />
      ) : (
        <BrowseView
          allCards={allCards}
          filtered={filteredWithDiff}
          browseOpen={browseOpen}
          onToggle={toggleBrowse}
          progress={progress}
        />
      )}
      <Footer allCards={allCards} />
    </div>
  );
}
