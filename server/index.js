import express from "express";
import cors from "cors";
import { PORT, CORS_ORIGINS } from "./env.js";
import { attachUser } from "./auth.js";
import questions from "./routes/questions.js";
import ai from "./routes/ai.js";

const app = express();

app.use(cors({ origin: CORS_ORIGINS }));
app.use(express.json({ limit: "1mb" }));

// Resolve req.user / req.isAdmin from the Bearer token on every request.
app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", questions);
app.use("/api/ai", ai);

// JSON 404 for unknown API routes.
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

app.listen(PORT, () => {
  console.log(`[server] API listening on http://localhost:${PORT}`);
});
