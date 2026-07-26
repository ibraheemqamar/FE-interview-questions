import { supabase } from "./supabase.js";

// Base URL for the Node API. Same-origin "/api" by default (Vite proxies it in
// dev; in prod point VITE_API_URL at your deployed server if it's on another host).
const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

// Attach the current Supabase access token so the server can identify the user
// and check admin status.
async function authHeader() {
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { ...(await authHeader()) };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    // Prefer a validation list, then a single error message, then the status.
    const msg = data?.errors?.join(" · ") || data?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
