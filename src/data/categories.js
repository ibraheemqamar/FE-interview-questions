// Category metadata: accent color (c) + display label, keyed by category id.
// Ported from the original deck; "Next.js" is the new stack added in the React version.
export const CAT_META = {
  "HTML":       { c: "#ff7849", label: "HTML" },
  "CSS":        { c: "#b98bff", label: "CSS" },
  "JavaScript": { c: "#f5c518", label: "JavaScript" },
  "Tailwind":   { c: "#2dd4bf", label: "Tailwind" },
  "React":      { c: "#38bdf8", label: "React" },
  "Next.js":    { c: "#f472b6", label: "Next.js" },
  "TypeScript": { c: "#5b8def", label: "TypeScript" },
  "Performance":{ c: "#35d0a0", label: "Performance" },
  "Accessibility": { c: "#a78bfa", label: "Accessibility" },
  "Testing":       { c: "#22d3ee", label: "Testing" },
  "Git":           { c: "#94a3b8", label: "Git" },
  "Security":      { c: "#ef4444", label: "Security" },
  "System Design": { c: "#e879f9", label: "System Design" },
};

// Order the chips + browse list follow. Next.js sits right after React;
// the cross-cutting topics (a11y → system design) follow the core web stack.
export const CAT_ORDER = [
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
