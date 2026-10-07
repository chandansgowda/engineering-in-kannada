# CLAUDE.md

Guidance for working on the Engineering in Kannada website: a React + Vite site that organises
Kannada-language YouTube engineering courses, with progress tracking, blogs, a contributor leaderboard
and prerendered HTML for SEO.

## Commands

```bash
npm install
npm run dev        # Vite dev server (client-rendered, no prerender)
npm run build      # client build -> SSR build -> scripts/prerender.mjs (writes dist/)
npm run preview    # serves dist/ but falls back to index.html; see "Testing the build"
npm run lint       # ESLint
npx tsc -p tsconfig.app.json --noEmit    # type-check app code
npx tsc -p tsconfig.node.json --noEmit   # type-check vite.config.ts (+ src/lib/brand.ts)
```

There is no unit-test suite. Verify changes by type-checking, linting, building and checking pages in a browser.

## Stack

React 18, TypeScript (strict), Vite 5, Tailwind CSS 3 (+ typography), React Router 6, Zustand,
react-markdown (lazy). No backend: content is JSON/Markdown in the repo, the leaderboard calls the GitHub API.

## Layout

```
src/
  main.tsx            hydrates prerendered HTML, or renders fresh (see Rendering)
  App.tsx             BrowserRouter + AppRoutes
  AppRoutes.tsx       route table, shared by browser and prerenderer
  entry-server.tsx    build-time renderer + data for sitemap/llms.txt (not in browser bundle)
  components/         Header, Footer, Layout, Logo, KarnatakaMap, CourseCard, LessonRow, Modal,
                      CommandPalette (Ctrl/Cmd+K), NotesViewer, AnnouncementBar, SeoHead, ...
  pages/              one file per route; all except HomePage are lazy-loaded
  lib/                catalog (courses/lessons), blog, blogContent, seo, brand, github, analytics,
                      translate, share, celebrate, socials, nav
  store/              progress (persisted), toast, ui
  data/               courses.json, videos/<course-id>.json, links.json, announcements.json
  blogs/<slug>/       content.md + metadata.json
scripts/prerender.mjs writes per-route HTML, sitemap.xml, robots.txt, llms.txt, llms-full.txt
public/images/        logo.svg (icon), logo.png (wordmark), og-image.png (1200x630 share image)
```

## Content (most common changes)

- **Course:** add to `src/data/courses.json` and create `src/data/videos/<course-id>.json`. The video file
  name must equal the course `id`. Lesson ids are stored in learners' progress, so never rename existing ones.
- **Blog post:** `src/blogs/<slug>/content.md` + `metadata.json` (`date` is `YYYY-MM-DD`). The slug is the URL.
- **Announcements:** `src/data/announcements.json`; optional `link: { label, url }` renders a button.
  Changing the set of active ids re-shows the bar to people who dismissed it.
- **Links page:** `src/data/links.json`; `icon` must be a key in `ICONS` in `src/components/icons.tsx`.

New courses and posts are picked up automatically by routes, search, sitemap and llms.txt on the next build.

## Rendering, SEO and hydration (important)

- Every route is **prerendered** at build time (`vite build --ssr src/entry-server.tsx` then
  `scripts/prerender.mjs`). Routes come from `prerenderRoutes()` in `src/entry-server.tsx`; add new static
  routes there.
- `index.html` contains `<!--seo:start-->...<!--seo:end-->` and `<!--app-html-->` markers that the prerenderer
  replaces. Don't remove them.
- `main.tsx` hydrates only when `#root[data-prerendered]` equals the current path and there is no query
  string; otherwise it renders fresh. Unknown URLs get `404.html` (404 status) from the host. There is no
  SPA `_redirects` rule, and adding `/* /index.html 200` back would break 404s.
- Titles, descriptions, canonical URLs, Open Graph tags and JSON-LD come from `getSeo()` in `src/lib/seo.ts`
  (prerendered via `renderHeadTags`, kept in sync on navigation by `SeoHead`). Don't set `document.title`
  in pages; update `seo.ts` instead.
