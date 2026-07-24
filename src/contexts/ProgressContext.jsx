import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { applyReview } from '../lib/sm2'

const ProgressContext = createContext(null)
const LS_KEY = 'fid-progress-v2'

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  catch { return {} }
}

function saveLocal(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) }
  catch { /* storage full — silently ignore */ }
}

export function ProgressProvider({ children, user }) {
  const [progress, setProgress] = useState(loadLocal)
  // Keep a ref so async callbacks always read the latest state
  const progressRef = useRef(progress)
  useEffect(() => { progressRef.current = progress }, [progress])

  // When a user logs in, merge their cloud progress (cloud wins for existing entries)
  useEffect(() => {
    if (!user || !supabase) return
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
          }
        })
        setProgress(prev => {
          const merged = { ...prev, ...remote }
          saveLocal(merged)
          return merged
        })
      })
  }, [user?.id])

  const mark = useCallback(async (cardRef, kind) => {
    const current = progressRef.current[cardRef]
    const quality  = kind === 'known' ? 5 : 2
    const sm2      = kind !== undefined ? applyReview(current, quality) : null

    setProgress(prev => {
      const next = { ...prev }
      if (kind === undefined) delete next[cardRef]
      else next[cardRef] = { status: kind, ...sm2 }
      saveLocal(next)
      return next
    })

    if (!user || !supabase) return

    if (kind !== undefined) {
      await supabase.from('user_progress').upsert(
        {
          user_id:      user.id,
          card_ref:     cardRef,
          status:       kind,
          ease_factor:  sm2.easeFactor,
          interval_days: sm2.intervalDays,
          repetitions:  sm2.repetitions,
          next_review:  sm2.nextReview,
          last_reviewed: new Date().toISOString(),
        },
        { onConflict: 'user_id,card_ref' }
      )
    } else {
      await supabase.from('user_progress')
        .delete()
        .match({ user_id: user.id, card_ref: cardRef })
    }
  }, [user])

  const reset = useCallback(async () => {
    setProgress({})
    saveLocal({})
    if (user && supabase) {
      await supabase.from('user_progress').delete().eq('user_id', user.id)
    }
  }, [user])

  return (
    <ProgressContext.Provider value={{ progress, mark, reset }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
