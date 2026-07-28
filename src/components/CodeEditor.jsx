import { useEffect, useMemo, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";

// Heavy (CodeMirror) — this module is the React.lazy() split point so it stays
// out of the main/PWA bundle. Only loaded when a user opens a problem.

// Reflect the app's <html data-theme> and react to the theme toggle live.
function useHtmlTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "dark"
  );
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() =>
      setTheme(el.getAttribute("data-theme") || "dark")
    );
    obs.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return theme;
}

export default function CodeEditor({
  value,
  onChange,
  onRun,
  readOnly = false,
  minHeight = "260px",
}) {
  const theme = useHtmlTheme();

  // Keep onRun current without rebuilding the editor extensions.
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;

  const extensions = useMemo(
    () => [
      javascript({ jsx: false }),
      // Cmd/Ctrl+Enter runs. Prec.highest so it wins over default bindings.
      Prec.highest(
        keymap.of([
          {
            key: "Mod-Enter",
            preventDefault: true,
            run: () => {
              if (onRunRef.current) onRunRef.current();
              return true;
            },
          },
        ])
      ),
    ],
    []
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme={theme === "light" ? "light" : "dark"}
      extensions={extensions}
      editable={!readOnly}
      readOnly={readOnly}
      minHeight={minHeight}
      basicSetup={{
        lineNumbers: true,
        highlightActiveLine: !readOnly,
        foldGutter: false,
        autocompletion: false,
      }}
    />
  );
}
