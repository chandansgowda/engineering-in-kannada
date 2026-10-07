import { Link } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { cn } from "../lib/cn";

/** The logo icon as-is: transparent background, no frame. */
export function LogoMark({ className = "h-9" }: { className?: string }) {
  return <img src={BRAND.logo} alt="" width={70} height={81} className={cn("w-auto shrink-0", className)} />;
}

/*
 * Two layouts, all sizes in `em` of the English line so they scale together.
 *
 * - `center` (header): the name and the icon are both centred on the header's
 *   centre line, level with the nav links. The icon is centred on its visual
 *   centre of mass (54% down, measured from the artwork), not its box, so it
 *   is nudged up by 4% of its height.
 * - `body` (footer): a larger icon with the name lowered to sit beside the TV
 *   body (the bottom ~63% of the icon), antennas rising above.
 */
const SIZE = {
  md: "text-[13.5px] min-[400px]:text-[15px]",
  lg: "text-base",
} as const;

const ANCHOR = {
  center: { icon: "relative -top-[0.1em] h-[2.5em]", text: "" },
  body: { icon: "h-[3.125em]", text: "relative top-[0.5625em]" },
} as const;

/** Icon + English and Kannada names; shared by the header and footer. */
export function LogoLockup({
  size = "md",
  anchor = "center",
}: {
  size?: keyof typeof SIZE;
  anchor?: keyof typeof ANCHOR;
}) {
  const a = ANCHOR[anchor];
  return (
    <span className={cn("flex items-center gap-[0.75em]", SIZE[size])}>
      <LogoMark className={a.icon} />
      <span className={cn("notranslate flex flex-col gap-[0.5625em]", a.text)} translate="no">
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
    <Link to="/" aria-label={`${BRAND.name} home`}>
      <LogoLockup />
    </Link>
  );
}
