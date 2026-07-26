import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY, AI_MODEL } from "./env.js";

// The AI features are optional: with no key configured, `ai` is null and the
// /api/ai routes short-circuit to 503 so the rest of the app is unaffected.
export const aiEnabled = !!GEMINI_API_KEY;

export const ai = aiEnabled ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export const MODEL = AI_MODEL;

// Disable "thinking" for latency/cost — these are grounded, well-scoped tasks.
// thinkingBudget 0 turns it off on the Gemini 2.5 Flash family; harmless on 2.0.
export const THINKING_OFF = { thinkingBudget: 0 };

if (!aiEnabled) {
  console.warn(
    "[server] GEMINI_API_KEY not set — AI tutor + mock grader disabled. " +
      "Add it to .env.local (free key at https://aistudio.google.com/apikey) to enable /api/ai."
  );
}
