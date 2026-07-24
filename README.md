# Frontend Interview Deck

A React flashcard app for frontend interview prep. Converted from the original
single-file `frontend-interview-flashcards.html` into a Vite + React project —
**same design**, more questions, and a new **Next.js** topic.

- **253 questions** across 8 topics, each with an answer and a "tricky follow-up".
- **Quiz mode** — one card at a time, reveal answer → reveal follow-up, mark
  _Got it_ / _Review again_, with a progress bar. Keyboard-driven.
- **Browse mode** — an accordion of every card, expand to read inline.
- Category **chips**, full-text **search**, **shuffle**, and **reset**.

## Topics

| Topic | Cards |
| --- | --- |
| HTML | 30 |
| CSS | 33 |
| JavaScript | 48 |
| Tailwind | 23 |
| React | 38 |
| **Next.js** (new) | 24 |
| TypeScript | 32 |
| Performance | 25 |
| **Total** | **253** |

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build → dist/
npm run preview  # preview the production build
```

## Keyboard shortcuts (Quiz mode)

| Key | Action |
| --- | --- |
| `R` | Reveal answer / then follow-up |
| `F` | Reveal follow-up |
| `←` `→` / `Space` | Previous / next card |
| `1` | Mark _Got it_ |
| `2` | Mark _Review again_ |
| `S` | Shuffle deck |

## Project structure

```
src/
  main.jsx              # React entry
  App.jsx               # State + orchestration (deck, filters, progress, keyboard)
  styles.css            # Design ported verbatim from the original HTML
  components/
    TopBar.jsx          # Brand + deck stats
    Controls.jsx        # Category chips, search, Quiz/Browse toggle
    ProgressBar.jsx     # Reviewed / got-it / to-review meter
    QuizView.jsx        # Counter, card, mark & nav controls
    Flashcard.jsx       # A single quiz card (reveal answer + follow-up)
    BrowseView.jsx      # Accordion list of all cards
    Footer.jsx
  data/
    categories.js       # Category labels + accent colors (incl. Next.js)
    existingCards.js     # The original 180 cards, migrated verbatim
    newCards.js         # 73 new cards (Next.js + deeper topic coverage)
    cards.js            # Merges + groups both by category
  lib/
    markdown.js         # Tiny markdown renderer (bold, code, lists, fences)
```

## Adding questions

Add objects to `src/data/newCards.js`. Each card is:

```js
{
  cat: "React",              // must be a key in categories.js
  q: "The question",
  a: "The answer — supports **bold**, `code`, \n- bullet lists, and ```fenced``` code",
  fq: "The tricky follow-up question",
  fa: "The follow-up answer",
}
```

To add a whole new topic, add an entry to `CAT_META` and `CAT_ORDER` in
`src/data/categories.js`, then author cards with that `cat`.

## Notes

- Progress (got it / to review) is **per-session** — it isn't persisted.
- Answer content is authored in-repo and rendered via a small trusted markdown
  helper, matching the original deck's rendering exactly.
