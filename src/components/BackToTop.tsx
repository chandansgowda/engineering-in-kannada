import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "../lib/cn";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-dark shadow-glow transition-all duration-300 hover:scale-105 sm:bottom-8 sm:right-8",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
    </button>
  );
}
