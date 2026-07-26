-- =============================================================================
-- seed_jordan_company_bank: CURATED / REPRESENTATIVE frontend interview prep,
-- organized by well-known Jordan (Amman) employers that hire frontend/React devs.
--
-- IMPORTANT: these are NOT verified "asked-at" transcripts. Each question is one a
-- candidate should reasonably EXPECT given the company domain/stack (fintech ->
-- security, content -> SSR/SEO, logistics -> RTL/scale, etc.). The deck UI renders
-- the company as "asked at X"; soften that copy in Flashcard.jsx if you want a
-- weaker claim (e.g. "prep for X").
--
-- Idempotent (NOT EXISTS guard). source=core, approved.
-- =============================================================================
INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you render a large, frequently-updating shipment-tracking list without jank?','Virtualize the list (react-window/virtualized) so only visible rows mount, give each row a **stable unique key** (shipment id, never the array index), and memoize rows with `React.memo` so unrelated updates don''t re-render the whole table. Push heavy formatting out of render.','What specifically breaks if you use the array index as the key here?','On reorder/insert React reuses the wrong DOM nodes, so row state (selection, expanded, input focus) sticks to the wrong shipment and updates look scrambled.','advanced',ARRAY['virtualization','performance','keys','react']::text[],'Aramex','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Aramex' AND q='How do you render a large, frequently-updating shipment-tracking list without jank?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'CSS','How do you build a layout that works in both LTR and Arabic RTL?','Use CSS **logical properties** (`margin-inline-start`, `padding-inline`, `inset-inline`) instead of physical `left`/`right`, set `dir="rtl"` on the root, and let fl/grid flow follow direction. Mirror only truly directional icons.','Why prefer `margin-inline-start` over `margin-left`?','`margin-inline-start` maps to the left edge in LTR and the right edge in RTL automatically, so one rule serves both directions with no overrides.','intermediate',ARRAY['rtl','i18n','logical-properties','css']::text[],'Aramex','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Aramex' AND q='How do you build a layout that works in both LTR and Arabic RTL?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','How would you debounce a tracking-search input that hits an API on each keystroke?','Wrap the handler in a debounce that resets a timer on every keystroke and only fires the request after the user pauses (~300ms), cancelling in-flight timers. This collapses a burst of keystrokes into one request.','Debounce or throttle for a typeahead — which and why?','Debounce: you only care about the final query once typing pauses. Throttle (fixed cadence) fits continuous streams like scroll/resize, not discrete typing.','intermediate',ARRAY['debounce','async','performance']::text[],'Aramex','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Aramex' AND q='How would you debounce a tracking-search input that hits an API on each keystroke?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Next.js','Why render a large Arabic knowledge base with SSR/SSG instead of pure CSR?','Server-rendered HTML is crawlable and paints content fast (good LCP/TTFB), which matters when SEO is the growth engine. CSR ships a blank shell first — worse for both crawlers and first paint.','SSG vs SSR vs ISR for articles that change occasionally?','ISR: pre-render statically for speed, then revalidate in the background on an interval so edits go live without a full rebuild — static speed with fresh content.','advanced',ARRAY['ssr','ssg','isr','seo','next']::text[],'Mawdoo3','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Mawdoo3' AND q='Why render a large Arabic knowledge base with SSR/SSG instead of pure CSR?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'HTML','What markup/meta setup improves SEO and social sharing for an article page?','Semantic structure (`article`, one `h1`, headings in order), a `meta description`, Open Graph tags (`og:title/description/image`), and JSON-LD `Article`/`FAQ` structured data so engines understand the content.','What does JSON-LD add beyond `meta` tags?','It describes entities/relationships in a machine-readable schema, enabling rich results (FAQ accordions, article cards) that plain meta tags can''t trigger.','intermediate',ARRAY['seo','meta-tags','semantic-html','open-graph']::text[],'Mawdoo3','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Mawdoo3' AND q='What markup/meta setup improves SEO and social sharing for an article page?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Performance','How do you improve Core Web Vitals (LCP and CLS) on a content page?','LCP: optimize/preload the hero image, serve modern formats, and inline critical CSS. CLS: reserve space with width/height or `aspect-ratio` on media and ads, and preload fonts with `font-display: swap` to avoid reflow.','What''s the most common cause of a bad CLS score?','Images/ads/embeds without reserved dimensions — they push content down when they load. Set explicit sizes or `aspect-ratio`.','advanced',ARRAY['core-web-vitals','performance','lcp','cls']::text[],'Mawdoo3','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Mawdoo3' AND q='How do you improve Core Web Vitals (LCP and CLS) on a content page?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','How do you localize a JS web portal for Arabic, including numbers and dates?','Externalize strings, load them per-locale, and use the `Intl` API (`Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.PluralRules`) for locale-correct numbers/dates/plurals instead of hand-rolling. Set `dir`/`lang` for RTL.','Why use `Intl` instead of manual formatting?','It handles digit systems, separators, plural categories, and calendars per locale correctly — hand-rolled formatting breaks for Arabic-Indic digits and plural rules.','intermediate',ARRAY['i18n','intl','localization','javascript']::text[],'Tamatem','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Tamatem' AND q='How do you localize a JS web portal for Arabic, including numbers and dates?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Performance','A landing page feels sluggish on low-end Android. How do you diagnose it?','Profile with Lighthouse/DevTools on throttled CPU+network, check the main-thread flame chart for long tasks, cut/def­er JS, compress images, and lazy-load below-the-fold assets. Measure before/after.','Why throttle CPU when profiling?','Your dev machine hides jank that real low-end devices hit; throttling surfaces long tasks and layout costs your users actually feel.','intermediate',ARRAY['performance','profiling','lighthouse']::text[],'Tamatem','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Tamatem' AND q='A landing page feels sluggish on low-end Android. How do you diagnose it?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','Explain closures with a simple counter example.','A closure is a function that keeps access to variables from the scope where it was defined. A `makeCounter` returns an inner function that increments a `count` held in the outer scope — the count persists between calls because the closure keeps that variable alive.','Where do closures commonly cause bugs?','Capturing a loop variable declared with `var` (all callbacks see the final value); `let` per-iteration binding fixes it.','beginner',ARRAY['closures','scope','javascript']::text[],'Tamatem','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Tamatem' AND q='Explain closures with a simple counter example.');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','What is XSS and how do you prevent it in a payments UI?','XSS is injecting attacker-controlled script into your page. Prevent it by escaping/encoding output, never building HTML from untrusted input, avoiding `innerHTML`, and adding a strict Content-Security-Policy. Treat all user/URL data as hostile.','Is a React app automatically safe from XSS?','Mostly — JSX escapes interpolated values — but `dangerouslySetInnerHTML`, `javascript:` URLs, and injected `<script>`/attributes still open holes.','advanced',ARRAY['xss','security','csp']::text[],'ProgressSoft','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='ProgressSoft' AND q='What is XSS and how do you prevent it in a payments UI?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','Where should you store a JWT in a browser, and why?','Prefer an **httpOnly, Secure, SameSite cookie** so JavaScript (and thus XSS) can''t read the token. `localStorage` is convenient but readable by any script on the page, so a single XSS leaks the token.','If you must use localStorage, how do you reduce the risk?','Short-lived access tokens + refresh rotation, a strict CSP, and rigorous output encoding — but httpOnly cookies remain safer against token theft.','advanced',ARRAY['jwt','auth','security']::text[],'ProgressSoft','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='ProgressSoft' AND q='Where should you store a JWT in a browser, and why?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you build a robust multi-step payment form?','Controlled inputs with schema validation (e.g. Zod/Yup), validate per-step and again on submit, disable the submit button while pending, and surface field-level errors accessibly. Never trust client validation alone — the server re-validates.','How do you prevent a double charge from a double-click?','Disable the button on submit and send an idempotency key so the server treats a retried request as the same transaction.','intermediate',ARRAY['forms','validation','react','idempotency']::text[],'ProgressSoft','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='ProgressSoft' AND q='How do you build a robust multi-step payment form?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','How do you safely handle money amounts in JavaScript?','Don''t use floats for money. Store amounts as integers in the smallest unit (e.g. fils/piasters) or use a decimal library, and format for display only with `Intl.NumberFormat`. Do arithmetic on the integer minor units.','Why is `0.1 + 0.2 !== 0.3` in JS?','Numbers are IEEE-754 doubles; 0.1 and 0.2 have no exact binary representation, so the sum is 0.30000000000000004.','intermediate',ARRAY['numbers','precision','money','javascript']::text[],'Madfooatcom','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Madfooatcom' AND q='How do you safely handle money amounts in JavaScript?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you prevent duplicate payments on a flaky network?','Disable the action after first click, attach a client-generated idempotency key so retries collapse server-side, and show optimistic pending state with rollback on failure. Reconcile against server truth before confirming success.','Why is an idempotency key better than just disabling the button?','The button can''t stop retries from timeouts, reloads, or the back button; the key makes the server dedupe regardless of how the request repeats.','advanced',ARRAY['idempotency','forms','ux','react']::text[],'Madfooatcom','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Madfooatcom' AND q='How do you prevent duplicate payments on a flaky network?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Performance','How do you both secure and speed up an SPA that handles payments?','Serve over HTTPS with HSTS, add a strict CSP, code-split and lazy-load routes, cache static assets with hashed filenames, and keep the payment path minimal. Security headers plus small critical JS.','What does a Content-Security-Policy actually mitigate?','It restricts which script/style/connect sources can load, sharply limiting XSS and data-exfiltration even if markup is injected.','intermediate',ARRAY['security','spa','performance','csp']::text[],'Madfooatcom','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Madfooatcom' AND q='How do you both secure and speed up an SPA that handles payments?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','Controlled vs uncontrolled components — when do you use each?','Controlled: React state is the single source of truth (`value` + `onChange`) — use when you need validation, conditional logic, or to read/transform input live. Uncontrolled: the DOM holds the value, read via a ref — fine for simple or third-party inputs.','How do you read an uncontrolled input''s value?','Attach a `ref` and read `ref.current.value` when needed (e.g. on submit).','beginner',ARRAY['controlled-components','forms','react']::text[],'Optimiza','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Optimiza' AND q='Controlled vs uncontrolled components — when do you use each?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','Explain event delegation and when to use it.','Attach one listener to a parent and use event bubbling to handle events from many children via `event.target`. It saves listeners and works for dynamically added elements.','How do you know which child was clicked?','Inspect `event.target` (often with `closest(selector)`) to find the matching child inside the parent.','intermediate',ARRAY['event-delegation','events','dom']::text[],'Optimiza','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Optimiza' AND q='Explain event delegation and when to use it.');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'TypeScript','`type` vs `interface` in TypeScript — which and why?','Both describe object shapes. `interface` supports declaration merging and reads well for public/object APIs; `type` also does unions, intersections, tuples, and mapped/conditional types. Use `interface` for object contracts, `type` for everything more complex.','Which one supports declaration merging?','`interface` — two interfaces with the same name merge. `type` aliases cannot be reopened.','intermediate',ARRAY['type-vs-interface','typescript']::text[],'Optimiza','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Optimiza' AND q='`type` vs `interface` in TypeScript — which and why?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you test a component with React Testing Library?','Render it, query by accessible role/label (not implementation details), drive it with `user-event`, and assert on what the user sees. Test behavior, not internal state.','Why avoid querying by CSS class or test-id first?','Those couple tests to implementation; role/label queries survive refactors and also verify accessibility.','intermediate',ARRAY['testing','react-testing-library','jest']::text[],'Estarta Solutions','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Estarta Solutions' AND q='How do you test a component with React Testing Library?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','Explain promises and `async`/`await`.','A Promise represents a future value (pending → fulfilled/rejected). `async`/`await` is syntax over promises: `await` pauses inside an `async` function until the promise settles, letting async code read top-to-bottom with `try/catch` for errors.','What does an `async` function always return?','A Promise — any returned value is wrapped, and a thrown error becomes a rejection.','beginner',ARRAY['promises','async','javascript']::text[],'Estarta Solutions','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Estarta Solutions' AND q='Explain promises and `async`/`await`.');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Performance','Unit vs integration vs end-to-end testing — how do they differ?','Unit tests a single function/component in isolation (fast, many). Integration tests several units together (e.g. a form + its hook). E2E drives the whole app in a real browser (Cypress/Playwright) — slow, few, highest confidence. Balance them like a pyramid.','Why keep few E2E tests?','They''re slow and flakier; you want many fast unit tests and a thin layer of E2E for critical flows.','intermediate',ARRAY['testing','ci','e2e']::text[],'Estarta Solutions','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Estarta Solutions' AND q='Unit vs integration vs end-to-end testing — how do they differ?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you manage global state in a self-care portal (auth, plan, usage)?','Keep server data (plan, usage) in a data-fetching cache like React Query, and small global UI/auth state in Context or a light store (Zustand). Don''t dump server data into Redux — it duplicates caching you get for free.','Why not put API data in Context?','Context has no caching, refetching, or stale handling and re-renders all consumers on change — a query cache handles server state far better.','intermediate',ARRAY['state-management','react-query','context','react']::text[],'Zain Jordan','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Zain Jordan' AND q='How do you manage global state in a self-care portal (auth, plan, usage)?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'CSS','How do you build a responsive dashboard grid?','Use CSS Grid with `repeat(auto-fit, minmax(240px, 1fr))` so cards reflow by available width, plus a few breakpoints for structural changes. Grid handles 2D layout better than nested flex here.','What does `minmax(240px, 1fr)` accomplish?','Each column is at least 240px and shares leftover space equally, so cards grow/wrap without media queries for every size.','intermediate',ARRAY['grid','responsive-design','css']::text[],'Zain Jordan','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Zain Jordan' AND q='How do you build a responsive dashboard grid?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Next.js','CSR vs SSR for an authenticated dashboard — which fits?','Authenticated dashboards are behind login and not SEO-sensitive, so CSR (or client-fetched data after an SSR shell) is usually fine and simpler. Reserve SSR/SSG for public, SEO-critical pages.','What''s one downside of CSR here?','Slower first meaningful paint and a flash of loading state while JS boots and fetches — acceptable for internal tools.','intermediate',ARRAY['csr','ssr','next']::text[],'Zain Jordan','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Zain Jordan' AND q='CSR vs SSR for an authenticated dashboard — which fits?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','How does the event loop order `setTimeout` vs a resolved Promise?','Promise callbacks are **microtasks** and run after the current task, before the next macrotask. `setTimeout` schedules a **macrotask**. So a resolved promise''s `.then` fires before a `setTimeout(…,0)` queued in the same tick.','What can starve the macrotask queue?','Continuously scheduling microtasks (e.g. recursive promise resolutions) keeps draining the microtask queue, delaying timers and rendering.','advanced',ARRAY['event-loop','async','microtasks','javascript']::text[],'Orange Jordan','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Orange Jordan' AND q='How does the event loop order `setTimeout` vs a resolved Promise?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you avoid unnecessary re-renders in a large form?','Isolate state so a keystroke only re-renders its field, memoize expensive children with `React.memo`, stabilize handlers/props with `useCallback`/`useMemo`, and consider uncontrolled inputs or a form lib (RHF) that avoids re-rendering on every change.','Why can `useCallback` be pointless without `React.memo`?','A stable function reference only helps if the child is memoized to skip renders on unchanged props; otherwise the child re-renders anyway.','advanced',ARRAY['performance','re-renders','react']::text[],'Orange Jordan','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Orange Jordan' AND q='How do you avoid unnecessary re-renders in a large form?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'HTML','How do you make a form accessible?','Associate every input with a `<label>` (`for`/`id`), group related controls in `fieldset`/`legend`, mark required/invalid with `aria-required`/`aria-invalid`, and announce errors via `aria-describedby` or a live region.','Why link errors with `aria-describedby`?','So screen readers read the error text when the field is focused, instead of the user hitting an unexplained invalid field.','intermediate',ARRAY['accessibility','forms','aria','html']::text[],'Orange Jordan','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Orange Jordan' AND q='How do you make a form accessible?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you display real-time weather data that updates every second efficiently?','Stream via WebSocket, but decouple network cadence from render cadence: buffer incoming data and flush to state on a throttled interval or `requestAnimationFrame`, and memoize charts so only changed series re-render.','Why not `setState` on every socket message?','High-frequency messages would trigger a render per message and flood the main thread; batching to ~1 render/frame keeps the UI smooth.','advanced',ARRAY['real-time','websockets','performance','react']::text[],'Arabia Weather','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Arabia Weather' AND q='How do you display real-time weather data that updates every second efficiently?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Performance','How do you render thousands of map markers without freezing the UI?','Cluster/aggregate markers by zoom, render on a `<canvas>`/WebGL layer instead of thousands of DOM nodes, and virtualize any list view. Only draw what''s in the viewport.','Why is canvas better than DOM for many markers?','Thousands of DOM nodes are expensive to layout/paint and blow up memory; a single canvas draws them in one pass.','advanced',ARRAY['performance','virtualization','canvas']::text[],'Arabia Weather','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Arabia Weather' AND q='How do you render thousands of map markers without freezing the UI?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','Throttling vs debouncing for a map pan/resize handler?','Throttle: run at a steady max rate (e.g. every 100ms) so the map updates smoothly during continuous movement. Debounce (run after it stops) would make the map feel frozen until the user lets go.','So which for a search box vs a scroll handler?','Debounce the search box (act on pause); throttle the scroll/resize (act at a steady cadence).','intermediate',ARRAY['throttle','debounce','events','javascript']::text[],'Arabia Weather','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Arabia Weather' AND q='Throttling vs debouncing for a map pan/resize handler?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','How does `requestAnimationFrame` help an animation/game loop?','`rAF` runs your callback right before the next repaint, synced to the display refresh (~60fps) and paused in background tabs. That yields smooth, battery-friendly animation versus `setInterval`, which drifts and can over/under-shoot frames.','Why is `setInterval(…, 16)` worse than rAF?','It isn''t synced to the vsync/paint, so frames tear or stutter and it keeps running when the tab is hidden.','intermediate',ARRAY['raf','animation','performance','javascript']::text[],'Maysalward','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Maysalward' AND q='How does `requestAnimationFrame` help an animation/game loop?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'Performance','What triggers reflow vs repaint, and how do you minimize reflow?','Reflow (layout) recomputes geometry when you change size/position or read layout properties; repaint redraws pixels for color/visibility. Minimize reflow by batching DOM reads then writes, animating `transform`/`opacity` (compositor-only), and avoiding layout-thrashing loops.','What is layout thrashing?','Alternating reads (e.g. `offsetHeight`) and writes in a loop forces the browser to reflow synchronously each iteration — batch reads and writes to avoid it.','advanced',ARRAY['reflow','repaint','performance']::text[],'Maysalward','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Maysalward' AND q='What triggers reflow vs repaint, and how do you minimize reflow?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'JavaScript','How do Web Workers help a compute-heavy web game?','A Web Worker runs JS on a separate thread, so heavy work (physics, pathfinding, parsing) doesn''t block the main thread and freeze rendering/input. Communicate via `postMessage`; workers have no DOM access.','What can''t a Web Worker do?','Touch the DOM or `window` directly — it only messages back results for the main thread to render.','intermediate',ARRAY['web-workers','performance','concurrency','javascript']::text[],'Maysalward','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Maysalward' AND q='How do Web Workers help a compute-heavy web game?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'TypeScript','How do generics make a reusable table/select component type-safe?','Parameterize the component by its row type `T` so props like `data: T[]`, `getKey: (row: T) => string`, and `columns` are checked against the actual data shape. Consumers get autocomplete and errors instead of `any`.','What do you lose by typing the data as `any[]` instead?','All safety and autocomplete — typos in field access compile fine and blow up at runtime.','advanced',ARRAY['generics','typescript','components']::text[],'Bayzat','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Bayzat' AND q='How do generics make a reusable table/select component type-safe?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','React Query vs Redux for server data — when each?','React Query owns *server state*: fetching, caching, revalidation, and stale handling with little boilerplate. Redux/Zustand is for *client state* (wizards, selections, cross-cutting UI). Many apps use Query for data and a small store for UI.','Why is it wrong to cache API data in Redux by hand?','You end up reimplementing caching, dedup, and refetch logic that a query library gives you for free — more code and more bugs.','intermediate',ARRAY['react-query','state-management','react']::text[],'Bayzat','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Bayzat' AND q='React Query vs Redux for server data — when each?');

INSERT INTO submissions (cat,q,a,fq,fa,difficulty,tags,company,status,source)
SELECT 'React','How do you structure a large React app for scale?','Organize by feature (colocate components, hooks, tests, and API per feature), keep shared UI/util layers thin, push data-fetching into hooks, and enforce boundaries so features don''t reach into each other''s internals.','Feature-based vs type-based (all components in one folder) structure?','Feature-based scales better — related code lives together, so changes stay local instead of sprawling across component/reducer/action folders.','intermediate',ARRAY['architecture','react','project-structure']::text[],'Bayzat','approved','core'
WHERE NOT EXISTS (SELECT 1 FROM submissions WHERE company='Bayzat' AND q='How do you structure a large React app for scale?');
