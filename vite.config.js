import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Base public path. Defaults to "/" (Vercel, custom domains, local dev). For a
// GitHub Pages *project* site the app is served from "/<repo>/", so the deploy
// workflow sets VITE_BASE="/FE-interview-questions/".
const base = process.env.VITE_BASE || "/";

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Frontend Interview Deck",
        short_name: "FE Deck",
        description:
          "Crowdsourced, company-tagged frontend interview questions with spaced repetition.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
        navigateFallback: `${base}index.html`,
        // API + Supabase requests must hit the network, not the SPA shell.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // The approved deck — serve instantly from cache, revalidate in the
            // background (stale-while-revalidate) so studying works offline.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && url.pathname.endsWith("/api/questions"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-questions",
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheet + font files (best-effort offline).
            urlPattern: ({ url }) =>
              url.origin === "https://fonts.googleapis.com" ||
              url.origin === "https://fonts.gstatic.com",
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Keep the service worker out of `vite dev`; it activates in build/preview.
      devOptions: { enabled: false },
    }),
  ],
  server: {
    // Proxy API calls to the Node/Express backend during development so the
    // frontend can use same-origin "/api" everywhere.
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
