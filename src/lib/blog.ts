import { BlogMetadata } from "../types";

/**
 * Metadata is bundled eagerly (tiny) so lists, search and the home page can use it;
 * the markdown bodies are split into their own chunks and loaded on demand.
 */
const metadataModules = import.meta.glob<BlogMetadata>("../blogs/*/metadata.json", {
  eager: true,
  import: "default",
});

const contentModules = import.meta.glob<string>("../blogs/*/content.md", {
  query: "?raw",
  import: "default",
});

const contentLoaders: Record<string, () => Promise<string>> = {};
for (const [path, loader] of Object.entries(contentModules)) {
  contentLoaders[path.split("/")[2]] = loader;
}

// Word counts are only known after loading content; descriptions give a rough estimate up front.
export interface BlogSummary {
  slug: string;
  metadata: BlogMetadata;
}

export const blogPosts: BlogSummary[] = Object.entries(metadataModules)
  .map(([path, metadata]) => ({ slug: path.split("/")[2], metadata }))
  .filter((p) => contentLoaders[p.slug])
  .sort((a, b) => +new Date(b.metadata.date) - +new Date(a.metadata.date));

export function getBlogSummary(slug: string | undefined) {
  return blogPosts.find((p) => p.slug === slug);
}

export function loadBlogContent(slug: string): Promise<string> | null {
  return contentLoaders[slug]?.() ?? null;
}

export function readingTime(markdown: string) {
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
