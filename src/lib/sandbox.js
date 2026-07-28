// Client-side code execution sandbox.
//
// User code runs inside an <iframe sandbox="allow-scripts"> with NO
// allow-same-origin. That gives the frame an opaque origin, so even malicious
// code cannot read document.cookie / localStorage / the parent's Supabase
// session — it's a different origin from us. We talk to it only via postMessage.
//
// The PARENT never uses eval / new Function on untrusted code. All evaluation
// happens inside the iframe (below), which is the throwaway origin.
//
// Infinite-loop protection: a hung `while(true)` in the frame can't be
// interrupted from outside, so each run gets a FRESH iframe and a timeout. If
// the frame doesn't answer in time we tear it down and report a timeout.
//
// NOTE (multi-language, deferred): the parent↔frame message protocol
// (`{type:'run', code, testCases}` → `{type:'result', results, logs, error}`)
// is language-agnostic on purpose. Today the frame runs JavaScript directly;
// swapping in a WASM interpreter for another language would not change this
// contract. Real multi-language support is a separate, larger project.

// The document loaded into the sandbox frame. Everything here runs at an opaque
// origin. Written defensively (ES5-ish, no optional chaining) so it parses in
// any engine and never depends on the parent.
const RUNNER_HTML = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
(function () {
  function serialize(v) {
    if (typeof v === "function") return "[Function: " + (v.name || "anonymous") + "]";
    if (typeof v === "undefined") return "undefined";
    if (typeof v === "bigint") return v.toString() + "n";
    try { return JSON.stringify(v); } catch (e) { return String(v); }
  }
  // Structural deep-equality. Matches how test authors think about expected
  // values (arrays/objects by content), with NaN === NaN for convenience.
  function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a === "number" && typeof b === "number" && a !== a && b !== b) return true;
    if (a === null || b === null || typeof a !== "object" || typeof b !== "object") return false;
    var ak = Object.keys(a), bk = Object.keys(b);
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (ak.length !== bk.length) return false;
    for (var i = 0; i < ak.length; i++) {
      var k = ak[i];
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }

  function run(code, testCases) {
    var logs = [];
    // Capture console.* output for the output panel. Restored implicitly when
    // the frame is torn down after the run.
    ["log", "info", "warn", "error", "debug"].forEach(function (m) {
      console[m] = function () {
        var parts = [];
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          parts.push(typeof a === "string" ? a : serialize(a));
        }
        logs.push(parts.join(" "));
      };
    });

    var results = [];
    var evaluate;
    try {
      // Define the user's code ONCE, then return a closure that evaluates a
      // test expression in the SAME scope (direct eval sees the user's
      // functions/vars via the closure chain).
      var factory = new Function(
        code + "\\n;return function (__expr) { return eval(__expr); };"
      );
      evaluate = factory();
    } catch (e) {
      // Syntax error or a throw at top level — no tests can run.
      return { results: [], logs: logs, error: (e && e.message) || String(e) };
    }

    for (var t = 0; t < testCases.length; t++) {
      var tc = testCases[t] || {};
      var name = tc.name || "test " + (t + 1);
      try {
        var actual = evaluate(String(tc.call));
        var expected = evaluate(String(tc.expect));
        results.push({
          name: name,
          call: tc.call,
          expect: tc.expect,
          pass: deepEqual(actual, expected),
          actual: serialize(actual),
        });
      } catch (e2) {
        results.push({
          name: name,
          call: tc.call,
          expect: tc.expect,
          pass: false,
          error: (e2 && e2.message) || String(e2),
        });
      }
    }
    return { results: results, logs: logs, error: null };
  }

  window.addEventListener("message", function (ev) {
    var msg = ev.data || {};
    if (!msg || msg.type !== "run") return;
    var out;
    try {
      out = run(String(msg.code || ""), Array.isArray(msg.testCases) ? msg.testCases : []);
    } catch (e) {
      out = { results: [], logs: [], error: (e && e.message) || String(e) };
    }
    out.type = "result";
    // Parent has an opaque origin from our perspective too; "*" is fine because
    // the payload carries no secrets.
    parent.postMessage(out, "*");
  });
})();
<\/script></body></html>`;

// Run `code` against `testCases` in a fresh sandboxed iframe.
// Resolves with { timedOut, results, logs, error } and always tears the frame
// down. Never rejects.
export function runInSandbox(code, testCases, { timeoutMs = 3000 } = {}) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts"); // NO allow-same-origin
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.display = "none";
    iframe.srcdoc = RUNNER_HTML;

    let settled = false;
    let timer = null;

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (timer) clearTimeout(timer);
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    };
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(payload);
    };

    // Identify the frame by its window reference, NOT by origin — a sandboxed
    // opaque-origin frame reports event.origin === "null".
    const onMessage = (ev) => {
      if (ev.source !== iframe.contentWindow) return;
      const msg = ev.data || {};
      if (msg.type === "result") {
        finish({
          timedOut: false,
          results: msg.results || [],
          logs: msg.logs || [],
          error: msg.error || null,
        });
      }
    };

    window.addEventListener("message", onMessage);

    iframe.addEventListener("load", () => {
      // The frame installs its message listener synchronously on parse, so it's
      // ready by the time 'load' fires.
      try {
        iframe.contentWindow.postMessage({ type: "run", code, testCases }, "*");
      } catch {
        finish({ timedOut: false, results: [], logs: [], error: "Could not start the sandbox." });
      }
    });

    timer = setTimeout(() => {
      finish({
        timedOut: true,
        results: [],
        logs: [],
        error: "Your code timed out — check for an infinite loop.",
      });
    }, timeoutMs);

    document.body.appendChild(iframe);
  });
}
