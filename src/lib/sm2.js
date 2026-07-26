// Four-grade recall scale (Anki-style), mapped onto SM-2 quality values.
// Classic SM-2 treats quality >= 3 as a successful recall; "again" (< 3) resets
// the card. `status` is the coarse two-bucket value the rest of the app already
// uses (progress bar, stats, browse) — the DB `status` column only allows
// 'known' | 'review', so passes that felt Hard still count as "review".
export const GRADES = ["again", "hard", "good", "easy"];
export const GRADE_QUALITY = { again: 1, hard: 3, good: 4, easy: 5 };
export const GRADE_META = {
  again: { label: "Again", key: "1", status: "review", color: "#f87171" },
  hard:  { label: "Hard",  key: "2", status: "review", color: "#fbbf24" },
  good:  { label: "Good",  key: "3", status: "known",  color: "#60a5fa" },
  easy:  { label: "Easy",  key: "4", status: "known",  color: "#35d0a0" },
};

// SM-2 Spaced Repetition Algorithm
// quality: 5 = perfect recall ("Got it"), 2 = failed/hard ("Review again")
// Returns updated SM-2 state + ISO next-review date.
export function applyReview(prev = {}, quality) {
  let { easeFactor = 2.5, intervalDays = 1, repetitions = 0 } = prev

  if (quality >= 3) {
    if (repetitions === 0) intervalDays = 1
    else if (repetitions === 1) intervalDays = 6
    else intervalDays = Math.round(intervalDays * easeFactor)
    repetitions++
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  } else {
    repetitions = 0
    intervalDays = 1
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + intervalDays)
  return { easeFactor, intervalDays, repetitions, nextReview: nextReview.toISOString() }
}

// Returns true when a card is due (or has never been reviewed).
export function isDue(entry) {
  if (!entry?.nextReview) return true
  return new Date(entry.nextReview) <= new Date()
}
