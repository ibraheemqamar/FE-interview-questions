// Company study paths: a curated ordering of a company's tagged questions,
// padded with high-signal general questions in the same categories.

const DIFF_RANK = { beginner: 0, intermediate: 1, advanced: 2 };

// Distinct companies in the deck, with how many questions each has, most first.
export function listCompanies(cards) {
  const map = new Map();
  cards.forEach((c) => {
    if (c.company) map.set(c.company, (map.get(c.company) || 0) + 1);
  });
  return [...map.entries()]
    .map(([company, count]) => ({ company, count }))
    .sort((a, b) => b.count - a.count || a.company.localeCompare(b.company));
}

// Build a ~`target`-card path for one company:
//   1. every approved question tagged with that company,
//      ordered by difficulty (easy→hard) then upvotes,
//   2. padded with the top-upvoted general questions that share the same
//      categories, until we reach `target` cards.
export function buildPath(cards, company, target = 30) {
  const byDiffThenVotes = (a, b) =>
    (DIFF_RANK[a.difficulty] ?? 1) - (DIFF_RANK[b.difficulty] ?? 1) ||
    (b.upvotes || 0) - (a.upvotes || 0);

  const companyCards = cards.filter((c) => c.company === company).sort(byDiffThenVotes);

  const cats = new Set(companyCards.map((c) => c.cat));
  const chosen = new Set(companyCards.map((c) => c.id));

  const padded = [...companyCards];
  if (padded.length < target) {
    const pad = cards
      .filter((c) => !chosen.has(c.id) && (cats.size === 0 || cats.has(c.cat)))
      .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    for (const c of pad) {
      if (padded.length >= target) break;
      padded.push(c);
    }
  }

  return { cards: padded, companyCount: companyCards.length };
}
