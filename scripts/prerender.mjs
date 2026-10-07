/**
 * Prerenders every route to static HTML after `vite build`, so search engines and
 * AI crawlers (most of which don't run JavaScript) see real content, titles,
 * descriptions and structured data. Also writes sitemap.xml, robots.txt,
 * llms.txt and llms-full.txt.
 *
 * Run via `npm run build`.
 */
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Writable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const ssrDir = join(root, "dist-ssr");

const server = await import(pathToFileURL(join(ssrDir, "entry-server.js")).href);
const { renderStream, getSeo, renderHeadTags, prerenderRoutes, siteContent, SITE_URL } = server;
const template = await readFile(join(dist, "index.html"), "utf8");
const today = new Date().toISOString().slice(0, 10);

function render(url) {
  return new Promise((resolvePromise, reject) => {
    let html = "";
    const stream = renderStream(url, {
      onAllReady() {
        stream.pipe(
          new Writable({
            write(chunk, _enc, cb) {
              html += chunk.toString();
              cb();
            },
            final(cb) {
              resolvePromise(html);
              cb();
            },
          })
        );
      },
      onShellError: reject,
      onError(err) {
        console.error(`  ! render error on ${url}:`, err);
      },
    });
  });
}

// "/course/x" -> course/x.html (not course/x/index.html): static hosts serve it at
// /course/x with no trailing-slash redirect, matching the canonical URLs.
const fileFor = (path) => (path === "/" ? join(dist, "index.html") : join(dist, `${path}.html`));

const routes = prerenderRoutes();
for (const { path } of routes) {
  const appHtml = await render(path);
  const head = renderHeadTags(getSeo(path));
  const page = template
    .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, head)
    .replace('<div id="root"><!--app-html--></div>', `<div id="root" data-prerendered="${path}">${appHtml}</div>`);
  if (page === template) throw new Error("index.html is missing the prerender markers");
  const file = fileFor(path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page);
  console.log(`  prerendered ${path.padEnd(36)} ${(page.length / 1024).toFixed(1)} kB`);
}

// ---------- sitemap.xml ----------
const content = siteContent();
const lastmod = (path) => content.blogs.find((b) => path === `/blogs/${b.slug}`)?.metadata.date ?? today;
const url = (path) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .filter((r) => r.sitemap)
  .map(
    (r) => `  <url>
    <loc>${url(r.path)}</loc>
    <lastmod>${lastmod(r.path)}</lastmod>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
await writeFile(join(dist, "sitemap.xml"), sitemap);

// ---------- robots.txt (search and AI crawlers welcome) ----------
const aiBots = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "DuckAssistBot",
];
const robots = `# Engineering in Kannada: search engines and AI assistants are welcome.
User-agent: *
Allow: /

${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}

Sitemap: ${SITE_URL}/sitemap.xml
`;
await writeFile(join(dist, "robots.txt"), robots);

// ---------- llms.txt / llms-full.txt (https://llmstxt.org) ----------
const intro = `> Engineering in Kannada (ಕನ್ನಡದಲ್ಲಿ ಎಂಜಿನಿಯರಿಂಗ್) is an education platform that teaches programming and computer science in Kannada, the language of Karnataka, India. Its courses are YouTube video playlists taught in Kannada, organised on this site with notes, practice links and progress tracking.

- Website: ${SITE_URL}/
- YouTube: https://www.youtube.com/@EngineeringinKannada
- Created by Chandan S Gowda
- Courses are taught in Kannada; the site itself is in English with a one-click Kannada translation.
- The website is open source: https://github.com/chandansgowda/engineering-in-kannada`;

const llms = `# Engineering in Kannada

${intro}

## Courses

${content.courses
  .map((c) => `- [${c.title}](${url(`/course/${c.id}`)}): ${c.difficulty}, ${c.lessons.length} video lessons. ${c.description}`)
  .join("\n")}

## Blog

${content.blogs.map((b) => `- [${b.metadata.title}](${url(`/blogs/${b.slug}`)}): ${b.metadata.description}`).join("\n")}

## Community

- [Contributor leaderboard](${url("/leaderboard")}): top open-source contributors to the website.
${content.links.map((l) => `- [${l.title}](${l.url}): ${l.description}`).join("\n")}

## Optional

- [Full course and blog content](${url("/llms-full.txt")}): every lesson title and link, plus full blog posts.
- [Terms & Conditions](${url("/terms")})
- [Privacy Policy](${url("/privacy")})
`;
await writeFile(join(dist, "llms.txt"), llms);

const llmsFull = `# Engineering in Kannada: full content

${intro}

# Courses

${content.courses
  .map(
    (c) => `## ${c.title}

- URL: ${url(`/course/${c.id}`)}
- Level: ${c.difficulty}
- Language of instruction: Kannada
- Lessons: ${c.lessons.length}

${c.description}

### Lessons

${c.lessons
  .map(
    (l) =>
      `${l.number}. ${l.title} (${l.type})${l.youtubeUrl ? `: ${l.youtubeUrl}` : ""}${l.notesUrl ? `\n   Notes: ${l.notesUrl}` : ""}${l.practiceUrl ? `\n   Practice: ${l.practiceUrl}` : ""}`
  )
  .join("\n")}`
  )
  .join("\n\n")}

# Blog posts

${content.blogs
  .map(
    (b) => `## ${b.metadata.title}

- URL: ${url(`/blogs/${b.slug}`)}
- Author: ${b.metadata.author}
- Published: ${b.metadata.date}
- Tags: ${b.metadata.tags.join(", ")}

${b.content.trim()}`
  )
  .join("\n\n")}
`;
await writeFile(join(dist, "llms-full.txt"), llmsFull);

await rm(ssrDir, { recursive: true, force: true });
console.log(`  wrote sitemap.xml (${routes.filter((r) => r.sitemap).length} URLs), robots.txt, llms.txt, llms-full.txt`);
