import express from "express";
import cors from "cors";
import { CORS_ORIGINS } from "./env.js";
import { attachUser } from "./auth.js";
import questions from "./routes/questions.js";
import problems from "./routes/problems.js";
import ai from "./routes/ai.js";

// The Express app, with no server bound to a port. `server/index.js` calls
// app.listen() for local dev; `api/[...path].js` exports it as a Vercel
// serverless function. Keeping the app free of listen() lets both reuse it.
const app = express();

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: "1mb" }));

// Resolve req.user / req.isAdmin from the Bearer token on every request.
app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", questions);
app.use("/api", problems);
app.use("/api/ai", ai);

// JSON 404 for unknown API routes.
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

export default app;
