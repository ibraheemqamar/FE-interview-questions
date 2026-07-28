import app from "../server/app.js";

// Vercel serverless entrypoint for the whole Express API.
//
// A single Vercel function only owns the exact `/api` path segment — nested
// paths like /api/ai/tutor are routed here by a rewrite in vercel.json. But
// Vercel does not reliably preserve the original sub-path in req.url when it
// rewrites to a function, so the rewrite passes the true path as `__vpath` and
// we restore it here before handing off to Express (whose routes are all
// /api-prefixed). This is correct whether or not Vercel preserved req.url.
export default function handler(req, res) {
  try {
    const u = new URL(req.url, "http://internal");
    const vpath = u.searchParams.get("__vpath");
    if (vpath) {
      u.searchParams.delete("__vpath");
      req.url = vpath + (u.search || "");
    }
  } catch {
    // If req.url can't be parsed for any reason, fall through with it untouched.
  }
  return app(req, res);
}
