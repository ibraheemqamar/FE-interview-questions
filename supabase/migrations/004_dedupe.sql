-- =============================================================================
-- 004_dedupe: remove duplicate questions and apply improved answers on a DB that
-- was ALREADY seeded (editing the seed files only affects fresh imports).
-- Idempotent + safe to re-run. Run in the Supabase SQL editor AFTER the seeds.
--
-- Order matters: (A) collapse exact-duplicate rows first, then (B) drop reworded
-- variants, then (C)/(D) rewrite the surviving canonical/weak answers.
-- =============================================================================

BEGIN;

-- (A) Collapse EXACT duplicate rows (identical source+cat+company+question),
--     keeping the oldest copy. Generic + covers every exact dup, not just known ones.
DELETE FROM submissions s
USING (
  SELECT ctid,
         row_number() OVER (
           PARTITION BY source, cat, COALESCE(company,''), q
           ORDER BY created_at NULLS FIRST, ctid
         ) AS rn
  FROM submissions
) d
WHERE s.ctid = d.ctid AND d.rn > 1;

-- (B) Remove reworded near-duplicate variants (21).
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='Shallow copy vs deep copy?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='Deep copy vs shallow copy?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='Performance' AND q='What is the critical rendering path?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='Performance' AND q='What is the Critical Rendering Path?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='Performance' AND q='What is code splitting, and how in React?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='React' AND q='What is route-based code splitting in React?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='React' AND q='Controlled vs uncontrolled components?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='HTML' AND q='`async` vs `defer` on a `<script>`?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='What is prototypal inheritance?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='What is the difference between event bubbling and capturing?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='Debouncing vs throttling?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='Nullish coalescing (`??`) and optional chaining (`?.`)?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='JavaScript' AND q='What is immutability and why does it matter?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='Performance' AND q='How does browser caching improve performance?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='Performance' AND q='What are web workers?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='React' AND q='What is "lifting state up"?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='React' AND q='`useMemo` vs `useCallback`?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='React' AND q='What is `React.memo`?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='React' AND q='`useEffect` vs `useLayoutEffect`?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='Tailwind' AND q='What is `@apply` and when should you use it?' AND company IS NULL;
DELETE FROM submissions WHERE source='core' AND cat='TypeScript' AND q='`unknown` vs `any`?' AND company IS NULL;

-- (C) Rewrite the surviving canonical answers for merged cards (23).
UPDATE submissions SET a='- **Shallow copy** (`{...obj}`, `Object.assign({}, obj)`, `arr.slice()`): duplicates only the top level; nested objects/arrays stay **shared by reference**, so mutating a nested value affects both.
- **Deep copy**: recursively clones every level — no shared references, so the copy is fully independent. Modern built-in: `structuredClone(obj)`.', fq='What are the tradeoffs of `JSON.parse(JSON.stringify(obj))` for deep cloning?', fa='Simple and universal but **lossy**: drops `undefined`, functions, and symbols; turns `Date` into a string and `NaN`/`Infinity` into `null`; can''t handle `Map`/`Set`; and **throws on circular references**. `structuredClone(obj)` handles most of these (still no functions).', difficulty='intermediate', tags=ARRAY['shallow-copy','deep-copy','references','cloning','javascript']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='What is the difference between a shallow copy and a deep copy?' AND company IS NULL;

UPDATE submissions SET a='The sequence of steps the browser completes before it can render the initial view:
- Parse HTML → **DOM**
- Parse CSS → **CSSOM**
- Combine into the **render tree**
- **Layout** (compute geometry)
- **Paint** pixels

