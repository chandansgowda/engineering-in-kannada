import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToastStore } from "../store/toast";
import { cn } from "../lib/cn";

const ICON = { default: Info, success: CheckCircle2, error: XCircle };

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
    >
      {toasts.map((t) => {
        const Icon = ICON[t.tone];
        return (
          <button
            key={t.id}
            onClick={() => dismiss(t.id)}
            className="pointer-events-auto flex max-w-sm animate-fade-up items-center gap-3 rounded-xl border border-white/10 bg-dark-600/95 px-4 py-3 text-left text-sm font-medium text-white shadow-2xl backdrop-blur"
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                t.tone === "error" ? "text-red-400" : t.tone === "success" ? "text-emerald-400" : "text-primary"
              )}
            />
            {t.message}
          </button>
        );
      })}
    </div>
  );
}
