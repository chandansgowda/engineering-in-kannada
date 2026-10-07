import { Link } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { cn } from "../lib/cn";

/** The logo icon as-is: transparent background, no frame. */
export function LogoMark({ className = "h-9" }: { className?: string }) {
  return <img src={BRAND.logo} alt="" width={70} height={81} className={cn("w-auto shrink-0", className)} />;
}

/*
 * The icon's weight sits low (the TV body is the bottom ~63%; the antennas are
 * thin), so the name is always lined up with the TV body, not the whole image.
 * All sizes are in `em` of the English line, so every variant scales together.
 *
 * - `text` (header): the name stays on the container's centre line — level
 *   with the nav links — and the icon is raised so its TV body matches it.
 * - `body` (footer): the icon stays put and the name is lowered onto its body.
 */
const SIZE = {
  md: "text-[13.5px] min-[400px]:text-[15px]",
  lg: "text-base",
} as const;

const ANCHOR = {
  text: { icon: "relative -top-[0.54em] h-[2.9em]", text: "" },
  body: { icon: "h-[3.125em]", text: "relative top-[0.5625em]" },
} as const;

/** Icon + English and Kannada names; shared by the header and footer. */
export function LogoLockup({
  size = "md",
  anchor = "text",
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
    <Link to="/" aria-label={`${BRAND.name} — home`}>
      <LogoLockup />
    </Link>
  );
}