CSS and synchronous JS are **render-blocking**. Optimize by:
- Inline **critical (above-the-fold) CSS**, defer the rest
- Add `defer`/`async` to non-critical scripts
- Minify + compress to cut transferred bytes
- Reduce the number of critical resources and network round trips', fq='Why is CSS render-blocking, and how do you make non-critical CSS non-blocking?', fa='The browser won''t paint until the **CSSOM** is complete — painting with partial styles would cause a **flash of unstyled content** — so every `<head>` stylesheet blocks first paint. Make non-critical CSS non-blocking by inlining only above-the-fold CSS and loading the rest asynchronously, e.g. `<link rel="preload" as="style" onload="this.rel=''stylesheet''">` or a `media`-swap trick.', difficulty='intermediate', tags=ARRAY['critical-rendering-path','render-blocking','css','performance']::text[]
  WHERE source='core' AND cat='Performance' AND q='What is the critical rendering path and how do you optimize it?' AND company IS NULL;

UPDATE submissions SET a='Breaking the bundle into smaller chunks loaded **on demand** (per route/feature) instead of one giant file, so the initial download is smaller and first render is faster.

- **How:** a dynamic `import()` marks a split point the bundler emits as its own chunk.
- **In React:** `const X = lazy(() => import(''./X''))` rendered inside a `<Suspense fallback={...}>` boundary — the chunk downloads only when `X` first renders.
- **Biggest win:** split at **route** boundaries; users rarely need every page upfront.
- **Perf:** less initial JS means faster parse/execute — quicker LCP and a less-blocked main thread (INP).', fq='What''s the risk of over-splitting?', fa='Too many tiny chunks add request overhead and can cause loading **waterfalls**/jank, so split at meaningful boundaries (routes, heavy widgets) not every component. Also, every `lazy` component needs a `<Suspense>` ancestor — without one React throws "no fallback UI was specified."', difficulty='intermediate', tags=ARRAY['code-splitting','lazy-loading','suspense','routing','performance','react']::text[]
  WHERE source='core' AND cat='Performance' AND q='What is code splitting?' AND company IS NULL;

UPDATE submissions SET a='- **Controlled**: React state is the single source of truth — `value` + `onChange` drive the input.
- **Uncontrolled**: the DOM holds the value; you read it imperatively via a `ref` and set an initial value with `defaultValue`.

Controlled enables per-keystroke validation, formatting, and derived UI. Uncontrolled is simpler, closer to native HTML, and needed for **file inputs** or integrating non-React code.', fq='What warning appears if you pass `value` without `onChange`, and why?', fa='React warns you provided a `value` prop without an `onChange` handler, making the field **read-only**. Since `value` binds the input to state, with no `onChange` the state never updates and the input appears frozen. Fix with `onChange` (controlled), `readOnly`, or `defaultValue` (uncontrolled).', difficulty='intermediate', tags=ARRAY['react','controlled-components','forms','state','refs']::text[]
  WHERE source='core' AND cat='React' AND q='Controlled vs uncontrolled components — what''s the difference?' AND company IS NULL;

UPDATE submissions SET a='How each affects HTML parsing:
- **plain**: parsing **pauses** while the script downloads and executes (blocking).
- **async**: downloads in parallel, **executes as soon as ready** — order not guaranteed. Good for independent scripts (e.g. analytics).
- **defer**: downloads in parallel, **executes after parsing finishes, in document order**, just before `DOMContentLoaded`. Good for app scripts that need the DOM.

Both `async` and `defer` only apply to external scripts (`src`).', fq='Which should you use for a script that manipulates the DOM?', fa='`defer` — it runs after parsing completes (DOM ready) and preserves execution order. `async` might run before the DOM exists and in an unpredictable order.', difficulty='intermediate', tags=ARRAY['html','script-loading','performance','async','defer']::text[]
  WHERE source='core' AND cat='HTML' AND q='Difference between `<script>`, `<script async>`, and `<script defer>`?' AND company IS NULL;

UPDATE submissions SET a='```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```
Tells mobile browsers to use the **real device width** (and set initial zoom) instead of assuming a fake **~980px desktop width**, so responsive CSS and `min-width` media queries actually trigger. Without it, mobile pages render zoomed out with tiny text.', fq='Why avoid `user-scalable=no`?', fa='It disables pinch-zoom, an **accessibility failure** for low-vision users. Let people zoom.', difficulty='intermediate', tags=ARRAY['html','viewport','responsive-design','meta-tags','accessibility']::text[]
  WHERE source='core' AND cat='HTML' AND q='What does the viewport meta tag do?' AND company IS NULL;

