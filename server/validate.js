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
  "Accessibility",
  "Testing",
  "Git",
  "Security",
  "System Design",
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

// ===========================================================================
// Practice — coding problems. Same "server is the single source of truth for
// what's valid" rule as validateQuestion above.
// ===========================================================================

const PROBLEM_LIMITS = {
  slug: 80,
  title: 120,
  prompt_md: 8000,
  starter_code: 8000,
  solution_code: 8000,
  tc_name: 120,
  tc_call: 2000,
  tc_expect: 2000,
  test_cases: 40,
  company: 80,
  tag: 40,
  tags: 12,
};

// url-friendly slug: lowercase, alphanumeric + single hyphens, no leading/trailing.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, PROBLEM_LIMITS.slug);
}

// Validates + normalizes the test_cases array. Each case is
// { name, call, expect } of JS-expression *strings* evaluated in the sandbox.
function normalizeTestCases(raw, errors) {
  if (raw == null) return [];
  if (!Array.isArray(raw)) {
    errors.push("test_cases must be an array");
    return [];
  }
  if (raw.length > PROBLEM_LIMITS.test_cases) {
    errors.push(`test_cases must have ≤ ${PROBLEM_LIMITS.test_cases} cases`);
  }
  const out = [];
  raw.slice(0, PROBLEM_LIMITS.test_cases).forEach((tc, i) => {
    const name = str(tc?.name);
    const call = str(tc?.call);
    const expect = str(tc?.expect);
    if (!call) errors.push(`test_cases[${i}].call is required`);
    if (call.length > PROBLEM_LIMITS.tc_call) errors.push(`test_cases[${i}].call must be ≤ ${PROBLEM_LIMITS.tc_call} chars`);
    if (expect.length > PROBLEM_LIMITS.tc_expect) errors.push(`test_cases[${i}].expect must be ≤ ${PROBLEM_LIMITS.tc_expect} chars`);
    if (name.length > PROBLEM_LIMITS.tc_name) errors.push(`test_cases[${i}].name must be ≤ ${PROBLEM_LIMITS.tc_name} chars`);
    out.push({ name: name || `test ${i + 1}`, call, expect });
  });
  return out;
}

// Validates + normalizes an incoming problem body.
// Returns { ok: true, value } or { ok: false, errors: [...] }.
export function validateProblem(body = {}) {
  const errors = [];

  const title = str(body.title);
  // Slug defaults to a slugified title when omitted; otherwise must be valid.
  const slug = str(body.slug) ? slugify(body.slug) : slugify(title);
  const prompt_md = str(body.prompt_md);
  const category = str(body.category);
  const difficulty = str(body.difficulty) || "intermediate";
  const starter_code = typeof body.starter_code === "string" ? body.starter_code : "";
  const solution_code = str(body.solution_code);
  const company = str(body.company);

  if (!title) errors.push("title is required");
  if (title.length > PROBLEM_LIMITS.title) errors.push(`title must be ≤ ${PROBLEM_LIMITS.title} chars`);
  if (!slug) errors.push("slug is required (or a non-empty title to derive it from)");
  else if (!SLUG_RE.test(slug)) errors.push("slug must be lowercase letters, numbers and single hyphens");
  if (!prompt_md) errors.push("prompt_md is required");
  if (prompt_md.length > PROBLEM_LIMITS.prompt_md) errors.push(`prompt_md must be ≤ ${PROBLEM_LIMITS.prompt_md} chars`);
  if (!CATEGORIES.includes(category)) errors.push(`category must be one of: ${CATEGORIES.join(", ")}`);
  if (!DIFFICULTIES.includes(difficulty)) errors.push(`difficulty must be one of: ${DIFFICULTIES.join(", ")}`);
  if (starter_code.length > PROBLEM_LIMITS.starter_code) errors.push(`starter_code must be ≤ ${PROBLEM_LIMITS.starter_code} chars`);
  if (solution_code.length > PROBLEM_LIMITS.solution_code) errors.push(`solution_code must be ≤ ${PROBLEM_LIMITS.solution_code} chars`);
  if (company.length > PROBLEM_LIMITS.company) errors.push(`company must be ≤ ${PROBLEM_LIMITS.company} chars`);

  const test_cases = normalizeTestCases(body.test_cases, errors);

  const tags = normalizeTags(body.tags);
  if (tags.some((t) => t.length > PROBLEM_LIMITS.tag)) errors.push(`each tag must be ≤ ${PROBLEM_LIMITS.tag} chars`);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      slug,
      title,
      prompt_md,
      category,
      difficulty,
      starter_code,
      solution_code: solution_code || null,
      test_cases,
      company: company || null,
      tags,
    },
  };
}
