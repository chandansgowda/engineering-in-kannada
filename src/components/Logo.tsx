import { Link } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { cn } from "../lib/cn";

/** The logo icon as-is: transparent background, no frame. */
export function LogoMark({ className = "h-9" }: { className?: string }) {
  return <img src={BRAND.logo} alt="" width={70} height={81} className={cn("w-auto shrink-0", className)} />;
}

/*
 * The icon's visual weight sits low: the TV body is the bottom ~63%, the antennas
 * are thin. So the name is centred on the TV body rather than the whole image —
 * pushed down by (0.685 − 0.5) × icon height.
 */
const LOCKUP = {
  // 40px → 7px on narrow phones, 44px → 8px elsewhere
  md: {
    icon: "h-10 min-[400px]:h-11",
    text: "top-[7px] min-[400px]:top-2",
    en: "text-[13.5px] min-[400px]:text-[15px]",
    kn: "text-[10.5px] min-[400px]:text-[11px]",
    gap: "gap-2.5 min-[400px]:gap-3",
  },
  lg: { icon: "h-[50px]", text: "top-[9px]", en: "text-base", kn: "text-xs", gap: "gap-3" }, // 50px → 9px
} as const;

/** Icon + English and Kannada names; shared by the header and footer. */
export function LogoLockup({ size = "md" }: { size?: keyof typeof LOCKUP }) {
  const s = LOCKUP[size];
  return (
    <span className={cn("flex items-center", s.gap)}>
      <LogoMark className={s.icon} />
      <span className={cn("notranslate relative flex flex-col gap-[9px]", s.text)} translate="no">
        <span className={cn("whitespace-nowrap font-extrabold leading-none tracking-tight text-white", s.en)}>
          Engineering <span className="text-primary">in Kannada</span>
        </span>
        <span className={cn("kn-line font-kannada font-semibold text-neutral-400", s.kn)}>{BRAND.nameKannada}</span>
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