UPDATE submissions SET a='- `===` (**strict**): compares **value and type**, no coercion.
- `==` (**loose**): **coerces types first**, which surprises: `0 == ""`, `0 == "0"`, `[] == false`, `null == undefined` are all `true`.

Prefer `===` everywhere, except the idiomatic `x == null`.', fq='What does `x == null` match?', fa='Exactly `null` and `undefined` — nothing else. A common shorthand nullish check that''s the one legitimate use of `==`.', difficulty='intermediate', tags=ARRAY['javascript','equality','coercion','operators']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='`==` vs `===`?' AND company IS NULL;

UPDATE submissions SET a='Objects inherit directly from other objects through an internal link (`[[Prototype]]`, exposed as `__proto__`). On property access, the engine walks the **prototype chain** — from the object up through its prototypes — until it finds the property or hits `null`. This is how shared methods like `Array.prototype.map` are reused without copying them onto every instance (each array delegates up the chain).', fq='What is the difference between an object''s `__proto__` and a function''s `prototype`?', fa='`prototype` is a property on **constructor functions** — the object that becomes the `[[Prototype]]` of instances created with `new`. `__proto__` is the actual `[[Prototype]]` link present on **every** object, pointing to what it inherits from. Hence `new Foo().__proto__ === Foo.prototype`.', difficulty='intermediate', tags=ARRAY['prototypes','inheritance','prototype-chain','objects']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='What is prototypal inheritance in JavaScript?' AND company IS NULL;

UPDATE submissions SET a='Two directions of DOM event travel plus a pattern that exploits them:
- **Capturing** (phase 1): travels *down* from the root to the target. Opt-in via `addEventListener(''click'', fn, { capture: true })`.
- **Bubbling** (phase 3): travels back *up* from the target to the root. This is the **default** phase.
- **Delegation**: put one listener on a parent and handle many children via `event.target`, relying on bubbling.

`event.stopPropagation()` halts further travel.', fq='A parent and child both have default click listeners, and you also want event delegation on a dynamic list — why is delegation useful here?', fa='By default the **child fires first, then the parent** (both in the bubbling phase, target → up). Delegation leans on this: one listener on the parent handles current *and* future children via `event.target`, so you never (re)bind listeners as items are added or removed.', difficulty='intermediate', tags=ARRAY['event-bubbling','event-capturing','event-delegation','dom','events','javascript']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='Event bubbling, capturing, and delegation?' AND company IS NULL;

UPDATE submissions SET a='Both limit how often a function runs during rapid, repeated events.

- **Debounce**: wait until triggering *stops* for N ms, then run once — only the last call in a burst fires. Ideal for search-as-you-type or save-draft.
- **Throttle**: run at most once every N ms *while* triggering continues — steady, rate-capped. Ideal for `scroll`, `mousemove`, resize.', fq='For a ''save draft as the user types'' feature, which do you pick and why?', fa='**Debounce** — you want to save once the user *pauses*, not on every keystroke. Waiting for a quiet gap (e.g. `500ms`) minimizes writes; throttle would keep firing mid-typing, saving incomplete input.', difficulty='intermediate', tags=ARRAY['debounce','throttle','performance','events','javascript']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='What is the difference between debouncing and throttling?' AND company IS NULL;

UPDATE submissions SET a='**`?.`** (optional chaining) safely accesses a nested property/method/index, short-circuiting to `undefined` if the value before it is `null`/`undefined` instead of throwing: `user?.address?.city`, `arr?.[0]`, `fn?.()`.

**`??`** (nullish coalescing) returns its right operand only when the left is `null`/`undefined`, otherwise the left — ideal for defaults that must preserve valid falsy values like `0` or `""`.', fq='Why use `??` instead of `||` for a default value?', fa='`||` falls back on **any** falsy value, so `count || 10` wrongly returns `10` when `count` is `0`, and `name || ''x''` overrides an empty string. `??` falls back **only** on `null`/`undefined`, so `0 ?? 10` correctly stays `0`. Use `??` when `0`, `""`, or `false` are legitimate values.', difficulty='intermediate', tags=ARRAY['optional-chaining','nullish-coalescing','es2020','javascript']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='What do optional chaining (`?.`) and nullish coalescing (`??`) do?' AND company IS NULL;

