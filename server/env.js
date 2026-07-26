// Load environment variables from .env.local (preferred) then .env, without
// overriding anything already set in the real environment (e.g. on the host).
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config(); // .env

export const PORT = process.env.PORT || 3001;
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Google Gemini — powers the AI tutor + mock grader (server-side ONLY; never a
// VITE_* var). When GEMINI_API_KEY is absent, the /api/ai routes return 503
// and the rest of the app keeps working. Free key: https://aistudio.google.com/apikey
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const AI_MODEL = process.env.AI_MODEL || "gemini-3.5-flash";

// CORS: comma-separated list of allowed origins for the browser app.
export const CORS_ORIGINS = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Fail fast with a clear message if the server is misconfigured.
const missing = [];
if (!SUPABASE_URL) missing.push("SUPABASE_URL");
if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
if (!SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
if (missing.length) {
  console.error(
    `\n[server] Missing env vars: ${missing.join(", ")}.\n` +
      `Add them to .env.local (see .env.example). The server needs the ` +
      `SERVICE ROLE key — keep it secret, never expose it to the browser.\n`
  );
}
