// Vercel serverless entrypoint. Every /api/* request is routed here by the
// filesystem (the [...path] catch-all), and the Express app matches it against
// its own /api-prefixed routes. An Express app is itself a (req, res) handler,
// so it can be exported directly as the function.
import app from "../server/app.js";

export default app;
