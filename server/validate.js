// Server-side business rules for questions. This is the single place that
// decides what a valid question looks like — the browser can't bypass it.

// Keep in sync with src/data/categories.js (CAT_ORDER).
export const CATEGORIES = [
  "HTML",
  "CSS",
  "JavaScript",
  "Tailwind",
  "React",
  "Next.js",
  "TypeScript",
  "Performance",
];

export const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

const LIMITS = {
  q: 500,
  a: 8000,
  fq: 500,
  fa: 8000,
  company: 80,
  tag: 40,
  tags: 12,
};

const str = (v) => (typeof v === "string" ? v.trim() : "");

function normalizeTags(tags) {
  const arr = Array.isArray(tags)
    ? tags
    : String(tags || "").split(",");
  return [...new Set(
    arr.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
  )].slice(0, LIMITS.tags);
}

// Validates + normalizes an incoming question body.
// Returns { ok: true, value } or { ok: false, errors: [...] }.
export function validateQuestion(body = {}) {
  const errors = [];

  const cat = str(body.cat);
  const q = str(body.q);
  const a = str(body.a);
  const fq = str(body.fq);
  const fa = str(body.fa);
  const difficulty = str(body.difficulty) || "intermediate";
  const company = str(body.company);

  if (!CATEGORIES.includes(cat)) errors.push(`cat must be one of: ${CATEGORIES.join(", ")}`);
  if (!q) errors.push("q (question) is required");
  if (q.length > LIMITS.q) errors.push(`q must be ≤ ${LIMITS.q} chars`);
  if (!a) errors.push("a (answer) is required");
  if (a.length > LIMITS.a) errors.push(`a must be ≤ ${LIMITS.a} chars`);
  if (fq.length > LIMITS.fq) errors.push(`fq must be ≤ ${LIMITS.fq} chars`);
  if (fa.length > LIMITS.fa) errors.push(`fa must be ≤ ${LIMITS.fa} chars`);
  if (fa && !fq) errors.push("fa (follow-up answer) requires fq (follow-up question)");
  if (!DIFFICULTIES.includes(difficulty)) errors.push(`difficulty must be one of: ${DIFFICULTIES.join(", ")}`);
  if (company.length > LIMITS.company) errors.push(`company must be ≤ ${LIMITS.company} chars`);

  const tags = normalizeTags(body.tags);
  if (tags.some((t) => t.length > LIMITS.tag)) errors.push(`each tag must be ≤ ${LIMITS.tag} chars`);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: { cat, q, a, fq, fa, difficulty, company: company || null, tags },
  };
}
