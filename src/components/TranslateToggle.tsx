import { useEffect, useState } from "react";
import { Languages, Loader2 } from "lucide-react";
import { initTranslation, isKannadaActive, showOriginalEnglish, translateToKannada } from "../lib/translate";
import { toast } from "../store/toast";
import { trackEvent } from "../lib/analytics";
import { cn } from "../lib/cn";

/** Header button that switches the whole site between English and Kannada. */
export function TranslateToggle() {
  const [kannada, setKannada] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setKannada(isKannadaActive());
    initTranslation();
  }, []);

  const toggle = async () => {
    if (kannada) {
      trackEvent("translate", { language: "en" });
      showOriginalEnglish();
      return;
    }
    setBusy(true);
    try {
      await translateToKannada();
      setKannada(true);
      trackEvent("translate", { language: "kn" });
    } catch {
      toast("Translation is unavailable right now", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      translate="no"
      title={kannada ? "Show the site in English" : "Translate this site to Kannada"}
      aria-label={kannada ? "Show the site in English" : "Translate this site to Kannada"}
      className={cn(
        "notranslate flex h-9 items-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold transition sm:px-3",
        kannada
          ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-white/10 bg-white/[0.04] text-neutral-300 hover:border-white/20 hover:text-white"
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
      <span className={cn("hidden sm:inline", !kannada && "font-kannada")}>{kannada ? "EN" : "ಕನ್ನಡ"}</span>
    </button>
  );
}