UPDATE submissions SET a='Not changing data in place — instead you produce a **new copy** with the change (`{...obj, k: v}`, `[...arr, x]`). Why it matters:
- Prevents bugs from **shared mutable references**
- Makes state changes **explicit and traceable**
- Enables cheap **equality checks by reference** (`prev === next`)
- Underpins **React/Redux change detection** — a new reference signals a re-render', fq='Does `const` make a value immutable?', fa='No — `const` only prevents **reassigning the binding**. The value itself can still be mutated: `const a = []; a.push(1)` is legal. True immutability needs `Object.freeze`, a library like **Immer**, or the discipline of only ever creating copies.', difficulty='intermediate', tags=ARRAY['immutability','references','state-management','const']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='What is immutability, and why does it matter in JavaScript?' AND company IS NULL;

UPDATE submissions SET a='Google''s key UX metrics that influence search ranking:
- **LCP** (Largest Contentful Paint) — loading; target `< 2.5s`.
- **INP** (Interaction to Next Paint) — responsiveness; `< 200ms` (replaced FID in 2024).
- **CLS** (Cumulative Layout Shift) — visual stability; `< 0.1`.', fq='Why did INP replace FID, and what commonly hurts CLS?', fa='**INP vs FID**: FID only measured the *first* interaction''s input delay; INP captures overall responsiveness across *all* interactions.

**CLS culprits**: images/ads/iframes without reserved dimensions, and web fonts causing reflow. Fix with explicit `width`/`height` (or `aspect-ratio`) and tuned `font-display`.', difficulty='intermediate', tags=ARRAY['performance','core-web-vitals','lcp','inp','cls','web-performance']::text[]
  WHERE source='core' AND cat='Performance' AND q='What are the Core Web Vitals?' AND company IS NULL;

UPDATE submissions SET a='**Dead-code elimination** at build time: the bundler drops exports you never import, shrinking the bundle. Relies on **ES modules''** static `import`/`export` structure, so only code that''s actually reachable ships.', fq='Why can `import * as _ from ''lodash''` defeat tree shaking?', fa='Whole-namespace (or CommonJS) imports pull the entire library and can''t be statically analyzed per-function, so the bundler keeps everything. Use named imports from `lodash-es` (or deep paths like `lodash/get`) so only the functions you use are bundled.', difficulty='intermediate', tags=ARRAY['performance','bundling','tree-shaking','es-modules','webpack']::text[]
  WHERE source='core' AND cat='Performance' AND q='What is tree shaking?' AND company IS NULL;

UPDATE submissions SET a='Cached responses skip the network on repeat visits. Layers:
- **Browser HTTP cache** — `Cache-Control`/`ETag` govern freshness and revalidation.
- **CDN** — caches at edge nodes close to users.
- **Service Worker** — programmatic/offline caching under your control.

The key pattern: a long `max-age` plus **content-hashed filenames** (`app.3f9a.js`) means files cache ''forever'' while a new deploy just changes the hash.', fq='Why hash filenames instead of just using a short max-age?', fa='Hashing lets you cache **immutably** (e.g. a year) AND update instantly: the URL changes only when content changes, so browsers fetch new files and keep old ones cached. A short `max-age` forces slow revalidation on every visit and still risks serving stale assets.', difficulty='intermediate', tags=ARRAY['performance','caching','http-cache','cache-busting','cdn']::text[]
  WHERE source='core' AND cat='Performance' AND q='How does caching improve performance?' AND company IS NULL;

UPDATE submissions SET a='**Web Workers** run JavaScript on a **background thread** separate from the main/UI thread, so CPU-heavy work (parsing, image processing, computation) doesn''t freeze rendering or input.