- **Keep the first client render identical to the server render**, or hydration fails:
  - Read `window`, `localStorage`, `navigator`, `matchMedia` in `useEffect`, never during render or in
    `useState` initialisers.
  - Zustand's `persist` store is safe: hydration uses its initial state, then saved progress loads.
  - Format dates with `formatDate` in `src/lib/blog.ts` (manual, locale-independent).
  - Blog bodies are bundled synchronously (`src/lib/blogContent.ts`) so posts render on the server.
- `SITE_URL` is `BRAND.siteUrl` (`VITE_SITE_URL`, default `https://engineeringinkannada.in`).
- `/learning` and 404 pages are `noindex`. `robots.txt` explicitly welcomes search and AI crawlers.

## Brand and design

- Colours: dark `#1A1A1A` background, gold `primary` `#FFD700`. Karnataka flag colours (`#FFD700`,
  `#E8112D`) are used only for the map, hero chip and share image.
- Fonts: Plus Jakarta Sans, with Noto Sans Kannada as the fallback for Kannada glyphs (`font-kannada` to force it).
- Logo: change it only via `src/lib/brand.ts` / `public/images/logo.svg`; the favicon is injected into
  `index.html` at build time from `brand.ts`. Always transparent, never inside a frame or rounded box.
- `LogoLockup` sizes everything in `em`. Header (`anchor="center"`): name level with the nav links, icon
  centred on its visual centre of mass (54% down). Footer (`anchor="body"`): name beside the TV body.
  Alignment was tuned by measuring rendered pixels; re-measure if you change it.
- Reusable classes in `src/index.css`: `container-page`, `card`, `card-hover`, `btn-primary`,
  `btn-secondary`, `btn-ghost`, `icon-btn`, `chip`, `eyebrow`, `text-gradient-gold`, `skeleton`, `kn-line`.
- `kn-line` nudges Kannada text down 0.07em so it looks centred in chips and buttons.
- `text-gradient-gold` has vertical padding so tall Kannada glyphs aren't clipped by `background-clip: text`;
  on block elements cancel it with negative margins.
- Difficulty chips are always gold. Respect `prefers-reduced-motion` for new animations.

## Kannada translation

- The header toggle uses Google's website translator (`src/lib/translate.ts`), loaded only on demand,
  with a DOM patch so React survives Google rewriting text nodes.
- Translated pages get `html.translated-ltr`; Kannada-specific typography lives under that selector in
  `index.css`. `useIsTranslated()` swaps in hand-written Kannada where machine translation is poor (hero title).
- Add `notranslate` / `translate="no"` to text that is already Kannada or is a brand name.

## Copy and content rules

- No em dashes in user-facing copy; reword instead.
- Don't describe the platform as "100% free" or similar (courses are free, mentorship is not).
- Don't name the hosting provider in legal pages (it changes).
- Keep `src/pages/TermsPage.tsx` and `PrivacyPage.tsx` accurate when adding data collection or third parties.

## Testing the build

`vite preview` falls back to the home page for every URL, so it can't test hydration. To check prerendered
pages, serve `dist/` with a static server that maps `/path` to `/path.html` and serves `404.html` with
status 404 (what Netlify and Cloudflare Pages do), then check the browser console for React errors
#418/#423/#425 (hydration mismatches).

Pages are written as `path.html`, not `path/index.html`: hosts serve `/path` from it directly, while
directory indexes make Netlify 301-redirect to `/path/`, away from the canonical URL. Keep it that way.

## Environment variables

- `VITE_GITHUB_TOKEN`: optional; raises the GitHub API limit for the leaderboard (results are cached 1 hour).
- `VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID`: GA4 id; gtag loads after the page is idle.
- `VITE_SITE_URL`: public URL for canonical links, sitemap and share tags.
