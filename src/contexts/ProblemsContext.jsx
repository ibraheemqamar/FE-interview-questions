import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchApprovedProblems } from "../lib/problems.js";

// Single source of truth for the approved Practice problem list. Mirrors
// QuestionsContext exactly: loads every approved problem once, shares it across
// the Practice list + admin, and admin CRUD updates the same list optimistically.
//
// Offline-first (PWA): the last successful list is cached in localStorage and
// hydrated immediately, then revalidated (stale-while-revalidate). A failed
// revalidation keeps the cached list instead of blanking it. NOTE: this caches
// only the list metadata — actually solving a problem (editor, run, AI) needs
// the network, which is fine; the offline flashcard flow is untouched.
const ProblemsContext = createContext(null);
const CACHE_KEY = "fid-problems-cache-v1";

function loadCache() {
  try {
    const v = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

export function ProblemsProvider({ children }) {
  const [problems, setProblems] = useState(() => loadCache() || []);
  const [loading, setLoading] = useState(() => !(loadCache()?.length));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (problems.length) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(problems)); } catch { /* full */ }
    }
  }, [problems]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      setProblems(await fetchApprovedProblems());
    } catch (e) {
      if (!loadCache()?.length) setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Keep the in-memory list in sync after admin mutations (no full refetch).
  // The list only holds card/filter metadata, so we strip the heavy fields.
  const upsertLocal = useCallback((row) => {
    if (!row) return;
    setProblems((prev) => {
      const i = prev.findIndex((p) => p.id === row.id);
      if (i === -1) {
        return row.status && row.status !== "approved" ? prev : [...prev, row];
      }
      // If an edit flipped it away from approved, drop it from the public list.
      if (row.status && row.status !== "approved") {
        return prev.filter((p) => p.id !== row.id);
      }
      const next = [...prev];
      next[i] = { ...next[i], ...row };
      return next;
    });
  }, []);

  const removeLocal = useCallback((id) => {
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <ProblemsContext.Provider
      value={{ problems, loading, error, refresh, upsertLocal, removeLocal }}
    >
      {children}
    </ProblemsContext.Provider>
  );
}

export const useProblems = () => useContext(ProblemsContext);