- No DOM access — can''t touch `window`/`document`.
- Communicate with the main thread by message passing: `postMessage` / `onmessage`.
- Data is **copied** via structured clone, not shared, so results are posted back to update the UI.', fq='How do you share large data with a worker without the cost of copying it?', fa='Use **transferable objects** — pass an `ArrayBuffer` (or its typed array''s `.buffer`) as the second `postMessage` argument to *transfer* ownership instead of cloning. It''s near-instant, but the sender loses access. `SharedArrayBuffer` goes further, giving true shared memory across threads.', difficulty='intermediate', tags=ARRAY['web-workers','concurrency','performance','threads']::text[]
  WHERE source='core' AND cat='JavaScript' AND q='What are Web Workers and what are they for?' AND company IS NULL;

UPDATE submissions SET a='When two or more components need to share or stay in sync with the same data, move that state to their **closest common ancestor** and pass it down as props (with callbacks to update it). The ancestor becomes the **single source of truth**, so siblings stay consistent instead of holding diverging copies.', fq='What''s the main downside of lifting state up, and how do you mitigate it?', fa='It causes **prop drilling** (threading props through intermediate components that don''t use them) and re-renders the whole subtree on each change. Mitigate with:
- **Context** for widely-shared values
- **Composition** via `children` to skip layers
- A **state library** with selectors for fine-grained subscriptions', difficulty='intermediate', tags=ARRAY['lifting-state','state','props','data-flow','react']::text[]
  WHERE source='core' AND cat='React' AND q='What does "lifting state up" mean in React?' AND company IS NULL;

UPDATE submissions SET a='- **`useMemo(fn, deps)`** memoizes a computed **value** so an expensive calculation doesn''t re-run every render.
- **`useCallback(fn, deps)`** memoizes a **function reference** so its identity stays stable across renders.

Both skip recomputation until a dependency changes. `useCallback(fn, deps)` is just `useMemo(() => fn, deps)`. Use them to avoid wasted work or re-renders — not everywhere.', fq='When is memoization actually worth it — and when does it hurt?', fa='Worth it when the value is expensive to compute, or when a value/function is passed to a `memo`-ized child or used as another hook''s dependency (stable identity prevents re-renders). For cheap work it hurts: the caching plus dependency-comparison overhead can exceed the savings and adds complexity.', difficulty='intermediate', tags=ARRAY['react','hooks','usememo','usecallback','memoization','performance']::text[]
  WHERE source='core' AND cat='React' AND q='When should you use `useMemo` vs `useCallback`?' AND company IS NULL;

UPDATE submissions SET a='A higher-order component that **skips re-rendering** when its props are **shallow-equal** to the previous render — it memoizes the rendered output by props. Best for **expensive, pure** components.', fq='Why might a `memo` component still re-render every time?', fa='If a parent passes a **new object/array/function** created inline each render, the shallow compare sees a different **reference** and bails. Stabilize those props with `useMemo`/`useCallback`.', difficulty='intermediate', tags=ARRAY['react','performance','memoization','hooks']::text[]
  WHERE source='core' AND cat='React' AND q='What does `React.memo` do?' AND company IS NULL;

UPDATE submissions SET a='Both run after render, but timing differs:
- **`useEffect`** — fires **asynchronously after the browser paints**. The default; non-blocking.
- **`useLayoutEffect`** — fires **synchronously after DOM mutation but before paint**. Use it to measure layout or mutate the DOM without a visible flicker.', fq='Why prefer `useEffect` by default, and when must you use `useLayoutEffect`?', fa='`useLayoutEffect` blocks painting, so heavy work there hurts perceived performance, and it warns during SSR (no DOM). Reach for it only when you must **read/write layout before paint** to avoid a visible flicker — e.g. measuring an element then adjusting its position.', difficulty='intermediate', tags=ARRAY['react','hooks','useeffect','uselayouteffect','rendering']::text[]
  WHERE source='core' AND cat='React' AND q='`useLayoutEffect` vs `useEffect`?' AND company IS NULL;

