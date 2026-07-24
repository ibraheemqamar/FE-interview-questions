// Auto-migrated verbatim from the original frontend-interview-flashcards.html deck.
// New questions live in newCards.js; both are merged in cards.js.
export const existingCards = [
  {
    "cat": "HTML",
    "q": "What does the `<!DOCTYPE html>` declaration do?",
    "a": "Tells the browser to render in **standards mode** instead of **quirks mode** (which emulates legacy, non-standard behavior). `<!DOCTYPE html>` is the HTML5 doctype. It's not a tag — it's an instruction to the parser.",
    "fq": "What actually breaks in quirks mode?",
    "fa": "The classic one is the box model — widths start including padding/border (like `border-box`), so layouts shift. Various other legacy CSS quirks and inconsistent defaults also kick in."
  },
  {
    "cat": "HTML",
    "q": "Difference between block, inline, and inline-block elements?",
    "a": "- **Block** (`div`, `p`): starts on a new line, takes full width, respects `width`/`height` and vertical margins.\n- **Inline** (`span`, `a`): flows within text, only as wide as its content, ignores `width`/`height` and vertical margins.\n- **Inline-block**: flows inline but respects `width`, `height`, and all margins — a hybrid.",
    "fq": "Why does setting a height on an inline element do nothing?",
    "fa": "Inline boxes are sized by the line/content flow, so `width` and `height` simply don't apply. Switch to `inline-block` or `block` if you need dimensions."
  },
  {
    "cat": "HTML",
    "q": "What are semantic HTML elements and why use them?",
    "a": "Elements that describe their **meaning** (`header`, `nav`, `main`, `article`, `section`, `footer`) rather than just appearance (`div`, `span`). Benefits: accessibility (screen readers understand structure), SEO, and more readable, maintainable code.",
    "fq": "Do semantic tags improve SEO directly, or only accessibility?",
    "fa": "Both, but the SEO benefit is indirect — engines use structure to understand hierarchy. The guaranteed win is accessibility and maintainability."
  },
  {
    "cat": "HTML",
    "q": "What's the difference between `<div>` and `<span>`?",
    "a": "Both are generic containers with no semantic meaning. `div` is **block-level** (layout chunks); `span` is **inline** (styling/targeting text within a line).",
    "fq": "Is it valid to put a `<div>` inside a `<p>`?",
    "fa": "No — a `p` can only contain phrasing (inline) content. The browser auto-closes the `p` before the `div`, which often surprises people debugging broken layouts."
  },
  {
    "cat": "HTML",
    "q": "Why is the `alt` attribute on images important?",
    "a": "It's a text alternative: read by screen readers, shown if the image fails to load, and helps SEO.",
    "fq": "What `alt` text should a purely decorative image have?",
    "fa": "Empty: `alt=\"\"`. That tells screen readers to skip it. Omitting `alt` entirely is worse — some readers announce the file name instead."
  },
  {
    "cat": "HTML",
    "q": "What's the difference between `id` and `class`?",
    "a": "- `id` is **unique** (one per page), targets a single element.\n- `class` is **reusable** across many elements.\n- In specificity, `id` (100) beats `class` (10).",
    "fq": "Can an element have multiple classes and multiple ids?",
    "fa": "Multiple classes: yes (space-separated). Multiple ids: no — an id must be unique per page, and each element has at most one."
  },
  {
    "cat": "HTML",
    "q": "What are `data-*` attributes?",
    "a": "Custom attributes to store extra data on an element without misusing standard ones, e.g. `<div data-user-id=\"42\">`.",
    "fq": "How do you read `data-user-id` in JS via `dataset`?",
    "fa": "`element.dataset.userId` — the `data-` prefix is dropped and hyphenated segments become camelCase."
  },
  {
    "cat": "HTML",
    "q": "`<strong>`/`<b>` and `<em>`/`<i>` — what's the difference?",
    "a": "They look the same, but semantically `strong`/`em` carry **meaning** (importance/emphasis) and are announced by screen readers, while `b`/`i` are **purely visual**.",
    "fq": "If they look identical, why does the distinction matter?",
    "fa": "Screen readers can convey emphasis/importance for `em`/`strong`; `b`/`i` carry none. It also communicates intent to other developers."
  },
  {
    "cat": "HTML",
    "q": "Difference between `<section>`, `<article>`, and `<div>`?",
    "a": "- `article`: self-contained, independently distributable content (post, comment, product card).\n- `section`: a thematic grouping, usually with a heading.\n- `div`: no meaning — a styling/layout hook only.",
    "fq": "Should every `<section>` have a heading?",
    "fa": "Ideally yes — a section is a thematic grouping and usually warrants a heading for the document outline. If there's no natural heading, a `div` may fit better."
  },
  {
    "cat": "HTML",
    "q": "What is the DOM?",
    "a": "The **Document Object Model** — the browser's live, in-memory tree representing the page. Each element, attribute, and text becomes a node. JS reads and mutates this tree; it's the API between HTML and JS.",
    "fq": "Is the DOM the same as your HTML source?",
    "fa": "No. The DOM is parsed, possibly error-corrected, and reflects JS changes at runtime. The HTML is just the initial input."
  },
  {
    "cat": "HTML",
    "q": "Difference between `<script>`, `<script async>`, and `<script defer>`?",
    "a": "- **plain**: HTML parsing pauses while the script downloads and runs (blocking).\n- **async**: downloads in parallel, runs as soon as ready; order not guaranteed.\n- **defer**: downloads in parallel, runs after parsing finishes, in document order.",
    "fq": "Which should you use for a script that manipulates the DOM?",
    "fa": "`defer` — it runs after parsing completes (DOM ready) and preserves order. `async` might run before the DOM exists."
  },
  {
    "cat": "HTML",
    "q": "What are void (self-closing) elements?",
    "a": "Elements with no content and no closing tag: `img`, `br`, `hr`, `input`, `meta`, `link`.",
    "fq": "Is the self-closing slash `<br />` required in HTML5?",
    "fa": "No — it's optional and ignored by the HTML parser. It only matters in XML/XHTML. In JSX, though, it IS required."
  },
  {
    "cat": "HTML",
    "q": "What goes in the `<head>`?",
    "a": "Metadata that isn't rendered directly: `title`, `meta` tags (charset, viewport, description), `link` (stylesheets/favicons), and script references.",
    "fq": "Why can a large `<script>` at the top of `<head>` hurt performance?",
    "fa": "A blocking script there stalls HTML parsing and delays rendering. Use `defer`/`async` or move scripts to the end of `<body>`."
  },
  {
    "cat": "HTML",
    "q": "What does the viewport meta tag do?",
    "a": "```html\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n```\nIt matches the layout width to the device width and sets initial zoom, so responsive design works on mobile.",
    "fq": "What happens on mobile if you omit it?",
    "fa": "The browser assumes a ~980px desktop width and zooms out, so your `min-width` media queries never trigger and text looks tiny."
  },
  {
    "cat": "HTML",
    "q": "Difference between GET and POST in forms?",
    "a": "- **GET**: data in the URL, visible/bookmarkable, size-limited, for retrieving data.\n- **POST**: data in the request body, not shown in URL, no practical size limit, for submitting/changing data.",
    "fq": "Why shouldn't you use GET for a login form?",
    "fa": "GET puts data in the URL, so credentials would land in history, server logs, and referrer headers. POST keeps them in the body."
  },
  {
    "cat": "HTML",
    "q": "Name some HTML5 input types and their value.",
    "a": "`email`, `number`, `tel`, `url`, `date`, `time`, `range`, `color`, `search`. They give built-in validation, the right mobile keyboard, and native UI (date pickers, sliders) for free.",
    "fq": "Does `type=\"email\"` guarantee a valid email server-side?",
    "fa": "No — client validation is a UX convenience and trivially bypassed. Always validate on the server too."
  },
  {
    "cat": "HTML",
    "q": "localStorage vs sessionStorage vs cookies?",
    "a": "- **localStorage**: ~5–10MB, persists until cleared, not sent to server.\n- **sessionStorage**: same API, cleared when the tab closes.\n- **cookies**: ~4KB, sent with every HTTP request, can expire, used for auth/sessions.",
    "fq": "Which is sent to the server on every request, and why does that matter?",
    "fa": "Cookies. That's why they suit auth/sessions but should stay small — they add overhead to every request. Local/session storage never leave the browser."
  },
  {
    "cat": "HTML",
    "q": "What is web accessibility (a11y) and what is ARIA?",
    "a": "Building sites usable by people with disabilities. **ARIA** attributes (`aria-label`, `role`, `aria-hidden`) add semantics for assistive tech when native HTML can't. Rule: use native semantic HTML first.",
    "fq": "What does \"no ARIA is better than bad ARIA\" mean?",
    "fa": "Incorrect ARIA actively misleads screen readers — worse than none. Prefer native elements (a real `button`), which come with correct semantics for free."
  },
  {
    "cat": "HTML",
    "q": "What does the `tabindex` attribute do?",
    "a": "Controls keyboard focus: `0` joins the natural tab order, `-1` is focusable only via JS, positive values force a specific order.",
    "fq": "Why is a positive `tabindex` (like 3) an anti-pattern?",
    "fa": "It overrides natural DOM order, creating a confusing, fragile focus sequence. Stick to `0` (in order) and `-1` (JS-focusable only)."
  },
  {
    "cat": "HTML",
    "q": "What is the `<label>`'s `for` attribute?",
    "a": "It links a label to a control by matching the control's `id`, so clicking the label focuses the input and screen readers announce it.",
    "fq": "Name two benefits of associating a label with an input.",
    "fa": "Clicking the label focuses/activates the control (larger hit target), and screen readers announce the label when the field is focused."
  },
  {
    "cat": "HTML",
    "q": "What are responsive images with `srcset` / `<picture>`?",
    "a": "`srcset` lets the browser pick the best image for the screen/resolution. `<picture>` with `<source>` enables art direction (different crops) or format fallbacks.",
    "fq": "`srcset` vs `<picture>` — when do you need `<picture>`?",
    "fa": "Use `srcset` for the same image at different resolutions (browser picks). Use `<picture>` for genuinely different crops (art direction) or format fallbacks like WebP → JPEG."
  },
  {
    "cat": "HTML",
    "q": "Difference between `<ol>`, `<ul>`, and `<dl>`?",
    "a": "- `ol`: ordered (numbered) — order matters.\n- `ul`: unordered (bulleted) — order doesn't.\n- `dl`: description list of term/description pairs (`dt`/`dd`).",
    "fq": "When is order meaningful enough to use `<ol>`?",
    "fa": "When reordering changes meaning — steps, rankings, instructions. If items are interchangeable, use `ul`."
  },
  {
    "cat": "HTML",
    "q": "What are meta tags used for?",
    "a": "`charset` (encoding), `viewport` (responsive scaling), `description` (SEO snippet), and Open Graph tags for social previews.",
    "fq": "Which meta tag controls how a link previews on social media?",
    "fa": "Open Graph tags — `og:title`, `og:description`, `og:image` (Twitter/X also reads `twitter:*`)."
  },
  {
    "cat": "HTML",
    "q": "Difference between `<link>` and `<a>`?",
    "a": "`link` declares a relationship to a resource (usually a stylesheet) in the `head` and isn't clickable; `a` is a clickable navigation hyperlink in the body.",
    "fq": "Both use `href` — what's the core difference?",
    "fa": "`link` is a non-clickable resource relationship in the head; `a` is a clickable link that navigates the user."
  },
  {
    "cat": "HTML",
    "q": "What are `<fieldset>` and `<legend>`?",
    "a": "`fieldset` groups related form controls (with a border); `legend` captions that group — useful for radio groups and accessibility.",
    "fq": "Why group radio buttons in a fieldset?",
    "fa": "The `legend` gives the group an accessible name, so screen readers announce \"Shipping method: Standard\" instead of just \"Standard\" with no context."
  },
  {
    "cat": "CSS",
    "q": "Explain the CSS box model.",
    "a": "Every element is a box with four layers, inside out: **content** → **padding** → **border** → **margin**. Padding is inside the border (background shows through); margin is outside (transparent, separates elements).",
    "fq": "How does margin collapsing work?",
    "fa": "Adjacent vertical margins collapse to the *larger* of the two, not their sum. It happens between siblings and parent/child. Padding, borders, or a flex/grid context prevent it."
  },
  {
    "cat": "CSS",
    "q": "`box-sizing: content-box` vs `border-box`?",
    "a": "- **content-box** (default): `width` is content only; padding/border are added on top.\n- **border-box**: `width` includes padding and border, so the box stays the size you set.",
    "fq": "Why do most projects set `box-sizing: border-box` globally?",
    "fa": "So width/height include padding and border — a `200px` box stays `200px`. It makes sizing predictable, especially with % widths plus padding."
  },
  {
    "cat": "CSS",
    "q": "Difference between margin and padding?",
    "a": "Padding is space inside the border (shows the element's background); margin is space outside the border (transparent, separates elements).",
    "fq": "Which one shows the element's background color?",
    "fa": "Padding — it's inside the border. Margin is always transparent."
  },
  {
    "cat": "CSS",
    "q": "What is specificity and how is it calculated?",
    "a": "It decides which conflicting rule wins, ranked high→low: inline (1000), IDs (100), classes/attributes/pseudo-classes (10), elements/pseudo-elements (1). Higher total wins; ties go to the later rule. `!important` overrides all.",
    "fq": "How do you win a specificity battle without `!important`?",
    "fa": "Add a qualifying selector (e.g. another class), or reorder so the winning rule comes later. Keeping selectors flat (single classes) avoids the battle entirely."
  },
  {
    "cat": "CSS",
    "q": "What is the cascade?",
    "a": "The algorithm resolving which styles apply when rules conflict. It considers importance (`!important`), then specificity, then source order (later wins).",
    "fq": "Two rules have equal specificity — which wins?",
    "fa": "The one declared later in the source order."
  },
  {
    "cat": "CSS",
    "q": "Explain `position`: static, relative, absolute, fixed, sticky.",
    "a": "- **static**: default, ignores offsets.\n- **relative**: offset from its normal spot; still occupies original space.\n- **absolute**: removed from flow, positioned to nearest positioned ancestor.\n- **fixed**: removed from flow, positioned to the viewport.\n- **sticky**: relative until a scroll threshold, then sticks.",
    "fq": "`sticky` isn't sticking — what are the usual causes?",
    "fa": "A missing threshold (`top: 0`), an ancestor with `overflow: hidden/auto`, or a parent that isn't tall enough to scroll within."
  },
  {
    "cat": "CSS",
    "q": "`display: none` vs `visibility: hidden` vs `opacity: 0`?",
    "a": "- **display: none**: removed from layout, takes no space, not interactive, hidden from screen readers.\n- **visibility: hidden**: invisible but still takes space, not interactive.\n- **opacity: 0**: invisible, takes space, and still interactive/clickable.",
    "fq": "Which of the three still responds to clicks?",
    "fa": "`opacity: 0` — it's fully interactive and takes space. `visibility: hidden` takes space but isn't clickable. `display: none` is gone entirely."
  },
  {
    "cat": "CSS",
    "q": "What is Flexbox and what are the main/cross axes?",
    "a": "A one-dimensional layout system. `flex-direction` sets the **main axis** (default `row`); the **cross axis** is perpendicular. `justify-content` aligns along main; `align-items` along cross.",
    "fq": "How do `justify-content` and `align-items` relate to the axes?",
    "fa": "`justify-content` aligns along the main axis; `align-items` aligns along the cross axis. Flip `flex-direction` and their effects swap."
  },
  {
    "cat": "CSS",
    "q": "What is CSS Grid and when do you use it over Flexbox?",
    "a": "Grid is **two-dimensional** (rows and columns together). Use Grid for overall page/section layouts; use Flexbox for one-dimensional arrangement (a navbar, a row of buttons).",
    "fq": "Can you use both together, and when?",
    "fa": "Yes, constantly — Grid for the 2D layout, Flexbox inside a grid item for its 1D content (e.g. a card's row of buttons)."
  },
  {
    "cat": "CSS",
    "q": "Explain px, em, rem, %, vh/vw.",
    "a": "- **px**: absolute pixels.\n- **em**: relative to the parent's font-size (compounds when nested).\n- **rem**: relative to the root font-size (predictable).\n- **%**: relative to the parent's corresponding dimension.\n- **vw/vh**: 1% of viewport width/height.",
    "fq": "Why prefer `rem` over `em` for font sizing?",
    "fa": "`em` is relative to the parent, so nesting compounds unpredictably. `rem` is always relative to the root, staying consistent."
  },
  {
    "cat": "CSS",
    "q": "Pseudo-classes vs pseudo-elements?",
    "a": "- **Pseudo-class** (`:hover`, `:nth-child`): targets an element in a state or position.\n- **Pseudo-element** (`::before`, `::first-line`): styles or generates a specific part of an element.",
    "fq": "How many colons for each, and why?",
    "fa": "Pseudo-classes use one colon (`:hover`); pseudo-elements use two (`::before`) to distinguish parts/generated content (single colon still works for legacy ones)."
  },
  {
    "cat": "CSS",
    "q": "What is `z-index` and a stacking context?",
    "a": "`z-index` controls front-to-back order of positioned elements — but only within the same **stacking context**. New contexts are created by `position`+`z-index`, `opacity < 1`, `transform`, `filter`, etc.",
    "fq": "Why might `z-index: 9999` still not bring an element to the front?",
    "fa": "Because z-index only competes within the same stacking context. If an ancestor sits in a lower context, its child can't escape. Look for a parent with opacity/transform/z-index creating a context."
  },
  {
    "cat": "CSS",
    "q": "How does inheritance work in CSS?",
    "a": "Some properties (mostly text: `color`, `font-family`, `line-height`) inherit by default; layout properties (`margin`, `border`, `width`) don't. Force with `inherit`; reset with `unset`.",
    "fq": "Name a property that inherits and one that doesn't.",
    "fa": "`color` inherits; `border` (and most layout properties) doesn't."
  },
  {
    "cat": "CSS",
    "q": "What are CSS combinators?",
    "a": "- **Descendant** (`A B`): any B inside A.\n- **Child** (`A > B`): direct children only.\n- **Adjacent sibling** (`A + B`): the B right after A.\n- **General sibling** (`A ~ B`): all B siblings after A.",
    "fq": "Difference between `A + B` and `A ~ B`?",
    "fa": "`+` selects only the single sibling immediately after A; `~` selects all following siblings of A."
  },
  {
    "cat": "CSS",
    "q": "What is a media query? Mobile-first vs desktop-first?",
    "a": "Conditional CSS based on device traits (usually width). Mobile-first uses `min-width` and enhances upward; desktop-first uses `max-width` and scales down.",
    "fq": "Why is mobile-first generally preferred?",
    "fa": "Base styles serve the most constrained device and you progressively enhance — which tends to produce simpler CSS and better mobile performance."
  },
  {
    "cat": "CSS",
    "q": "How do you center a `<div>` horizontally and vertically?",
    "a": "Flexbox:\n```css\n.parent {\n  display: flex;\n  justify-content: center; /* horizontal */\n  align-items: center;     /* vertical */\n}\n```\nOr Grid: `display: grid; place-items: center;`.",
    "fq": "How do you center a single `position: absolute` element?",
    "fa": "`top: 50%; left: 50%; transform: translate(-50%, -50%);` — the translate offsets by the element's own size, so it's truly centered."
  },
  {
    "cat": "CSS",
    "q": "What are CSS custom properties (variables)?",
    "a": "Reusable values: `:root { --primary: #3b82f6; }` then `color: var(--primary);`. Unlike Sass variables, they're live at runtime and they cascade/inherit — perfect for theming.",
    "fq": "How do CSS variables differ from Sass variables?",
    "fa": "CSS custom properties are live at runtime — changeable with JS, they cascade and inherit. Sass variables are compiled away at build time and are static."
  },
  {
    "cat": "CSS",
    "q": "`transition` vs `animation`?",
    "a": "- **transition**: animates between two states, triggered by a change (e.g. `:hover`).\n- **animation** (with `@keyframes`): multiple steps, can loop, runs automatically without a trigger.",
    "fq": "You need something to animate automatically on page load — which?",
    "fa": "`animation` with `@keyframes` — it runs without a trigger. `transition` needs a state change."
  },
  {
    "cat": "CSS",
    "q": "Does `transform` affect layout?",
    "a": "No. `transform` (translate/scale/rotate) is applied at paint/composite and doesn't trigger reflow — it won't push other elements around. That's why animating `transform`/`opacity` is performant.",
    "fq": "Why is animating `transform` smoother than animating `left`?",
    "fa": "`transform` is composited (often on the GPU) and skips layout; animating `left` triggers layout every frame, causing jank."
  },
  {
    "cat": "CSS",
    "q": "Reflow (layout) vs repaint?",
    "a": "- **Reflow**: recalculating positions/geometry (changing size, adding elements) — expensive.\n- **Repaint**: redrawing pixels without layout changes (color, background) — cheaper.",
    "fq": "Give an example that triggers reflow vs one that only repaints.",
    "fa": "Changing width or adding a DOM node → reflow. Changing color/background → repaint only. Reflows are more expensive."
  },
  {
    "cat": "CSS",
    "q": "What are the values of `overflow`?",
    "a": "`visible` (spills out), `hidden` (clipped), `scroll` (always shows bars), `auto` (bars only when needed).",
    "fq": "Difference between `scroll` and `auto`?",
    "fa": "`scroll` always shows scrollbars even when unneeded; `auto` shows them only when content overflows."
  },
  {
    "cat": "CSS",
    "q": "`:nth-child()` vs `:nth-of-type()`?",
    "a": "`:nth-child(2)` matches if the element is the 2nd child of any type; `:nth-of-type(2)` matches the 2nd child of that specific type.",
    "fq": "`p:nth-child(2)` selects nothing — why?",
    "fa": "Because the 2nd child isn't a `p`. `nth-child` counts all children regardless of type; use `p:nth-of-type(2)` to target the 2nd paragraph."
  },
  {
    "cat": "CSS",
    "q": "What is `float` and `clear`?",
    "a": "`float` was for wrapping text around images (later abused for layout). Floated elements leave normal flow, so parents can collapse; `clear` / a clearfix fixes it. Largely replaced by Flexbox/Grid.",
    "fq": "What problem does a \"clearfix\" solve?",
    "fa": "A container with only floated children collapses to zero height. Clearfix (or `overflow:auto`, or modern flex/grid) forces it to contain its floats."
  },
  {
    "cat": "CSS",
    "q": "What is BEM?",
    "a": "**Block Element Modifier** — a naming convention: `.block`, `.block__element`, `.block--modifier` (e.g. `.card`, `.card__title`, `.card--featured`). Reduces specificity conflicts.",
    "fq": "How does BEM help with specificity?",
    "fa": "Every selector is a single flat class of equal, low specificity, so overrides are predictable and you avoid deep high-specificity chains."
  },
  {
    "cat": "CSS",
    "q": "When should you use `!important`, and why avoid it?",
    "a": "It forcibly overrides everything. Avoid it because it breaks the natural cascade, is hard to override (needs another `!important`), and complicates debugging. Legitimate uses are rare.",
    "fq": "You must override a third-party inline style you can't edit — options?",
    "fa": "Inline styles beat normal rules, so you'd need `!important` (inline + `!important` still wins for inline). Better long-term: raise specificity if possible, or wrap/replace the component."
  },
  {
    "cat": "CSS",
    "q": "Difference between `min-width`, `max-width`, and `width`?",
    "a": "`width` is the target; `min-width` is a floor (won't shrink below); `max-width` is a ceiling (won't grow beyond) — great for responsive containers.",
    "fq": "What's a common responsive use of `max-width`?",
    "fa": "Capping a content container: `max-width: 1200px; margin: 0 auto;` — it fills small screens but stops growing on large ones."
  },
  {
    "cat": "CSS",
    "q": "Inline vs internal vs external CSS?",
    "a": "- **Inline** (`style=\"...\"`): highest specificity, not reusable — avoid.\n- **Internal** (`<style>`): page-specific.\n- **External** (`.css` via `link`): reusable, cacheable — best practice.",
    "fq": "Why is external CSS best for performance?",
    "fa": "It's cacheable across pages and keeps HTML small. Inline/internal styles are re-downloaded with every page and aren't shared."
  },
  {
    "cat": "JavaScript",
    "q": "`var` vs `let` vs `const`?",
    "a": "- **var**: function-scoped, hoisted (initialized `undefined`), redeclarable — legacy.\n- **let**: block-scoped, reassignable, not redeclarable in the same scope.\n- **const**: block-scoped, not reassignable.",
    "fq": "Does `const arr = []` mean the array can't change?",
    "fa": "No — only the *binding* is constant. You can push/mutate the array's contents; you just can't reassign `arr` to a new value."
  },
  {
    "cat": "JavaScript",
    "q": "What is hoisting?",
    "a": "JS moves **declarations** to the top of their scope before execution. `var` is hoisted and set to `undefined`; `let`/`const` are hoisted but uninitialized (Temporal Dead Zone); function declarations are hoisted entirely.",
    "fq": "What's the Temporal Dead Zone?",
    "fa": "The span between a `let`/`const` entering scope and being initialized. Accessing it there throws a ReferenceError — unlike `var`, which would be `undefined`."
  },
  {
    "cat": "JavaScript",
    "q": "`==` vs `===`?",
    "a": "`===` (strict): compares value and type, no coercion. `==` (loose): coerces types first, so `0 == \"0\"` is `true`. Prefer `===`.",
    "fq": "Is there a legitimate use for `==`?",
    "fa": "Yes: `x == null` checks for both `null` and `undefined` in one comparison. Otherwise prefer `===`."
  },
  {
    "cat": "JavaScript",
    "q": "What is a closure?",
    "a": "A function that remembers variables from the scope where it was created, even after that outer function returns:\n```js\nfunction counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\ninc(); // 1\ninc(); // 2  — count is \"closed over\"\n```",
    "fq": "What's a classic closure bug with loops?",
    "fa": "Using `var` in a loop with async callbacks — all callbacks share one variable and see its final value. `let` (block-scoped per iteration) fixes it."
  },
  {
    "cat": "JavaScript",
    "q": "What is the `this` keyword?",
    "a": "It refers to the execution context, decided by *how a function is called*: global/undefined for plain calls, the object for methods, the explicit value with call/apply/bind, the new instance with `new`, and the enclosing scope for arrow functions.",
    "fq": "Why do arrow functions \"fix\" `this` in callbacks?",
    "fa": "They don't have their own `this`; they capture it lexically from the enclosing scope, so a method's `this` is preserved inside the callback."
  },
  {
    "cat": "JavaScript",
    "q": "Arrow functions vs regular functions?",
    "a": "Arrows have no own `this` (lexical), no `arguments` object, can't be constructors (`new`), and can't be generators. They're always expressions.",
    "fq": "Can you use an arrow function as an object method that needs `this`?",
    "fa": "Not reliably — an arrow method's `this` is the surrounding scope (often the module/window), not the object. Use a regular function for methods."
  },
  {
    "cat": "JavaScript",
    "q": "What is the event loop?",
    "a": "JS is single-threaded. Synchronous code runs on the call stack; async callbacks wait in queues. When the stack empties, the loop pushes queued callbacks. **Microtasks** (promises) run before **macrotasks** (setTimeout) each tick.",
    "fq": "`setTimeout(fn, 0)` vs `Promise.resolve().then(fn)` — which runs first?",
    "fa": "The promise. Microtasks drain completely before the next macrotask, even with a 0ms timeout."
  },
  {
    "cat": "JavaScript",
    "q": "Synchronous vs asynchronous?",
    "a": "Synchronous code runs line by line, each statement blocking the next. Asynchronous operations run in the background and their callbacks fire later, so the main thread isn't blocked.",
    "fq": "Does async code run on a separate thread in JS?",
    "fa": "No — JS is single-threaded. The host (browser/Node) handles the timer/network in the background, then queues the callback for the single main thread."
  },
  {
    "cat": "JavaScript",
    "q": "What are Promises and their states?",
    "a": "A promise represents a future value. Three states: **pending**, **fulfilled** (resolved with a value), **rejected** (failed). Once settled it can't change; promises are chainable and solve callback hell.",
    "fq": "Once a promise is rejected, can it become fulfilled?",
    "fa": "No — a promise settles exactly once and its state is then immutable."
  },
  {
    "cat": "JavaScript",
    "q": "What is `async`/`await`?",
    "a": "Syntactic sugar over promises so async code reads synchronously. An `async` function returns a promise; `await` pauses until the awaited promise settles; errors use `try/catch`:\n```js\nasync function getUser() {\n  try {\n    const res = await fetch('/api/user');\n    return await res.json();\n  } catch (e) { console.error(e); }\n}\n```",
    "fq": "How do you run two awaits in parallel instead of sequentially?",
    "fa": "Start both first, then await together: `const [a, b] = await Promise.all([f1(), f2()])`. Awaiting one and then the other runs them serially."
  },
  {
    "cat": "JavaScript",
    "q": "`null` vs `undefined`?",
    "a": "`undefined` = declared but unassigned, or a missing value (JS's default). `null` = an intentional \"no value\" set by the developer.",
    "fq": "What does `typeof null` return, and is it a bug?",
    "fa": "`\"object\"` — yes, a long-standing bug kept for backward compatibility."
  },
  {
    "cat": "JavaScript",
    "q": "What are truthy and falsy values?",
    "a": "Falsy: `false`, `0`, `-0`, `0n`, `\"\"`, `null`, `undefined`, `NaN`. Everything else is truthy — including `\"0\"`, `[]`, and `{}`.",
    "fq": "Is an empty array `[]` truthy or falsy?",
    "fa": "Truthy — objects and arrays are always truthy, even when empty. Only the ~7 falsy values are false."
  },
  {
    "cat": "JavaScript",
    "q": "`map` vs `filter` vs `reduce` vs `forEach`?",
    "a": "- **map**: new array by transforming each element.\n- **filter**: new array of elements that pass a test.\n- **reduce**: reduces to a single value.\n- **forEach**: iterates for side effects, returns `undefined`.",
    "fq": "Why can't you chain after `forEach`?",
    "fa": "`forEach` returns `undefined` (it's for side effects). `map`/`filter` return new arrays, so they chain."
  },
  {
    "cat": "JavaScript",
    "q": "Spread vs rest operator?",
    "a": "Same `...` syntax, opposite jobs: **spread** expands an iterable (`[...arr]`, `{...obj}`); **rest** collects items into one array (`function sum(...nums)`).",
    "fq": "Does spreading an object deep-clone it?",
    "fa": "No — `{...obj}` is a shallow copy; nested objects/arrays are still shared by reference."
  },
  {
    "cat": "JavaScript",
    "q": "What is destructuring?",
    "a": "Unpacking values into variables: `const [a, b] = [1, 2]`, `const { name, age } = user`, with defaults `const { city = 'NYC' } = user`.",
    "fq": "How do you rename a variable while destructuring?",
    "fa": "`const { name: userName } = user;` — the colon renames the extracted property."
  },
  {
    "cat": "JavaScript",
    "q": "`call` vs `apply` vs `bind`?",
    "a": "All set `this` explicitly. `call(thisArg, a, b)` invokes now with listed args; `apply(thisArg, [args])` invokes now with an array; `bind(thisArg)` returns a new bound function.",
    "fq": "`call` vs `apply` — the only difference?",
    "fa": "How arguments are passed: `call` takes a list, `apply` takes a single array. `bind` returns a new function instead of calling."
  },
  {
    "cat": "JavaScript",
    "q": "What is prototypal inheritance?",
    "a": "Objects inherit via the **prototype chain**: property lookup walks from the object up its prototypes until found or `null`. It's how methods like `.map()` are shared without copying onto every instance.",
    "fq": "Where does `arr.map` actually live?",
    "fa": "On `Array.prototype`. Each array delegates up the chain to find it rather than owning a copy."
  },
  {
    "cat": "JavaScript",
    "q": "Event bubbling, capturing, and delegation?",
    "a": "**Bubbling**: an event propagates up from the target (default). **Capturing**: down from the root (opt-in). **Delegation**: one listener on a parent handles many children via `event.target`.",
    "fq": "Why is event delegation useful for a dynamic list?",
    "fa": "One listener on the parent handles current *and* future children via `event.target` — no need to (re)bind a listener to each item."
  },
  {
    "cat": "JavaScript",
    "q": "Function declaration vs function expression?",
    "a": "Declaration `function foo(){}` is fully hoisted (callable before its line). Expression `const foo = function(){}` isn't — only the variable is hoisted, not the assignment.",
    "fq": "Can you call a function expression before its line?",
    "fa": "No — only the variable is hoisted (as `undefined`), not the function. Declarations are fully hoisted and callable earlier."
  },
  {
    "cat": "JavaScript",
    "q": "What is a callback?",
    "a": "A function passed as an argument to be called later — e.g. `arr.forEach(cb)` or an event handler. The basis of async programming before promises.",
    "fq": "What is \"callback hell\"?",
    "fa": "Deeply nested callbacks for sequential async steps, making code hard to read and error-handle. Promises/async-await flatten it."
  },
  {
    "cat": "JavaScript",
    "q": "Shallow copy vs deep copy?",
    "a": "Shallow copies top-level properties but shares nested references (`{...obj}`, `Object.assign`). Deep fully clones every level with no shared references.",
    "fq": "What's a modern built-in for deep cloning?",
    "fa": "`structuredClone(obj)` — handles nested data, Dates, Maps, etc. (`JSON.parse(JSON.stringify())` loses functions, turns Dates into strings, and breaks on cycles.)"
  },
  {
    "cat": "JavaScript",
    "q": "What are template literals?",
    "a": "Backtick strings with interpolation and multi-line support: `` `Hello ${name}, ${count} messages` ``.",
    "fq": "What's a tagged template literal?",
    "fa": "A function placed before the backticks that receives the string parts and interpolated values, letting you process them (used by libraries like styled-components)."
  },
  {
    "cat": "JavaScript",
    "q": "`slice` vs `splice`?",
    "a": "`slice(start, end)` returns a copy of a portion — non-mutating. `splice(start, deleteCount, ...items)` mutates the array (removes/inserts) and returns removed items.",
    "fq": "Which one mutates the original array?",
    "fa": "`splice` mutates in place; `slice` returns a copy and leaves the original untouched."
  },
  {
    "cat": "JavaScript",
    "q": "Primitive vs reference types?",
    "a": "Primitives (string, number, boolean, null, undefined, symbol, bigint) are stored by value. Reference types (objects, arrays, functions) are stored by reference — copying copies the pointer.",
    "fq": "Why does assigning then mutating one object sometimes change another?",
    "fa": "For objects/arrays both variables hold the same reference. Primitives are copied by value, so this doesn't happen with them."
  },
  {
    "cat": "JavaScript",
    "q": "`JSON.parse` and `JSON.stringify`?",
    "a": "`stringify` converts a JS value to a JSON string (for storage/transport); `parse` converts a JSON string back to a JS value.",
    "fq": "What data is lost when you `JSON.stringify` an object?",
    "fa": "Functions, `undefined` values, and symbols are dropped; Dates become strings; `NaN`/`Infinity` become `null`."
  },
  {
    "cat": "JavaScript",
    "q": "Debouncing vs throttling?",
    "a": "Both limit how often a function runs. **Debounce**: wait until triggering stops for X ms, then run once. **Throttle**: run at most once every X ms while triggering continues.",
    "fq": "Search-as-you-type vs a scroll handler — which technique for each?",
    "fa": "Debounce for search (act after typing stops); throttle for scroll (act at a steady max rate while scrolling)."
  },
  {
    "cat": "JavaScript",
    "q": "`setTimeout` vs `setInterval`?",
    "a": "`setTimeout(fn, ms)` runs once after the delay; `setInterval(fn, ms)` runs repeatedly until `clearInterval`.",
    "fq": "Why can `setInterval` callbacks \"pile up\"?",
    "fa": "If a callback takes longer than the interval (heavy work or a busy thread), executions queue up. A recursive `setTimeout` avoids this by scheduling the next only after the current finishes."
  },
  {
    "cat": "JavaScript",
    "q": "What are higher-order functions?",
    "a": "Functions that take a function as an argument and/or return a function — e.g. `map`, `filter`, `setTimeout`. They enable composition and abstraction.",
    "fq": "Is `map` a higher-order function? Why?",
    "fa": "Yes — it takes a function as an argument. HOFs take and/or return functions."
  },
  {
    "cat": "JavaScript",
    "q": "`innerHTML` vs `textContent` vs `innerText`?",
    "a": "`innerHTML` gets/sets HTML (parses tags — XSS risk). `textContent` gets/sets raw text (fast, safe). `innerText` is layout-aware (respects `display:none`, triggers reflow — slower).",
    "fq": "Why avoid `innerHTML` with user input?",
    "fa": "It parses the string as HTML, so untrusted input can inject scripts (XSS). Use `textContent`, or sanitize the input."
  },
  {
    "cat": "JavaScript",
    "q": "What is short-circuit evaluation?",
    "a": "Logical operators stop once the result is known: `a && b` returns `a` if falsy else `b`; `a || b` returns `a` if truthy else `b` (common for defaults).",
    "fq": "What does `a || b` return exactly?",
    "fa": "`a` if it's truthy, otherwise `b` — it returns the operand itself, not a boolean."
  },
  {
    "cat": "JavaScript",
    "q": "Nullish coalescing (`??`) and optional chaining (`?.`)?",
    "a": "`??` returns the right side only if the left is `null`/`undefined`. `?.` safely accesses nested properties, returning `undefined` instead of throwing: `user?.address?.city`.",
    "fq": "How does `??` differ from `||` for defaults?",
    "fa": "`??` only falls back on `null`/`undefined`, so `0 ?? 5` is `0`. `||` falls back on any falsy value, so `0 || 5` is `5`."
  },
  {
    "cat": "JavaScript",
    "q": "What is `NaN` and how do you check for it?",
    "a": "\"Not a Number\" — the result of invalid math. It's the only value not equal to itself, so `NaN === NaN` is `false`.",
    "fq": "How do you reliably test if a value is `NaN`?",
    "fa": "`Number.isNaN(x)`. You can't use `x === NaN`. (Global `isNaN` coerces its argument and is unreliable.)"
  },
  {
    "cat": "JavaScript",
    "q": "`addEventListener` vs `onclick`?",
    "a": "`onclick` allows only one handler (a new one overwrites). `addEventListener` allows multiple handlers, capture/bubble choice, and individual removal.",
    "fq": "Give one capability `addEventListener` has that `onclick` lacks.",
    "fa": "Multiple handlers on the same event, plus choosing the capture phase and using options like `once`/`passive`."
  },
  {
    "cat": "JavaScript",
    "q": "What is `\"use strict\"`?",
    "a": "Opts into strict mode: disallows undeclared globals, throws on silent errors, and makes `this` `undefined` in plain calls. ES modules and classes are strict by default.",
    "fq": "Name one thing strict mode prevents.",
    "fa": "Accidentally creating a global by assigning to an undeclared variable — it throws instead."
  },
  {
    "cat": "JavaScript",
    "q": "What is a pure function?",
    "a": "One that always returns the same output for the same input and has no side effects (no mutation, no I/O). Predictable and easy to test.",
    "fq": "Is a function that uses `Math.random()` pure?",
    "fa": "No — the same input can give different output, and it depends on external state. Pure functions are deterministic with no side effects."
  },
  {
    "cat": "JavaScript",
    "q": "`find` vs `filter`?",
    "a": "`find` returns the first matching element (or `undefined`); `filter` returns an array of all matches (or empty).",
    "fq": "Which returns `undefined` when nothing matches?",
    "fa": "`find`. `filter` returns an empty array."
  },
  {
    "cat": "JavaScript",
    "q": "What does `typeof` return?",
    "a": "A type string: `\"string\"`, `\"number\"`, `\"boolean\"`, `\"undefined\"`, `\"function\"`, `\"object\"`, `\"symbol\"`, `\"bigint\"`. Note `typeof null` is `\"object\"` and `typeof []` is `\"object\"`.",
    "fq": "How do you check if something is an array?",
    "fa": "`Array.isArray(value)` — since `typeof []` unhelpfully returns `\"object\"`."
  },
  {
    "cat": "JavaScript",
    "q": "How do you select DOM elements?",
    "a": "`document.querySelector('.x')` (first match), `document.querySelectorAll('.x')` (all matches as a NodeList), plus `getElementById` and friends.",
    "fq": "`querySelectorAll` returns a NodeList — can you call `.map` on it?",
    "fa": "Not directly — a NodeList isn't a real array. Convert first: `[...nodeList].map(...)` or `Array.from(...)`. (You *can* `forEach` a NodeList.)"
  },
  {
    "cat": "JavaScript",
    "q": "What is immutability and why does it matter?",
    "a": "Not changing data after creation — you create a modified copy (`[...arr, item]`, `{...obj, key: val}`). It prevents bugs from shared references and underpins React's change detection.",
    "fq": "How do you add an item to an array immutably in React?",
    "fa": "`setItems([...items, newItem])` — create a new array rather than `items.push()`, so React detects the change."
  },
  {
    "cat": "JavaScript",
    "q": "`for...of` vs `for...in`?",
    "a": "`for...of` iterates over **values** of an iterable (arrays, strings, Maps). `for...in` iterates over **keys** (enumerable property names) — best for objects.",
    "fq": "Which should you avoid for arrays, and why?",
    "fa": "`for...in` — it iterates keys as strings and can pick up inherited/extra properties. Use `for...of` for array values."
  },
  {
    "cat": "Tailwind",
    "q": "What is Tailwind CSS and what does \"utility-first\" mean?",
    "a": "A **utility-first** CSS framework: you compose designs from small single-purpose classes (`flex`, `pt-4`, `bg-blue-500`) directly in markup, instead of writing custom CSS or using prebuilt components.",
    "fq": "How do you avoid repeating the same long class list everywhere?",
    "fa": "Extract a component in your framework (React/Vue) so the utilities live in one reusable place. Use `@apply` only for small, genuinely repeated patterns."
  },
  {
    "cat": "Tailwind",
    "q": "Pros and cons of utility-first CSS?",
    "a": "**Pros**: no context-switching, no naming, no dead CSS, consistent design tokens, small bundles. **Cons**: cluttered-looking markup, a learning curve, and repetition unless you extract components.",
    "fq": "What's the most common criticism, and the counter-argument?",
    "fa": "\"Ugly, cluttered markup.\" The counter: styles are co-located with structure, there's no dead CSS or naming overhead, and components hide the verbosity."
  },
  {
    "cat": "Tailwind",
    "q": "How does Tailwind handle responsive design?",
    "a": "With **mobile-first** prefixes. Unprefixed utilities apply everywhere; prefixed ones apply from that breakpoint up: `text-sm md:text-base lg:text-lg`.",
    "fq": "Does `md:flex` apply only at the md breakpoint or md and up?",
    "fa": "md and up — Tailwind is mobile-first, so prefixes are `min-width` and cascade upward."
  },
  {
    "cat": "Tailwind",
    "q": "What are the default breakpoints?",
    "a": "`sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px — each a `min-width` (mobile-first).",
    "fq": "What's the default `md` breakpoint value?",
    "fa": "768px."
  },
  {
    "cat": "Tailwind",
    "q": "How do you apply hover, focus, and other states?",
    "a": "State variants prefix the utility: `hover:bg-blue-700 focus:ring-2 active:scale-95 disabled:opacity-50`.",
    "fq": "How would you style an element only when a parent is hovered?",
    "fa": "Mark the parent `group`, then use `group-hover:` on the child."
  },
  {
    "cat": "Tailwind",
    "q": "Tailwind vs Bootstrap — the core difference?",
    "a": "Bootstrap is **component-first** (ready-made styled components, opinionated look). Tailwind is **utility-first** (unstyled primitives you compose into any design).",
    "fq": "Why do Bootstrap sites often \"look the same\"?",
    "fa": "Bootstrap ships styled components with a default look; Tailwind gives unstyled primitives, so the design is entirely yours."
  },
  {
    "cat": "Tailwind",
    "q": "How do you customize Tailwind's theme?",
    "a": "**v3**: edit `tailwind.config.js` — `theme.extend` to add, or `theme` to override. **v4**: configure in CSS with the `@theme` directive using CSS variables (`--color-brand: #ff5722;`).",
    "fq": "In v4, where do you define custom theme tokens?",
    "fa": "In CSS via the `@theme` directive using CSS variables, rather than the JS `tailwind.config.js` used in v3 (still supported via `@config`)."
  },
  {
    "cat": "Tailwind",
    "q": "What is `@apply` and when should you use it?",
    "a": "It pulls utility classes into a custom CSS rule: `.btn { @apply px-4 py-2 rounded bg-blue-500; }`. Use it sparingly — for small, repeated patterns.",
    "fq": "Why is overusing `@apply` discouraged?",
    "fa": "It recreates the big, hard-to-maintain CSS file Tailwind aims to avoid and loses co-location. Prefer component abstractions for reuse."
  },
  {
    "cat": "Tailwind",
    "q": "How does Tailwind keep the production file small?",
    "a": "It scans your source for class names and generates only those (JIT). In v3 you configure `content` paths; in v4 content detection is largely automatic. Unused utilities never ship.",
    "fq": "How does Tailwind decide which classes to include?",
    "fa": "It scans your source files for class names and generates only the ones you actually use."
  },
  {
    "cat": "Tailwind",
    "q": "How do you implement dark mode?",
    "a": "Use the `dark:` variant: `bg-white dark:bg-gray-900`. Configure the strategy: `media` (follows the OS) or `class` (toggle a `dark` class on `<html>` for a manual switch).",
    "fq": "`media` strategy vs `class` strategy — when to use `class`?",
    "fa": "Use `class` when you want a manual toggle (user switches themes); `media` just follows the OS setting with no toggle."
  },
  {
    "cat": "Tailwind",
    "q": "What are arbitrary values?",
    "a": "Square-bracket syntax for one-off values not in your scale: `top-[117px]`, `bg-[#1da1f2]`, `w-[32rem]`, `grid-cols-[1fr_2fr]`.",
    "fq": "How do you set an exact one-off value like `top: 117px`?",
    "fa": "Square-bracket syntax: `top-[117px]`."
  },
  {
    "cat": "Tailwind",
    "q": "`theme.extend` vs overriding `theme` directly (v3)?",
    "a": "`extend` **adds** to the defaults (keeps built-ins). Overriding `theme` directly **replaces** that section — e.g. defining `theme.colors` wipes the default palette.",
    "fq": "What happens if you set `theme.colors` directly (not extend)?",
    "fa": "You replace Tailwind's entire default palette — all built-in colors disappear. Use `extend` to add while keeping defaults."
  },
  {
    "cat": "Tailwind",
    "q": "What is the spacing scale?",
    "a": "A consistent numeric scale for `p-`, `m-`, `w-`, `gap-`, etc. Each unit is `0.25rem` (4px), so `p-4` is `1rem` (16px).",
    "fq": "How many pixels is `p-4`?",
    "fa": "16px — the scale is 0.25rem per unit, so 4 × 4px = 16px."
  },
  {
    "cat": "Tailwind",
    "q": "How do you handle conditional classes in React?",
    "a": "Use a helper since classes are strings: `clsx('px-4 py-2', isActive && 'bg-blue-500')`. Libraries like `clsx`/`classnames` (plus `tailwind-merge`) keep it clean.",
    "fq": "How do you resolve conflicting classes like `p-2` and `p-4` conditionally?",
    "fa": "Use `tailwind-merge` (often with `clsx`) — it keeps the last conflicting utility so the intended one wins."
  },
  {
    "cat": "Tailwind",
    "q": "Difference between `p-4`, `px-4`, and `py-4`?",
    "a": "`p-4` pads all sides; `px-4` pads left+right (x-axis); `py-4` pads top+bottom (y-axis). Same pattern for margins and single sides (`pt`, `pr`, `pb`, `pl`).",
    "fq": "What does `px-` affect?",
    "fa": "Horizontal padding — left and right (x-axis). `py-` is vertical."
  },
  {
    "cat": "Tailwind",
    "q": "What are `group` and `peer` modifiers?",
    "a": "They let an element style itself based on another element's state. `group` + `group-hover:` styles children from a parent's state; `peer` + `peer-checked:` styles a following sibling.",
    "fq": "`peer` vs `group` — what's the structural difference?",
    "fa": "`group` styles descendants based on an ancestor's state; `peer` styles a *following sibling* based on a preceding sibling's state (great for input→label)."
  },
  {
    "cat": "Tailwind",
    "q": "What does `@layer` do?",
    "a": "It organizes custom CSS into Tailwind's layers (`base`, `components`, `utilities`) so styles sort correctly and are purged properly: `@layer components { .btn { @apply px-4 py-2; } }`.",
    "fq": "Why put custom classes inside `@layer components`?",
    "fa": "So they sort into Tailwind's layer order (correct precedence) and are included/purged like built-in utilities."
  },
  {
    "cat": "Tailwind",
    "q": "Utility classes vs hand-written CSS — the trade-off?",
    "a": "Utilities give speed, consistency, and no dead CSS with co-located styling. Hand-written CSS gives cleaner markup. Many teams use Tailwind for the bulk and drop to CSS for complex cases.",
    "fq": "When would you still drop to hand-written CSS?",
    "fa": "Complex keyframe animations, intricate pseudo-element art, or highly dynamic values utilities handle awkwardly — usually via `@layer`/`@apply` or a small CSS file."
  },
  {
    "cat": "React",
    "q": "What is React?",
    "a": "A JavaScript library for building UIs from reusable, composable **components**. It's declarative (you describe UI for a given state) and uses a virtual DOM to update efficiently.",
    "fq": "Is React a framework?",
    "fa": "Technically a *library* focused on the view layer — routing and data fetching come from other libraries or meta-frameworks like Next.js. People often call it a framework loosely."
  },
  {
    "cat": "React",
    "q": "What is the virtual DOM?",
    "a": "An in-memory representation of the UI. On a state change, React builds a new tree, diffs it against the old one (reconciliation), and applies the minimal real-DOM updates.",
    "fq": "Does the virtual DOM make React faster than vanilla DOM manipulation?",
    "fa": "Not inherently — hand-tuned direct edits can be faster. Its value is a simpler declarative model with good-enough batched updates, not raw speed."
  },
  {
    "cat": "React",
    "q": "What is JSX?",
    "a": "A syntax extension for writing HTML-like markup in JS; it compiles to `React.createElement` calls. `className` replaces `class`, attributes are camelCase, and `{}` embeds JS expressions.",
    "fq": "Why must JSX have a single root element (or Fragment)?",
    "fa": "It compiles to a single function return / createElement call — you can't return two siblings. A Fragment (`<>...</>`) groups them without adding a DOM node."
  },
  {
    "cat": "React",
    "q": "Function components vs class components?",
    "a": "Both produce UI. Function components are plain functions using **Hooks** for state/lifecycle; class components use `this.state` and lifecycle methods. Function components + Hooks are the modern standard.",
    "fq": "Why did the ecosystem move from class to function components?",
    "fa": "Hooks let you reuse stateful logic without wrapper hell (HOCs/render props), with less boilerplate and no confusing `this` binding."
  },
  {
    "cat": "React",
    "q": "Props vs state?",
    "a": "**Props** are passed into a component from its parent and are read-only. **State** is data a component owns internally and can change over time, triggering a re-render.",
    "fq": "Can a component change its own props?",
    "fa": "No — props are immutable from the child's view. To \"change\" them, the parent updates the state it passes down, or the child calls a callback prop."
  },
  {
    "cat": "React",
    "q": "What does `useState` do?",
    "a": "Adds state to a function component: `const [count, setCount] = useState(0)`. Calling the setter schedules a re-render with the new value.",
    "fq": "Why might two rapid `setCount(count + 1)` calls only increment once?",
    "fa": "Both read the same stale `count` from that render. Use the updater form `setCount(c => c + 1)` to base it on the latest value."
  },
  {
    "cat": "React",
    "q": "What does `useEffect` do?",
    "a": "Runs side effects (data fetching, subscriptions, manual DOM work) after render. The dependency array controls when it re-runs; a returned function is cleanup.",
    "fq": "What's the difference between `[]`, `[dep]`, and no dependency array?",
    "fa": "`[]` runs once on mount. `[dep]` runs on mount and whenever `dep` changes. No array runs after *every* render — usually a bug."
  },
  {
    "cat": "React",
    "q": "Why do lists need a `key` prop?",
    "a": "A stable `key` gives each item an identity so React can match elements across renders and update efficiently instead of re-creating them.",
    "fq": "Why is using the array index as a key risky?",
    "fa": "If the list reorders, inserts, or deletes, indices shift and React mis-matches items — causing wrong state/DOM (e.g. input values attaching to the wrong row). Use a stable unique id."
  },
  {
    "cat": "React",
    "q": "Controlled vs uncontrolled components?",
    "a": "A **controlled** input's value is driven by React state (`value` + `onChange`). An **uncontrolled** input keeps its value in the DOM, read via a ref when needed.",
    "fq": "When would you choose uncontrolled?",
    "fa": "For simple forms, file inputs, or integrating non-React code — less re-rendering. Controlled is preferred when you need live validation or derived UI."
  },
  {
    "cat": "React",
    "q": "What is \"lifting state up\"?",
    "a": "Moving shared state to the closest common ancestor of the components that need it, then passing it down via props — keeping them in sync.",
    "fq": "What problem does lifting state up too far cause?",
    "fa": "Prop drilling — passing props through many intermediate components that don't use them. Context or a state library solves that."
  },
  {
    "cat": "React",
    "q": "Prop drilling and the Context API?",
    "a": "Prop drilling is threading props through many layers. **Context** provides a value to a subtree without manual passing: `createContext`, a `Provider`, and `useContext`.",
    "fq": "Does Context replace state-management libraries like Redux?",
    "fa": "For low-frequency global values (theme, auth), yes. For large, frequently-updating state it can cause broad re-renders — where Redux/Zustand and selectors help."
  },
  {
    "cat": "React",
    "q": "What does `useRef` do?",
    "a": "Returns a mutable `.current` container that persists across renders **without** triggering re-renders. Used to reference DOM nodes or store mutable values (timers, previous values).",
    "fq": "Why not just use a normal variable instead of `useRef`?",
    "fa": "A normal variable is re-created every render and doesn't persist. A ref keeps the same object across renders, so its value survives."
  },
  {
    "cat": "React",
    "q": "`useMemo` vs `useCallback`?",
    "a": "`useMemo` memoizes a computed **value**; `useCallback` memoizes a **function identity**. Both skip recomputation unless dependencies change.",
    "fq": "When does memoization actually hurt?",
    "fa": "For cheap computations, the caching + dependency-comparison overhead can exceed the savings and adds complexity. Only memoize expensive work or references passed to memoized children."
  },
  {
    "cat": "React",
    "q": "What is `React.memo`?",
    "a": "A higher-order component that skips re-rendering when props are unchanged (shallow compare). Useful for expensive pure components.",
    "fq": "Why might `React.memo` not prevent a re-render even with \"same\" props?",
    "fa": "If a prop is a new object/array/function created inline each render, the shallow compare sees a different reference. Stabilize it with `useMemo`/`useCallback`."
  },
  {
    "cat": "React",
    "q": "What are custom hooks?",
    "a": "Reusable functions starting with `use` that compose built-in hooks to share stateful logic (e.g. `useFetch`, `useLocalStorage`) between components.",
    "fq": "Do two components using the same custom hook share state?",
    "fa": "No — each call gets its own independent state. Hooks share *logic*, not state instances."
  },
  {
    "cat": "React",
    "q": "What are the Rules of Hooks?",
    "a": "Call hooks only at the top level (never in loops/conditions/nested functions) and only from React functions. This keeps their call order stable across renders.",
    "fq": "Why does calling a hook conditionally break React?",
    "fa": "React tracks hook state by call order. A conditional call changes that order between renders, so state gets mismatched to the wrong hook."
  },
  {
    "cat": "React",
    "q": "What is a Fragment?",
    "a": "Lets you return multiple elements without an extra wrapper DOM node: `<>...</>` or `<React.Fragment>` (use the long form when you need a `key`).",
    "fq": "Why not just wrap everything in a `<div>`?",
    "fa": "Extra wrapper divs can break CSS layouts (flex/grid) and bloat the DOM. Fragments group without adding a node."
  },
  {
    "cat": "React",
    "q": "How do you do conditional rendering?",
    "a": "With ternaries, `&&`, or early returns: `{isLoading ? <Spinner/> : <List/>}`.",
    "fq": "What's the bug with `{count && <List/>}` when count is 0?",
    "fa": "It renders `0` on screen (0 is falsy but a valid React child). Use `count > 0 && ...` or a ternary."
  },
  {
    "cat": "React",
    "q": "What are synthetic events?",
    "a": "React wraps native events in a cross-browser `SyntheticEvent` with a consistent API, handled via delegation at the root. Handlers use camelCase (`onClick`).",
    "fq": "How do you stop a click from bubbling in React?",
    "fa": "`e.stopPropagation()` in the handler — the SyntheticEvent exposes the familiar `preventDefault`/`stopPropagation` methods."
  },
  {
    "cat": "React",
    "q": "What are lazy loading and Suspense?",
    "a": "`React.lazy(() => import('./X'))` code-splits a component so it loads on demand; wrap it in `<Suspense fallback={...}>` to show a placeholder while it loads.",
    "fq": "What's the main benefit of code-splitting with `lazy`?",
    "fa": "A smaller initial bundle — users download route/feature code only when needed, improving first load."
  },
  {
    "cat": "React",
    "q": "What does `useReducer` do?",
    "a": "An alternative to `useState` for complex/related state: `const [state, dispatch] = useReducer(reducer, initial)`. You dispatch actions and a reducer returns the next state.",
    "fq": "When is `useReducer` preferable to `useState`?",
    "fa": "When state has multiple sub-values that change together, the next state depends on the previous, or update logic is complex — a reducer centralizes it and is easy to test."
  },
  {
    "cat": "React",
    "q": "Why shouldn't you mutate state directly?",
    "a": "React compares references to decide whether to re-render. Mutating in place (`state.push()`) keeps the same reference, so React may skip the update. Always create new objects/arrays.",
    "fq": "What's the practical symptom of mutating state?",
    "fa": "The UI doesn't update even though the data \"changed\" — a very common beginner bug."
  },
  {
    "cat": "React",
    "q": "What is `useEffect` cleanup?",
    "a": "The function returned from `useEffect` runs before the effect re-runs and on unmount — used to remove listeners, cancel timers, or abort requests.",
    "fq": "What bug happens if you forget cleanup on a subscription?",
    "fa": "Memory leaks and duplicate subscriptions/handlers stacking up on every re-run — plus warnings about updating state on an unmounted component."
  },
  {
    "cat": "React",
    "q": "`useLayoutEffect` vs `useEffect`?",
    "a": "Both run after render, but `useLayoutEffect` fires synchronously **before the browser paints**, while `useEffect` fires after paint. Use layout effect only to measure/mutate the DOM before it's visible.",
    "fq": "Why prefer `useEffect` by default?",
    "fa": "`useLayoutEffect` blocks painting, which can cause jank. Reach for it only to avoid a visible flicker (e.g. measuring layout then adjusting)."
  },
  {
    "cat": "React",
    "q": "What are error boundaries?",
    "a": "Components that catch JS errors in their child tree and render a fallback instead of crashing the app. Implemented with class components (`getDerivedStateFromError`/`componentDidCatch`).",
    "fq": "What errors do error boundaries NOT catch?",
    "fa": "Errors in event handlers, async code, SSR, and errors thrown in the boundary itself. Handle those with `try/catch`."
  },
  {
    "cat": "React",
    "q": "What is reconciliation?",
    "a": "React's diffing process: it compares the new element tree with the old one and updates only what changed, assuming different element types produce different trees and using keys to match list children.",
    "fq": "What happens if a component's type changes between renders (e.g. `<div>` → `<span>`)?",
    "fa": "React tears down the old subtree and its state and builds a fresh one — state is lost. The same type reuses the instance and just updates props."
  },
  {
    "cat": "React",
    "q": "What is StrictMode?",
    "a": "A dev-only wrapper that surfaces problems by double-invoking certain functions (render, effects) to expose impure logic and missing cleanups. It has no effect in production.",
    "fq": "Why does my effect run twice in development?",
    "fa": "StrictMode intentionally mounts, unmounts, and remounts once in dev to catch missing cleanup. It won't double-run in production."
  },
  {
    "cat": "React",
    "q": "What's new in React 19?",
    "a": "**Actions** with `useActionState`/`useFormStatus` for form/async handling, the `use()` hook to read promises/context, `useOptimistic` for optimistic UI, and passing `ref` as a regular prop (no more `forwardRef` in many cases).",
    "fq": "What does the `use()` hook let you do that hooks couldn't before?",
    "fa": "It can read a promise or context and can be called *conditionally* (unlike other hooks), enabling cleaner data reads and Suspense integration."
  },
  {
    "cat": "TypeScript",
    "q": "What is TypeScript and why use it?",
    "a": "A typed **superset of JavaScript** that compiles to plain JS. It adds static types checked at build time — catching errors before runtime and improving tooling (autocomplete, refactoring, self-documentation).",
    "fq": "Does TypeScript add any runtime type checking?",
    "fa": "No — types are erased at compile time. For runtime validation (e.g. API responses) use a library like Zod."
  },
  {
    "cat": "TypeScript",
    "q": "`type` vs `interface`?",
    "a": "Both describe object shapes. `interface` is extendable and supports declaration merging — ideal for objects/classes. `type` is more flexible: it can alias unions, primitives, tuples, and mapped types.",
    "fq": "When must you use `type` over `interface`?",
    "fa": "For unions, tuples, primitives, or complex mapped/conditional types — interfaces can't express those. For plain object shapes, either works."
  },
  {
    "cat": "TypeScript",
    "q": "`any` vs `unknown` vs `never`?",
    "a": "`any` opts out of type checking (dangerous). `unknown` is a safe top type — you must narrow it before use. `never` represents values that never occur (a function that always throws, an impossible branch).",
    "fq": "Why prefer `unknown` over `any` for an API response?",
    "fa": "`unknown` forces you to check/narrow before using the value, preserving safety. `any` silently disables all checks and lets bugs through."
  },
  {
    "cat": "TypeScript",
    "q": "Union vs intersection types?",
    "a": "Union `A | B` = a value is *one of* several types. Intersection `A & B` = it has *all* members of several types combined.",
    "fq": "What does `string & number` resolve to?",
    "fa": "`never` — no value can be both a string and a number at once, so the intersection is empty."
  },
  {
    "cat": "TypeScript",
    "q": "What are generics?",
    "a": "Type parameters that keep code reusable while preserving type info: `function identity<T>(x: T): T`. The caller's type flows through instead of widening to `any`.",
    "fq": "How do you constrain a generic to objects with an `id`?",
    "fa": "`<T extends { id: number }>` — the `extends` clause restricts what `T` can be."
  },
  {
    "cat": "TypeScript",
    "q": "What are enums?",
    "a": "A named set of constants: `enum Role { Admin, User }`. Numeric enums auto-increment; string enums assign explicit strings. They exist at runtime (unlike types).",
    "fq": "Why do some teams prefer union literal types over enums?",
    "fa": "`type Role = 'admin' | 'user'` is simpler, tree-shakeable, and emits no runtime code, while giving the same type safety."
  },
  {
    "cat": "TypeScript",
    "q": "How do optional properties work?",
    "a": "Mark them with `?`: `interface User { name: string; age?: number }`. Optional props may be `undefined` and can be omitted entirely.",
    "fq": "What's the difference between `age?: number` and `age: number | undefined`?",
    "fa": "With `?` you can omit the property. With `| undefined` (no `?`) the property must be present but may be set to `undefined`."
  },
  {
    "cat": "TypeScript",
    "q": "What is type inference?",
    "a": "TS deduces types when you don't annotate: `let x = 5` is inferred as `number`. It cuts boilerplate while keeping safety.",
    "fq": "Should you annotate everything explicitly?",
    "fa": "No — lean on inference for locals and return values; annotate parameters, public APIs, and anywhere inference is wrong or unclear."
  },
  {
    "cat": "TypeScript",
    "q": "What is a type assertion (`as`)?",
    "a": "It tells the compiler to treat a value as a specific type: `const el = document.getElementById('x') as HTMLInputElement`. A compile-time override, not a runtime cast.",
    "fq": "What's the danger of `as`?",
    "fa": "You override the compiler — if you assert wrongly, TS won't catch the resulting runtime error. Prefer narrowing/guards when possible."
  },
  {
    "cat": "TypeScript",
    "q": "What are literal types?",
    "a": "Types that are an exact value, not just the primitive: `let dir: 'left' | 'right'`. Great for restricting to a fixed set of allowed values.",
    "fq": "How do you make an object's properties literal types automatically?",
    "fa": "`as const` — it narrows all values to their literals and makes them readonly."
  },
  {
    "cat": "TypeScript",
    "q": "What are tuples?",
    "a": "Fixed-length arrays with a known type per position: `let pair: [string, number]`.",
    "fq": "How does React's `useState` use tuples?",
    "fa": "It returns `[value, setter]` as a tuple, so destructuring gives a correctly-typed value and setter by position."
  },
  {
    "cat": "TypeScript",
    "q": "What does `readonly` do?",
    "a": "Prevents reassigning a property after creation: `readonly id: number`, or `readonly T[]` / `ReadonlyArray<T>` for arrays.",
    "fq": "Is `readonly` enforced at runtime?",
    "fa": "No — it's compile-time only. At runtime the value can still be mutated by untyped code."
  },
  {
    "cat": "TypeScript",
    "q": "What are utility types?",
    "a": "Built-in type transformers: `Partial<T>` (all optional), `Required<T>`, `Readonly<T>`, `Pick<T,K>`, `Omit<T,K>`, `Record<K,V>`, `Exclude`, `Extract`, `ReturnType<T>`.",
    "fq": "How would you type an update function that takes some fields of `User`?",
    "fa": "`Partial<User>` — makes every property optional so callers pass only what changes."
  },
  {
    "cat": "TypeScript",
    "q": "What do `keyof` and `typeof` do?",
    "a": "`keyof T` gives a union of a type's keys. `typeof value` gives the type of a runtime value. Combine them: `keyof typeof obj` derives key types from an object.",
    "fq": "How do you type a function that accepts only valid keys of an object?",
    "fa": "`function get<T, K extends keyof T>(obj: T, key: K): T[K]` — `K` is constrained to real keys and the return is the indexed value type."
  },
  {
    "cat": "TypeScript",
    "q": "What are type guards / narrowing?",
    "a": "Runtime checks that let TS narrow a type within a branch: `typeof x === 'string'`, `Array.isArray(x)`, `'prop' in obj`, or a custom `x is Type` predicate.",
    "fq": "What's a user-defined type guard?",
    "fa": "A function returning `param is SomeType` (e.g. `function isCat(a: Animal): a is Cat`). Inside a passing branch, TS narrows to that type."
  },
  {
    "cat": "TypeScript",
    "q": "What are discriminated unions?",
    "a": "A union of object types sharing a common literal \"tag\" field, so TS narrows by checking the tag: `{kind:'circle', r} | {kind:'square', s}` switched on `kind`.",
    "fq": "Why are discriminated unions great with `switch` statements?",
    "fa": "TS narrows the type in each case automatically, and a `never` default can enforce that you've handled every variant (exhaustiveness)."
  },
  {
    "cat": "TypeScript",
    "q": "How do function types work?",
    "a": "You can type parameters and return values: `(x: number) => string`, and type variables holding functions. Optional, default, and rest params are supported.",
    "fq": "What does a return type of `void` allow that `undefined` doesn't?",
    "fa": "`void` means the return is ignored — a `() => void` function may actually return anything, and callers won't use it. `undefined` requires returning `undefined` specifically."
  },
  {
    "cat": "TypeScript",
    "q": "`void` vs `never`?",
    "a": "`void` = returns nothing meaningful (but completes). `never` = never returns normally (always throws or loops forever).",
    "fq": "What's a real use of the `never` type?",
    "fa": "Exhaustiveness checks — assigning the \"impossible\" default case to a `never` variable makes TS error if you add an unhandled union member."
  },
  {
    "cat": "TypeScript",
    "q": "What is structural typing?",
    "a": "TS type compatibility is based on **shape**, not name (duck typing). If an object has the required members, it's assignable — regardless of declared type.",
    "fq": "How does structural typing differ from Java/C# nominal typing?",
    "fa": "Nominal systems require the declared type/name to match. TS only cares that the structure matches, so two unrelated types with the same shape are interchangeable."
  },
  {
    "cat": "TypeScript",
    "q": "What is the non-null assertion (`!`)?",
    "a": "`value!` tells the compiler a value isn't null/undefined here: `input!.focus()`. It removes null from the type without a runtime check.",
    "fq": "What's the risk of `!`?",
    "fa": "If you're wrong and it IS null, you get a runtime error TS could have caught. Prefer a real null check or optional chaining when unsure."
  },
  {
    "cat": "TypeScript",
    "q": "What are mapped types?",
    "a": "Types that transform each property of another type: `{ [K in keyof T]: ... }`. Utility types like `Partial`/`Readonly` are built with them.",
    "fq": "Write a mapped type that makes all properties optional.",
    "fa": "`type MyPartial<T> = { [K in keyof T]?: T[K] }` — the `?` modifier applied over each key."
  },
  {
    "cat": "TypeScript",
    "q": "What does `as const` do?",
    "a": "Freezes a value to its most specific (literal, readonly) type: `const cfg = { mode: 'dark' } as const` makes `mode` the literal `'dark'`, not `string`, and everything readonly.",
    "fq": "How is `as const` useful for a list of allowed values?",
    "fa": "`const roles = ['admin', 'user'] as const` lets you derive `type Role = typeof roles[number]` = `'admin' | 'user'` from the runtime array."
  },
  {
    "cat": "TypeScript",
    "q": "What are declaration files (`.d.ts`)?",
    "a": "Files with only type declarations (no implementation) describing the shape of JS code/libraries to TypeScript. Libraries ship them or you install `@types/x`.",
    "fq": "What is DefinitelyTyped / `@types`?",
    "fa": "A community repo of type definitions for JS libraries that don't ship their own. Install them, e.g. `npm i -D @types/lodash`."
  },
  {
    "cat": "TypeScript",
    "q": "What does `strict` in tsconfig do?",
    "a": "`\"strict\": true` enables a bundle of strict checks (`strictNullChecks`, `noImplicitAny`, and more) for maximum type safety. Recommended for new projects.",
    "fq": "What does `strictNullChecks` change?",
    "fa": "`null` and `undefined` stop being assignable to every type — you must handle them explicitly, catching a huge class of \"cannot read property of undefined\" bugs."
  },
  {
    "cat": "Performance",
    "q": "What are the Core Web Vitals?",
    "a": "Google's key UX metrics: **LCP** (Largest Contentful Paint — loading), **INP** (Interaction to Next Paint — responsiveness), and **CLS** (Cumulative Layout Shift — visual stability). They influence search ranking.",
    "fq": "Which metric recently replaced FID, and why?",
    "fa": "INP replaced First Input Delay in 2024. FID only measured the *first* interaction's delay; INP captures overall responsiveness across *all* interactions."
  },
  {
    "cat": "Performance",
    "q": "What is LCP and how do you improve it?",
    "a": "Largest Contentful Paint — time until the largest visible element (often a hero image or heading) renders. Good ≤ 2.5s.",
    "fq": "What's usually the #1 fix for a slow LCP?",
    "fa": "Optimize the LCP resource — compress/resize the hero image, serve modern formats, preload it, and remove render-blocking CSS/JS. Improving server response (TTFB) helps too."
  },
  {
    "cat": "Performance",
    "q": "What is INP?",
    "a": "Interaction to Next Paint — how quickly the page visually responds to interactions (clicks, taps, keys). Good ≤ 200ms.",
    "fq": "What commonly causes poor INP?",
    "fa": "Long JavaScript tasks blocking the main thread. Break up long tasks, defer non-critical work, and avoid heavy synchronous handlers."
  },
  {
    "cat": "Performance",
    "q": "What is CLS and how do you avoid it?",
    "a": "Cumulative Layout Shift — how much visible content unexpectedly moves during load. Good ≤ 0.1.",
    "fq": "What are the top causes of layout shift and how do you prevent them?",
    "fa": "Images/ads/iframes without dimensions, and swapping web fonts. Fix by setting `width`/`height` (or `aspect-ratio`), reserving space for dynamic content, and handling `font-display` carefully."
  },
  {
    "cat": "Performance",
    "q": "What is the critical rendering path?",
    "a": "The steps the browser takes to turn HTML/CSS/JS into pixels: parse HTML → DOM, parse CSS → CSSOM, combine into the render tree, layout, paint. Optimizing it speeds first render.",
    "fq": "Why is CSS considered render-blocking?",
    "fa": "The browser won't paint until it has the CSSOM (to avoid a flash of unstyled content). So large/slow CSS delays first paint — inline critical CSS and defer the rest."
  },
  {
    "cat": "Performance",
    "q": "What is lazy loading?",
    "a": "Deferring the load of offscreen/non-critical resources until needed. Images: `loading=\"lazy\"`. Components: dynamic `import()` / `React.lazy`.",
    "fq": "Which images should NOT be lazy-loaded?",
    "fa": "Above-the-fold ones, especially the LCP image — lazy-loading them delays the largest paint. Only lazy-load offscreen content."
  },
  {
    "cat": "Performance",
    "q": "What is code splitting?",
    "a": "Breaking the bundle into smaller chunks loaded on demand (per route/feature) rather than one giant file, so the initial download is smaller.",
    "fq": "How does code splitting relate to LCP/INP?",
    "fa": "Less initial JS means faster parse/execute — a quicker first render (LCP) and a less-blocked main thread (INP)."
  },
  {
    "cat": "Performance",
    "q": "What is tree shaking?",
    "a": "Dead-code elimination at build time — bundlers drop exports you never import, shrinking the bundle. It relies on ES modules' static structure.",
    "fq": "Why can `import _ from 'lodash'` hurt tree shaking?",
    "fa": "It pulls the whole library and the bundler can't easily drop unused parts. Import specific functions (`lodash-es` or `lodash/get`) so only what you use ships."
  },
  {
    "cat": "Performance",
    "q": "Minification vs compression?",
    "a": "**Minification** strips whitespace/comments and shortens names in the code. **Compression** (gzip/Brotli) shrinks files over the wire. Both reduce bytes downloaded and they stack.",
    "fq": "Minification vs compression — are they the same?",
    "fa": "No. Minification rewrites the source to be smaller; compression encodes bytes for transfer and is decompressed by the browser."
  },
  {
    "cat": "Performance",
    "q": "How do you optimize images?",
    "a": "Serve appropriately sized images, use modern formats (WebP/AVIF), set explicit dimensions, lazy-load offscreen ones, and use `srcset` for responsive resolutions.",
    "fq": "How does setting width/height on an `<img>` help performance metrics?",
    "fa": "It lets the browser reserve space before the image loads, preventing layout shift (better CLS)."
  },
  {
    "cat": "Performance",
    "q": "How does caching improve performance?",
    "a": "It stores responses so repeat visits skip the network: the browser HTTP cache (Cache-Control/ETag), CDNs at the edge, and Service Workers for offline/programmatic caching.",
    "fq": "How do you cache assets aggressively but still ship updates?",
    "fa": "Cache-bust with a content hash in the filename (e.g. `app.3f9a.js`) plus a long max-age. A change produces a new filename, so browsers fetch the new file while caching old ones."
  },
  {
    "cat": "Performance",
    "q": "How do you reduce reflows and repaints?",
    "a": "Batch DOM reads then writes (avoid read-write-read thrashing), animate `transform`/`opacity` (compositor-only), and avoid layout-triggering changes in loops.",
    "fq": "What is layout thrashing?",
    "fa": "Repeatedly reading a layout property (like `offsetHeight`) then writing styles in a loop, forcing synchronous layout each time. Batch all reads before writes to avoid it."
  },
  {
    "cat": "Performance",
    "q": "What is `requestAnimationFrame`?",
    "a": "Schedules a callback to run right before the next paint (~60fps), syncing animations to the display refresh and pausing on hidden tabs.",
    "fq": "Why use rAF instead of `setInterval` for animation?",
    "fa": "rAF syncs to the paint cycle (no dropped/duplicated frames), throttles when the tab is hidden, and avoids the drift/jank `setInterval` causes."
  },
  {
    "cat": "Performance",
    "q": "What is list virtualization?",
    "a": "Rendering only the items currently visible in the viewport (plus a small buffer) instead of thousands of DOM nodes — via libraries like react-window.",
    "fq": "Why does a 10,000-row list need virtualization?",
    "fa": "Rendering 10k DOM nodes is slow to mount and memory-heavy, hurting responsiveness. Virtualization keeps the DOM tiny regardless of data size."
  },
  {
    "cat": "Performance",
    "q": "What are preload, prefetch, and preconnect?",
    "a": "Resource hints: `preload` fetches a critical resource for the current page early; `prefetch` fetches likely-next-page resources at low priority; `preconnect` warms up a connection (DNS/TLS) to another origin.",
    "fq": "preload vs prefetch — what's the difference in intent?",
    "fa": "`preload` = need this soon for *this* page (high priority). `prefetch` = might need this for a *future* navigation (idle, low priority)."
  },
  {
    "cat": "Performance",
    "q": "How do you reduce bundle size?",
    "a": "Ship less JS: code splitting, tree shaking, dropping heavy dependencies, dynamic imports, and analyzing with a bundle analyzer to find bloat.",
    "fq": "What's a quick way to find what's bloating your bundle?",
    "fa": "Run a bundle analyzer (webpack-bundle-analyzer / source-map-explorer) to visualize module sizes and spot large or duplicated dependencies."
  },
  {
    "cat": "Performance",
    "q": "What are web workers?",
    "a": "They run JavaScript on a background thread separate from the main/UI thread, communicating via messages — so heavy computation doesn't freeze the interface.",
    "fq": "What can't a web worker do?",
    "fa": "It has no direct DOM access and can't touch `window`/`document`. It's for CPU-bound work; results are posted back to the main thread to update the UI."
  },
  {
    "cat": "Performance",
    "q": "What are render-blocking resources?",
    "a": "Synchronous CSS/JS in the `<head>` that must load before the browser can render, delaying first paint. Mitigate by inlining critical CSS, deferring/asyncing JS, and lazy-loading the rest.",
    "fq": "How do defer/async on scripts help here?",
    "fa": "They stop scripts from blocking HTML parsing — `defer` runs after parse in order (DOM-ready), `async` runs whenever it arrives. Both unblock rendering."
  }
];
