import { useState, useEffect } from "react";
import "./InstallPrompt.css";

function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem("pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 1000 * 60 * 60 * 24 * 3)
      return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show after 30 seconds on the site
      setTimeout(() => setShow(true), 30000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa_dismissed", Date.now().toString());
  };

  if (!show || installed) return null;

  return (
    <div className="install-prompt">
      <div className="install-prompt-content">
        <div className="install-icon">💄</div>
        <div className="install-text">
          <strong>Add Gracia Fab to your home screen</strong>
          <p>Shop beauty products offline — no app store needed!</p>
        </div>
        <div className="install-actions">
          <button className="install-btn" onClick={handleInstall}>
            Install
          </button>
          <button className="install-dismiss" onClick={handleDismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