UPDATE submissions SET a='`@apply` inlines Tailwind utility classes into a custom CSS rule:

```css
.btn { @apply px-4 py-2 rounded bg-blue-500; }
```

- **Use sparingly** — small repeated primitives, third-party/base overrides you can''t reach with utilities.
- **Avoid overusing it**: it rebuilds the big, semantic-CSS file Tailwind set out to eliminate and loses the co-location of styles with markup.', fq='What''s the preferred alternative for reuse in a React app?', fa='A **component** that encapsulates the utilities (e.g. `<Button>`), so the abstraction lives in one place and stays composable — rather than a hidden CSS class.', difficulty='intermediate', tags=ARRAY['tailwind','css','apply','utility-classes']::text[]
  WHERE source='core' AND cat='Tailwind' AND q='What does `@apply` do, and when should you avoid it?' AND company IS NULL;

UPDATE submissions SET a='Both describe object shapes. Key differences:

- **`interface`** — supports **declaration merging** (reopening to add members) and reads cleanly for public object/class contracts; `extends` for inheritance.
- **`type`** — more flexible: unions, intersections, tuples, mapped/conditional types, and primitive aliases.

For a plain object shape, either works; reach for `type` when you need anything beyond an object shape.', fq='Which can represent a union like `''a'' | ''b''`, and why?', fa='Only `type` — e.g. `type Status = ''a'' | ''b''`. An `interface` can only describe an object shape, so it can''t alias a union, primitive, or tuple.', difficulty='intermediate', tags=ARRAY['typescript','types','interface','type-alias']::text[]
  WHERE source='core' AND cat='TypeScript' AND q='`type` vs `interface`?' AND company IS NULL;

UPDATE submissions SET a='- **`any`** — opts out of type checking entirely; anything goes (unsafe, lets bugs through).
- **`unknown`** — the **type-safe top type**: you can assign anything to it, but must **narrow** it (`typeof`/`instanceof`/type guards) before use. Prefer it at boundaries (`catch`, parsed JSON).
- **`never`** — the bottom type; values that never occur (a function that always throws, an impossible/exhausted branch).', fq='What''s the default type of a `catch` variable in modern TS?', fa='`unknown` (with `useUnknownInCatchVariables`, on under `strict`). You must narrow it before touching `.message`.', difficulty='intermediate', tags=ARRAY['typescript','types','type-safety','unknown','never']::text[]
  WHERE source='core' AND cat='TypeScript' AND q='`any` vs `unknown` vs `never`?' AND company IS NULL;

-- (D) Improve weak stand-alone answers (6).
UPDATE submissions SET a='All four render bold/italic by default, but the meaning differs:
- **`strong`/`em`** carry **semantic importance/emphasis** and are conveyed by screen readers (often via intonation).
- **`b`/`i`** don''t add importance. `b` just draws attention (keywords, product names); `i` marks an alternate voice/mood (foreign phrases, technical/taxonomic terms).

Use `strong`/`em` when the *meaning* changes; `b`/`i` for typographic offset only.', fq='Are `<b>` and `<i>` purely presentational?', fa='Not quite — the common "they mean nothing" claim is outdated. In HTML5 they carry **subtle, non-vocal** semantics: `b` = text drawn attention to (keywords, product names), `i` = alternate voice/mood (foreign phrases, technical terms). What they lack is the **importance/emphasis** of `strong`/`em`, so screen readers don''t stress them.'
  WHERE source='core' AND cat='HTML' AND q='`<strong>`/`<b>` and `<em>`/`<i>` — what''s the difference?' AND company IS NULL;

UPDATE submissions SET a='It forcibly overrides normal cascade resolution. Avoid it because it breaks the natural cascade, is hard to override (needs another `!important`), and complicates debugging. Legitimate uses are rare.', fq='You must override a third-party inline style you can''t edit — what actually works?', fa='Add `!important` to your stylesheet rule — a stylesheet declaration marked `!important` beats a *normal* inline style. (Only an inline style that itself uses `!important` would still win.) Raising selector **specificity won''t help**: any inline style outranks every selector. Cleaner long-term fix: wrap or replace the component.'
  WHERE source='core' AND cat='CSS' AND q='When should you use `!important`, and why avoid it?' AND company IS NULL;

