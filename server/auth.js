import { admin, anon } from "./supabase.js";

// Pull the Bearer token off the Authorization header.
function bearer(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

// Resolve the current user from the Supabase access token (if any).
// Attaches req.user (or null). Never throws — downstream guards decide.
export async function attachUser(req, _res, next) {
  req.user = null;
  req.isAdmin = false;
  const token = bearer(req);
  if (!token) return next();

  const { data, error } = await anon.auth.getUser(token);
  if (error || !data?.user) return next();
  req.user = data.user;

  // Admin = email present in the `admins` table (checked with service role).
  const { data: row } = await admin
    .from("admins")
    .select("email")
    .eq("email", req.user.email)
    .maybeSingle();
  req.isAdmin = !!row;
  next();
}

// Guard: require a signed-in user.
export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Sign in required." });
  next();
}

// Guard: require an admin.
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Sign in required." });
  if (!req.isAdmin) return res.status(403).json({ error: "Admin access required." });
  next();
}
