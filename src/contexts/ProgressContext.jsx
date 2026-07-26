import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { applyReview, GRADE_QUALITY, GRADE_META } from '../lib/sm2'

const ProgressContext = createContext(null)
const LS_PREFIX = 'fid-progress-v2'
const STREAK_PREFIX = 'fid-streak-v1'

// Each identity gets its OWN localStorage bucket so progress is never shared
// between users (or between a user and an anonymous session) on the same
// browser. Signed-out visitors use the 'anon' bucket.
const keyFor = (user) => `${LS_PREFIX}:${user?.id || 'anon'}`
const streakKeyFor = (user) => `${STREAK_PREFIX}:${user?.id || 'anon'}`

function loadLocal(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') }
  catch { return {} }
}

function saveLocal(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)) }
  catch { /* storage full — silently ignore */ }
}

// ---- streak helpers (local calendar days) ----
const EMPTY_STREAK = { current: 0, longest: 0, lastDay: null }

function loadStreak(key) {
  try { return { ...EMPTY_STREAK, ...JSON.parse(localStorage.getItem(key) || '{}') } }
  catch { return { ...EMPTY_STREAK } }
}

function todayStr(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Whole-day difference between two 'YYYY-MM-DD' strings (b - a), local time.
function dayDiff(a, b) {
  return Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000)
}

// ---- offline write queue (PWA) ----
// Cloud writes that fail (offline / server down) are queued in localStorage and
// replayed, in order, when the connection returns. Local state is the source of
// truth; the cloud eventually catches up.
const QUEUE_PREFIX = 'fid-sync-queue-v1'
const queueKeyFor = (user) => `${QUEUE_PREFIX}:${user?.id || 'anon'}`
function loadQueue(user) {
  try { const v = JSON.parse(localStorage.getItem(queueKeyFor(user)) || '[]'); return Array.isArray(v) ? v : [] }
  catch { return [] }
}
function saveQueue(user, q) {
  try { localStorage.setItem(queueKeyFor(user), JSON.stringify(q)) } catch { /* full */ }
}
const isOnline = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false)

