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
};

// Order the chips + browse list follow. Next.js sits right after React.
export const CAT_ORDER = [
  "HTML",
  "CSS",
  "JavaScript",
  "Tailwind",
  "React",
  "Next.js",
  "TypeScript",
  "Performance",
];
