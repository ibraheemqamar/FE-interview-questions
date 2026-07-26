import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchApprovedQuestions } from "../lib/questions.js";

// Single source of truth for the deck. Loads every approved question from the
// API and shares it across the deck + stats pages. Admin CRUD updates the same
// list optimistically via the mutation helpers below.
//
// Offline-first (PWA): the last successful deck is cached in localStorage. On
// load we hydrate from that cache immediately (so studying works with no
// network), then revalidate from the API — stale-while-revalidate. A failed
// revalidation (offline / server down) keeps the cached deck instead of
// blanking it.
const QuestionsContext = createContext(null);
const CACHE_KEY = "fid-questions-cache-v1";

function loadCache() {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function QuestionsProvider({ children }) {
  const [questions, setQuestions] = useState(() => loadCache() || []);
  const [loading, setLoading] = useState(() => !(loadCache()?.length));
  const [error, setError] = useState(null);

  // Persist the deck to the offline cache whenever it has content.
  useEffect(() => {
    if (questions.length) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(questions)); } catch { /* full */ }
    }
  }, [questions]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setQuestions(await fetchApprovedQuestions());
    } catch (e) {
      // Offline or server down: keep the cached deck (state is untouched). Only
      // surface an error when there's genuinely nothing cached to show.
      if (!loadCache()?.length) setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Keep the in-memory deck in sync after admin mutations, no full refetch needed.
  const upsertLocal = useCallback((row) => {
    if (!row) return;
    setQuestions((prev) => {
      const i = prev.findIndex((c) => c.id === row.id);
      if (i === -1) {
        // Only surface it in the deck if it's approved.
        return row.status && row.status !== "approved" ? prev : [...prev, row];
      }
      const next = [...prev];
      next[i] = { ...next[i], ...row };
      return next;
    });
  }, []);

  const removeLocal = useCallback((id) => {
    setQuestions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <QuestionsContext.Provider
      value={{ questions, loading, error, refresh, upsertLocal, removeLocal }}
    >
      {children}
    </QuestionsContext.Provider>
  );
}

export const useQuestions = () => useContext(QuestionsContext);
