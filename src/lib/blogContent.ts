/**
 * Blog bodies, bundled eagerly. Only the blog post route (its own chunk) and the
 * prerenderer import this, so post content stays out of the main bundle while
 * still rendering synchronously, which crawlers and hydration both need.
 */
const contentModules = import.meta.glob<string>("../blogs/*/content.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const bySlug: Record<string, string> = {};
for (const [path, content] of Object.entries(contentModules)) {
  bySlug[path.split("/")[2]] = content;
}

export function blogContent(slug: string): string | null {
  return bySlug[slug] ?? null;
}
