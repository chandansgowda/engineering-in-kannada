/**
 * Build-time renderer used by scripts/prerender.mjs. Not part of the browser bundle.
 */
import { StrictMode } from "react";
import { renderToPipeableStream, type RenderToPipeableStreamOptions } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppRoutes } from "./AppRoutes";
import { courses, getVideos, lessonTitle } from "./lib/catalog";
import { blogPosts } from "./lib/blog";
import { blogContent } from "./lib/blogContent";
import linksData from "./data/links.json";
import { LinkCategory } from "./types";

export { getSeo, renderHeadTags, SITE_URL } from "./lib/seo";

export function renderStream(url: string, options: RenderToPipeableStreamOptions) {
  return renderToPipeableStream(
    <StrictMode>
      <StaticRouter location={url}>
        <AppRoutes />
      </StaticRouter>
    </StrictMode>,
    options
  );
}

/** Every URL to prerender, in sitemap order. */
export function prerenderRoutes(): { path: string; sitemap: boolean; priority: number }[] {
  return [
    { path: "/", sitemap: true, priority: 1 },
    ...courses.map((c) => ({ path: `/course/${c.id}`, sitemap: true, priority: 0.9 })),
    { path: "/blogs", sitemap: true, priority: 0.7 },
    ...blogPosts.map((p) => ({ path: `/blogs/${p.slug}`, sitemap: true, priority: 0.6 })),
    { path: "/leaderboard", sitemap: true, priority: 0.5 },
    { path: "/links", sitemap: true, priority: 0.5 },
    { path: "/terms", sitemap: true, priority: 0.2 },
    { path: "/privacy", sitemap: true, priority: 0.2 },
    { path: "/courses", sitemap: false, priority: 0 },
    { path: "/learning", sitemap: false, priority: 0 },
    { path: "/404", sitemap: false, priority: 0 },
  ];
}

/** Plain data for llms.txt / llms-full.txt. */
export function siteContent() {
  return {
    courses: courses.map((c) => ({
      ...c,
      lessons: getVideos(c.id).map((v, i) => ({
        number: i + 1,
        title: lessonTitle(v.title),
        type: v.type,
        youtubeUrl: v.youtubeUrl,
        notesUrl: v.notesUrl || undefined,
        practiceUrl: v.codingQuestionUrl || undefined,
      })),
    })),
    blogs: blogPosts.map((p) => ({ ...p, content: blogContent(p.slug) ?? "" })),
    links: (linksData.categories as LinkCategory[]).flatMap((c) => c.links.map((l) => ({ ...l, category: c.title }))),
  };
}
