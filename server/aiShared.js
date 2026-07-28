import { aiEnabled } from "./gemini.js";

// Shared middleware for AI-backed routes (the tutor/grader in routes/ai.js and
// the Practice assist in routes/problems.js), so there's ONE implementation.

// Short-circuit to 503 when no AI key is configured, so the rest of the app
// keeps working without AI.
export function requireAiEnabled(_req, res, next) {
  if (!aiEnabled) {
    return res.status(503).json({ error: "AI features are not configured on this server." });
  }
  next();
}

// Naive per-user sliding-window rate limit (in-memory; resets on restart and
// does NOT coordinate across multiple server instances — enough to stop a
// runaway loop from burning the API budget on a single-instance deploy).
// Each caller gets its OWN counter Map, so different features are limited
// independently.
export function makeRateLimiter({ max, windowMs }) {
  const hits = new Map(); // userId -> number[] (timestamps)
  return function rateLimit(req, res, next) {
    const now = Date.now();
    const arr = (hits.get(req.user.id) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) {
      return res
        .status(429)
        .json({ error: "Too many AI requests. Please wait a bit and retry." });
    }
    arr.push(now);
    hits.set(req.user.id, arr);
    next();
  };
}
