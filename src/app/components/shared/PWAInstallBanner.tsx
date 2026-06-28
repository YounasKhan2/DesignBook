import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type PromptOutcome = "accepted" | "dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: PromptOutcome; platform: string }>;
}

const DISMISS_KEY = "designbook:pwa-install-dismissed";

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function PWAInstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY) || isStandaloneDisplay()) return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (isIosDevice()) {
      setShowIosHelp(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  if (!promptEvent && !showIosHelp) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
    setPromptEvent(null);
    setShowIosHelp(false);
  };

  const handleInstall = async () => {
    if (!promptEvent) {
      dismiss();
      return;
    }

    setIsInstalling(true);
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setIsInstalling(false);
    dismiss();
  };

  return (
    <div className="fixed left-4 right-4 bottom-20 z-50 md:left-auto md:right-6 md:bottom-6 md:w-96">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#1a346115" }}>
            <Download className="w-5 h-5" style={{ color: "#1a3461" }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Install DesignBook</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {showIosHelp
                ? "Tap Share, then Add to Home Screen."
                : "Add DesignBook to your home screen or desktop for quick access."}
            </p>
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstall}
                disabled={isInstalling}
                className="px-3 py-2 rounded-lg text-white text-xs font-medium disabled:opacity-60"
                style={{ backgroundColor: "#1a3461" }}
              >
                {isInstalling ? "Installing..." : "Install App"}
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install banner"
            className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
