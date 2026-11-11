import { lazy } from "react";

const RELOAD_FLAG = "gf-chunk-reload";

function readFlag() {
  try {
    return sessionStorage.getItem(RELOAD_FLAG);
  } catch {
    return null;
  }
}

function writeFlag(value) {
  try {
    if (value) sessionStorage.setItem(RELOAD_FLAG, value);
    else sessionStorage.removeItem(RELOAD_FLAG);
  } catch {
    /* storage unavailable (private mode etc.) — worst case we don't retry */
  }
}

// React.lazy, plus recovery from stale deploys.
//
// Lazy-loaded pages live in hashed files (e.g. AdminDashboard-F1066d7E.js)
// that change on every deploy. A browser — or the installed PWA — still
// running the previous version asks for a file that no longer exists, the
// import fails, and the page renders nothing. On the first failure we reload
// once to pick up the current version; if it fails again, we let the error
// reach the ErrorBoundary so the user sees a message instead of a blank page.
export default function lazyWithReload(factory) {
  return lazy(async () => {
    try {
      const module = await factory();
      writeFlag(null);
      return module;
    } catch (error) {
      if (!readFlag()) {
        writeFlag("1");
        window.location.reload();
        // Never resolves: the page is reloading.
        return new Promise(() => {});
      }
      writeFlag(null);
      throw error;
    }
  });
}
