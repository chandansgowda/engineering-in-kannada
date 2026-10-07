import { Link } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { cn } from "../lib/cn";

/** The logo icon as-is: transparent background, no frame. */
export function LogoMark({ className = "h-9" }: { className?: string }) {
  return <img src={BRAND.logo} alt="" width={70} height={81} className={cn("w-auto shrink-0", className)} />;
}

/** English + Kannada name, stacked; shared by the header and footer. */
export function LogoText({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <span className="notranslate relative -top-px flex flex-col justify-center gap-[9px]" translate="no">
      <span
        className={cn(
          "whitespace-nowrap font-extrabold leading-none tracking-tight text-white",
          size === "lg" ? "text-base" : "text-[15px]"
        )}
      >
        Engineering <span className="text-primary">in Kannada</span>
      </span>
      <span className={cn("kn-line font-kannada font-semibold text-neutral-400", size === "lg" ? "text-xs" : "text-[11px]")}>
        {BRAND.nameKannada}
      </span>
    </span>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${BRAND.name} — home`}>
      <LogoMark />
      <LogoText />
    </Link>
  );
}
