import type { SVGProps } from "react";
import {
  ExternalLink,
  FileText,
  Github,
  Instagram,
  Linkedin,
  Youtube,
  type LucideIcon,
} from "lucide-react";

export function XLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

type IconComponent = LucideIcon | typeof XLogo;

/**
 * Icons referenced by name from `src/data/links.json`. Importing only these
 * (instead of the whole lucide namespace) keeps ~800 KB out of the bundle.
 */
const ICONS: Record<string, IconComponent> = {
  Youtube,
  Instagram,
  Twitter: XLogo,
  X: XLogo,
  Github,
  Linkedin,
  FileText,
  ExternalLink,
};

export function NamedIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || ExternalLink;
  return <Icon className={className} />;
}
