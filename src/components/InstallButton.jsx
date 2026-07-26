import { useEffect, useState } from "react";

// PWA install affordance + offline indicator. The browser fires
// `beforeinstallprompt` only when the app is installable (served over HTTPS,
// has a manifest + SW, and isn't already installed), so this stays hidden
// otherwise. The offline pill reassures users their cached deck still works.
export default function InstallButton() {
  const [deferred, setDeferred] = useState(null);
  const [offline, setOffline] = useState(
    typeof navigator !== "undefined" && navigator.onLine === false
  );

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => setDeferred(null);
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    try { await deferred.userChoice; } catch { /* dismissed */ }
    setDeferred(null);
  };

  if (!offline && !deferred) return null;

  return (
    <>
      {offline && (
        <span className="offline-pill" title="You’re offline — your cached deck still works">
          ● offline
        </span>
      )}
      {deferred && (
        <button className="install-pill" onClick={install} title="Install this app">
          ⬇ Install
        </button>
      )}
    </>
  );
}
