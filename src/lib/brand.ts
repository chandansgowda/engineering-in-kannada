/**
 * Brand assets — the single place to change the logo.
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
  /** Full wordmark, used for social previews. */
  wordmark: "/images/logo.png",
} as const;
