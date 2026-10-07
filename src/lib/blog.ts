import { BlogMetadata } from "../types";

/**
 * Metadata is bundled eagerly (tiny) so lists, search and the home page can use it.
 * Post bodies live in ./blogContent, which only the blog post route imports.
 */
const metadataModules = import.meta.glob<BlogMetadata>("../blogs/*/metadata.json", {
  eager: true,
  import: "default",
});

export interface BlogSummary {
  slug: string;
  metadata: BlogMetadata;
}

export const blogPosts: BlogSummary[] = Object.entries(metadataModules)
  .map(([path, metadata]) => ({ slug: path.split("/")[2], metadata }))
  .sort((a, b) => +new Date(b.metadata.date) - +new Date(a.metadata.date));

export function getBlogSummary(slug: string | undefined) {
  return blogPosts.find((p) => p.slug === slug);
}

export function readingTime(markdown: string) {
  const words = markdown.replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "24 Apr 2024". Formatted by hand so the server and every browser agree (hydration). */
export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
