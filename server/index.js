import app from "./app.js";
import { PORT } from "./env.js";

// Local development entrypoint. In production on Vercel the same `app` is served
// by api/[...path].js as a serverless function (no long-running process).
app.listen(PORT, () => {
  console.log(`[server] API listening on http://localhost:${PORT}`);
});