export function ProgressProvider({ children, user }) {
  const lsKey = keyFor(user)
  const [progress, setProgress] = useState(() => loadLocal(keyFor(user)))
  const [streak, setStreak] = useState(() => loadStreak(streakKeyFor(user)))

  // Keep a ref so async callbacks always read the latest state
  const progressRef = useRef(progress)
  useEffect(() => { progressRef.current = progress }, [progress])

  // Identity changed (login / logout / switch account) → load THAT identity's
  // own cache. No cross-identity merging, so stats stay per-user.
  useEffect(() => {
    setProgress(loadLocal(lsKey))
    setStreak(loadStreak(streakKeyFor(user)))
  }, [lsKey])

  // For a signed-in user, pull their cloud progress and merge it with their own
  // local cache (cloud wins). Only ever touches this user's bucket.
  useEffect(() => {
    if (!user || !supabase || !isOnline()) return
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data?.length) return
        const remote = {}
        data.forEach(row => {
          remote[row.card_ref] = {
            status:      row.status,
            easeFactor:  row.ease_factor,
            intervalDays: row.interval_days,
            repetitions: row.repetitions,
            nextReview:  row.next_review,
            lastReviewed: row.last_reviewed,
          }
        })
        setProgress(prev => {
          const merged = { ...prev, ...remote }
          saveLocal(keyFor(user), merged)
          return merged
        })
      })
      .catch(() => { /* offline / transient — the local cache still works */ })
  }, [user?.id])

  // Advance the daily study streak. Called once per review; a no-op if the user
  // already studied today. Breaks (and restarts at 1) if a day was skipped.
  const bumpStreak = useCallback(() => {
    setStreak(prev => {
      const today = todayStr()
      if (prev.lastDay === today) return prev
      const continues = prev.lastDay && dayDiff(prev.lastDay, today) === 1
      const current = continues ? prev.current + 1 : 1
      const next = { current, longest: Math.max(prev.longest || 0, current), lastDay: today }
      saveStreak(user, next)
      return next
    })
  }, [user])

  function saveStreak(u, data) { saveLocal(streakKeyFor(u), data) }

  // Drain the offline write queue in order. Stops on the first failure (still
  // offline / transient) and keeps the remainder for the next attempt.
  const flushingRef = useRef(false)
  const flush = useCallback(async () => {
    if (!user || !supabase || flushingRef.current || !isOnline()) return
    flushingRef.current = true
    try {
      let q = loadQueue(user)
      while (q.length) {
        const op = q[0]
        try {
          let res
          if (op.t === 'upsert') res = await supabase.from('user_progress').upsert(op.row, { onConflict: 'user_id,card_ref' })
          else if (op.t === 'upsertMany') res = await supabase.from('user_progress').upsert(op.rows, { onConflict: 'user_id,card_ref' })
          else if (op.t === 'delete') res = await supabase.from('user_progress').delete().match({ user_id: user.id, card_ref: op.cardRef })
          else if (op.t === 'clear') res = await supabase.from('user_progress').delete().eq('user_id', user.id)
          if (res && res.error) throw res.error
        } catch {
          break // offline / transient — retry on the next 'online' event
        }
        q = q.slice(1)
        saveQueue(user, q)
      }
    } finally {
      flushingRef.current = false
    }
  }, [user])

  // Queue a cloud write and try to flush immediately (sends now if online).
  const enqueue = useCallback((op) => {
    if (!user || !supabase) return
    const q = loadQueue(user)
    q.push(op)
    saveQueue(user, q)
    flush()
  }, [user, flush])

  // Flush on mount / identity change and whenever the browser regains network.
  useEffect(() => {
    if (!user || !supabase) return
    flush()
    const onOnline = () => flush()
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [user, flush])

  // Record a 4-grade review (again/hard/good/easy). Runs SM-2, derives the
  // coarse status bucket, updates the streak, and queues a cloud sync.
  const record = useCallback(async (cardRef, grade) => {
    const key     = keyFor(user)
    const quality = GRADE_QUALITY[grade]
    if (quality === undefined) return
    const current = progressRef.current[cardRef]
    const sm2     = applyReview(current, quality)
    const status  = GRADE_META[grade].status
    const nowISO  = new Date().toISOString()

    setProgress(prev => {
      const next = { ...prev, [cardRef]: { status, grade, ...sm2, lastReviewed: nowISO } }
      saveLocal(key, next)
      return next
    })

    bumpStreak()

    if (!user || !supabase) return
    // `grade` is intentionally NOT persisted server-side: the DB status column
    // only allows known/review, and the finer signal already lives in the
    // synced SM-2 numbers. Grade stays a local nicety.
    enqueue({
      t: 'upsert',
      row: {
        user_id:       user.id,
        card_ref:      cardRef,
        status,
        ease_factor:   sm2.easeFactor,
        interval_days: sm2.intervalDays,
        repetitions:   sm2.repetitions,
        next_review:   sm2.nextReview,
        last_reviewed: nowISO,
      },
    })
  }, [user, bumpStreak, enqueue])

  // Legacy binary API (known/review), kept for any caller not yet on `record`.
  const mark = useCallback((cardRef, kind) => {
    if (kind === undefined) {
      const key = keyFor(user)
      setProgress(prev => {
        const next = { ...prev }
        delete next[cardRef]
        saveLocal(key, next)
        return next
      })
      if (user && supabase) enqueue({ t: 'delete', cardRef })
      return
    }
    return record(cardRef, kind === 'known' ? 'good' : 'again')
  }, [user, record, enqueue])

  const reset = useCallback(() => {
    setProgress({})
    saveLocal(keyFor(user), {})
    setStreak({ ...EMPTY_STREAK })
    saveStreak(user, { ...EMPTY_STREAK })
    if (user && supabase) {
      // A full clear supersedes any queued writes.
      saveQueue(user, [{ t: 'clear' }])
      flush()
    }
  }, [user, flush])

  // Serialisable snapshot for the "Export progress" button.
  const exportData = useCallback(() => ({
    version: 2,
    exportedAt: new Date().toISOString(),
    progress: progressRef.current,
    streak,
  }), [streak])

  // Merge an imported snapshot into the current one. Per card, the most recently
  // reviewed record wins. Signed-in users also get the winners pushed to cloud.
  const importProgress = useCallback(async (payload) => {
    const incoming = payload?.progress || payload || {}
    const merged = { ...progressRef.current }
    const rows = []
    for (const [id, v] of Object.entries(incoming)) {
      if (!v || typeof v !== 'object') continue
      const curT = merged[id]?.lastReviewed ? Date.parse(merged[id].lastReviewed) : 0
      const incT = v.lastReviewed ? Date.parse(v.lastReviewed) : 0
      if (!merged[id] || incT >= curT) {
        merged[id] = v
        rows.push({
          user_id:       user?.id,
          card_ref:      id,
          status:        v.status,
          ease_factor:   v.easeFactor,
          interval_days: v.intervalDays,
          repetitions:   v.repetitions,
          next_review:   v.nextReview,
          last_reviewed: v.lastReviewed,
        })
      }
    }
    saveLocal(keyFor(user), merged)
    setProgress(merged)

    // Merge streak: keep the larger longest, adopt the more recent day.
    if (payload?.streak) {
      setStreak(prev => {
        const inc = payload.streak
        const takeInc = inc.lastDay && (!prev.lastDay || inc.lastDay > prev.lastDay)
        const next = {
          current: takeInc ? (inc.current || 0) : prev.current,
          longest: Math.max(prev.longest || 0, inc.longest || 0),
          lastDay: takeInc ? inc.lastDay : prev.lastDay,
        }
        saveStreak(user, next)
        return next
      })
    }

    if (user && supabase && rows.length) {
      enqueue({ t: 'upsertMany', rows })
    }
    return { merged: rows.length, seen: Object.keys(incoming).length }
  }, [user, enqueue])

  // Streak, but broken back to 0 for display if a day was missed (the stored
  // value only resets on the next review).
  const streakView = useMemo(() => {
    const alive = streak.lastDay && dayDiff(streak.lastDay, todayStr()) <= 1
    return {
      current: alive ? streak.current : 0,
      longest: streak.longest || 0,
      lastDay: streak.lastDay,
      studiedToday: streak.lastDay === todayStr(),
    }
  }, [streak])

  return (
    <ProgressContext.Provider
      value={{ progress, record, mark, reset, streak: streakView, exportData, importProgress }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
