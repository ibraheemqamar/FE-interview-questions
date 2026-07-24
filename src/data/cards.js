import { existingCards } from "./existingCards.js";
import { newCards } from "./newCards.js";
import { CAT_ORDER } from "./categories.js";

// Merge the original deck with the new questions, then group by CAT_ORDER so
// every category's cards stay contiguous (stable within a category). Any card
// whose category isn't in CAT_ORDER falls to the end.
const orderIndex = (cat) => {
  const i = CAT_ORDER.indexOf(cat);
  return i === -1 ? CAT_ORDER.length : i;
};

export const CARDS = [...existingCards, ...newCards]
  .map((card, i) => ({ card, i })) // keep original order as the tiebreaker (stable sort)
  .sort((a, b) => orderIndex(a.card.cat) - orderIndex(b.card.cat) || a.i - b.i)
  .map(({ card }, sortedIdx) => ({ ...card, id: `s${sortedIdx}` }));
