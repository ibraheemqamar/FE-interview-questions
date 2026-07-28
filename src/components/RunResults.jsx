// Renders the outcome of a sandbox run: a pass/fail list per test case plus a
// console output panel. Pure presentation — the run happens in lib/sandbox.js.
//
// `run` shape: null (idle) | { running: true } | the resolved
// { timedOut, results, logs, error } from runInSandbox().
export default function RunResults({ run }) {
  if (!run) {
    return (
      <div className="run-results run-results--idle">
        Run your code (⌘/Ctrl+Enter) to see test results.
      </div>
    );
  }

  if (run.running) {
    return (
      <div className="run-results run-results--running">
        <span className="ai-dot" /> <span className="ai-dot" /> <span className="ai-dot" /> Running…
      </div>
    );
  }

  const { timedOut, results = [], logs = [], error } = run;
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;

  return (
    <div className="run-results">
      {timedOut ? (
        <div className="run-summary run-summary--timeout">
          ⏱ Timed out — check for an infinite loop.
        </div>
      ) : error ? (
        // A compile/top-level error means no test could run.
        <div className="run-summary run-summary--error">
          ✗ Error: <span className="run-error-msg">{error}</span>
        </div>
      ) : (
        <div
          className={"run-summary " + (total > 0 && passed === total ? "run-summary--pass" : "run-summary--fail")}
        >
          {total > 0 && passed === total ? "✓ " : ""}
          {passed} / {total} tests passing
        </div>
      )}

      {results.length > 0 && (
        <ul className="test-list">
          {results.map((r, i) => (
            <li key={i} className={"test-item " + (r.pass ? "test-item--pass" : "test-item--fail")}>
              <div className="test-item-head">
                <span className="test-badge">{r.pass ? "✓" : "✗"}</span>
                <span className="test-name">{r.name}</span>
              </div>
              {!r.pass && (
                <div className="test-detail">
                  <div><span className="test-detail-label">call</span> <code>{r.call}</code></div>
                  {r.error ? (
                    <div><span className="test-detail-label">threw</span> <code className="test-thrown">{r.error}</code></div>
                  ) : (
                    <>
                      <div><span className="test-detail-label">expected</span> <code>{r.expect}</code></div>
                      <div><span className="test-detail-label">got</span> <code>{r.actual}</code></div>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="console-panel">
        <div className="console-label">console</div>
        {logs.length ? (
          <pre className="console-out">{logs.join("\n")}</pre>
        ) : (
          <div className="console-empty">No output.</div>
        )}
      </div>
    </div>
  );
}
