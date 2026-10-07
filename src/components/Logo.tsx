import { Link } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { cn } from "../lib/cn";

/** The logo icon as-is: transparent background, no frame. */
export function LogoMark({ className = "h-9" }: { className?: string }) {
  return <img src={BRAND.logo} alt="" width={70} height={81} className={cn("w-auto shrink-0", className)} />;
}

/*
 * Proportions (all relative to the English line's font size) were tuned so the
 * name sits beside the TV body and ends level with the bottom of the icon; the
 * antennas rise above. Because everything is in `em`, the header and footer
 * are exact scaled copies of each other.
 */
const SIZE = {
  md: "text-[13.5px] min-[400px]:text-[15px]",
  lg: "text-base",
} as const;

/** Icon + English and Kannada names; shared by the header and footer. */
export function LogoLockup({ size = "md" }: { size?: keyof typeof SIZE }) {
  return (
    <span className={cn("flex items-center gap-[0.75em]", SIZE[size])}>
      <LogoMark className="h-[3.125em]" />
      <span className="notranslate relative top-[0.5625em] flex flex-col gap-[0.5625em]" translate="no">
        <span className="whitespace-nowrap text-[1em] font-extrabold leading-none tracking-tight text-white">
          Engineering <span className="text-primary">in Kannada</span>
        </span>
        <span className="kn-line font-kannada text-[0.75em] font-semibold text-neutral-400">{BRAND.nameKannada}</span>
      </span>
    </span>
  );
}

export function Logo() {
  return (
    <Link to="/" aria-label={`${BRAND.name} — home`}>
      <LogoLockup />
    </Link>
  );
}
