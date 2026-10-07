/**
 * Brand assets: the single place to change the logo.
 *
 * Replace `public/images/logo.svg` (or point `logo` at a new file) and the header,
 * footer, links page and favicon all update. `index.html` reads these values at
 * build time via the `brand-html` plugin in `vite.config.ts`.
 */
export const BRAND = {
  name: "Engineering in Kannada",
  nameKannada: "ಕನ್ನಡದಲ್ಲಿ ಎಂಜಿನಿಯರಿಂಗ್",
  /** Icon on a transparent background. */
  logo: "/images/logo.svg",
  /** Full wordmark (structured-data logo). */
  wordmark: "/images/logo.png",
  /** 1200×630 social preview image. */
  ogImage: "/images/og-image.png",
  /** Public URL of the site; override with VITE_SITE_URL. */
  // (import.meta.env is undefined when vite.config.ts imports this file.)
  siteUrl: (
    (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_SITE_URL || "https://engineeringinkannada.in"
  ).replace(/\/+$/, ""),
} as const;