UPDATE submissions SET a='- `Map`: any key type (objects, functions), preserves insertion order, has `.size`, easy iteration, no prototype collisions.
- `Object`: string/symbol keys, JSON-friendly, best for fixed-shape records.

Reach for `Map` on frequent add/remove or non-string keys.', fq='Name a subtle bug from using a plain object as a hash map.', fa='Inherited prototype keys leak in: `obj[''toString'']` returns a function even for a key you never set, so a membership check can be wrong. A user-supplied key `''__proto__''` can corrupt the object''s prototype, and a key named `''hasOwnProperty''` shadows the method, breaking `obj.hasOwnProperty(k)`. `Map` (or `Object.create(null)`) avoids all of this.'
  WHERE source='core' AND cat='JavaScript' AND q='`Map` vs plain object for key-value data?' AND company IS NULL;

UPDATE submissions SET a='**Decouple network cadence from render cadence.** Stream via WebSocket, but don''t `setState` on every message when they arrive faster than the screen paints: buffer incoming data and flush to state on a throttled interval or via `requestAnimationFrame` (~1 render/frame). Memoize charts/rows with `React.memo` so only changed series re-render, and keep heavy formatting out of render. At a genuine ~1 update/sec a plain `setState` per message is already fine — batching earns its keep only once updates get bursty, sub-second, or hit many series at once.', fq='When does calling `setState` on every socket message actually cause jank?', fa='Only when messages arrive faster than the browser can paint (bursty, sub-second, or many series updating together): each `setState` can trigger its own render and overwhelm the main thread. Throttling to ~1 render/frame caps the work regardless of message rate. At a steady one message per second there''s no problem — the technique matters as the rate climbs.'
  WHERE source='core' AND cat='React' AND q='How do you display real-time weather data that updates every second efficiently?' AND company='Arabia Weather';

UPDATE submissions SET a='**LCP**: optimize and preload the hero image, serve modern formats (WebP/AVIF), and inline critical CSS to speed first paint.

**CLS**: reserve space with `width`/`height` or `aspect-ratio` on images, ads, and embeds; and preload web fonts, matching fallback metrics with `size-adjust`/`ascent-override` (or `font-display: optional`) so a late font swap doesn''t reflow the layout.', fq='What''s the most common cause of a bad CLS score?', fa='Images, ads, and embeds inserted without reserved dimensions — they push existing content down when they load. Fix by setting explicit `width`/`height` or an `aspect-ratio` so the browser reserves the space up front.'
  WHERE source='core' AND cat='Performance' AND q='How do you improve Core Web Vitals (LCP and CLS) on a content page?' AND company='Mawdoo3';

UPDATE submissions SET a='Bracketed folder names:
- `[id]` → one dynamic segment (`/post/123`).
- `[...slug]` → catch-all (`/a/b/c`).
- `[[...slug]]` → optional catch-all (also matches the base path).

The values arrive in the `params` prop. In **Next 15+ `params` is a Promise**, so `await` it in a Server Component (or `use()` it in a Client Component):

```jsx
export default async function Page({ params }) {
  const { id } = await params;
}
```

(In Next 14 and earlier, `params` was a plain object you read directly.)', fq='How do you pre-render dynamic pages at build time?', fa='Export `generateStaticParams()` returning the list of params; Next statically generates one page per entry — the App Router equivalent of `getStaticPaths`.'
  WHERE source='core' AND cat='Next.js' AND q='How do dynamic routes work in the App Router?' AND company IS NULL;

COMMIT;

-- Optional: clean progress rows orphaned by the deletes above (safe, inert data).
-- DELETE FROM user_progress up
--   WHERE up.card_ref ~ '^[0-9a-f-]{36}$'
--     AND NOT EXISTS (SELECT 1 FROM submissions s WHERE s.id::text = up.card_ref);
