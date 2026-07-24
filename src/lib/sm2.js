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
