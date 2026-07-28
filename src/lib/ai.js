import { supabase } from "./supabase.js";
import { apiFetch } from "./api.js";

const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

async function authHeader() {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Shared SSE POST helper. Streams `data: {...}` frames, calling onText(chunk)
// as tokens arrive; resolves on {done:true}, throws on {error}. Pass an
// AbortSignal to cancel.
async function streamSSE(path, body, { onText, signal } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok || !res.body) {
    // Non-stream error paths return JSON (503/401/404/429/400).
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j?.error || msg;
    } catch {
      /* keep default */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line.
    let sep;
    while ((sep = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, sep);
      buf = buf.slice(sep + 2);
      const line = frame.split("\n").find((l) => l.startsWith("data:"));
      if (!line) continue;
      const payload = JSON.parse(line.slice(5).trim());
      if (payload.error) throw new Error(payload.error);
      if (payload.done) return;
      if (payload.text) onText?.(payload.text);
    }
  }
}

// P2.1 — stream the AI tutor's explanation for a flashcard.
export function streamTutor(questionId, mode, opts = {}) {
  return streamSSE("/ai/tutor", { questionId, mode }, opts);
}

// Practice — stream the AI coach's hint / review / explain-failure for a problem.
export function streamAssist(problemId, { mode, code, failingTest }, opts = {}) {
  return streamSSE(`/problems/${problemId}/assist`, { mode, code, failingTest }, opts);
}

// P2.2 — grade a candidate's answer against the stored answer.
// Returns { score, verdict, strengths[], gaps[], followUp }.
export function gradeAnswer(questionId, answer) {
  return apiFetch("/ai/mock", { method: "POST", body: { questionId, answer } });
}
