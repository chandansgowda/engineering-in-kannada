import { BRAND } from "./brand";
import { courses, getCourse, getVideos, lessonTitle, youtubeThumb } from "./catalog";
import { blogPosts, getBlogSummary } from "./blog";
import { SOCIALS } from "./socials";
import { REPO_URL } from "./github";

export const SITE_URL = BRAND.siteUrl;
const SITE = BRAND.name;

type JsonLd = Record<string, unknown>;

export interface Seo {
  title: string;
  description: string;
  /** Canonical path (no trailing slash). */
  path: string;
  robots?: string;
  type: "website" | "article";
  image: string;
  imageAlt: string;
  jsonLd: JsonLd[];
}

const abs = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`);

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const organization: JsonLd = {
  "@type": "EducationalOrganization",
  "@id": ORG_ID,
  name: SITE,
  alternateName: BRAND.nameKannada,
  url: SITE_URL,
  logo: abs(BRAND.wordmark),
  description:
    "Engineering in Kannada teaches programming and computer science in Kannada through structured YouTube courses on Python, C, data structures and algorithms, and web development.",
  sameAs: [...SOCIALS.map((s) => s.href), REPO_URL],
};

const website: JsonLd = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE,
  alternateName: BRAND.nameKannada,
  inLanguage: ["en", "kn"],
  publisher: { "@id": ORG_ID },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

function breadcrumbs(items: { name: string; path: string }[]): JsonLd {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

const DEFAULT_IMAGE = { image: BRAND.ogImage, imageAlt: `${SITE}: learn engineering in Kannada` };

function page(partial: Omit<Seo, "type" | "image" | "imageAlt" | "jsonLd"> & Partial<Seo>): Seo {
  return { type: "website", ...DEFAULT_IMAGE, jsonLd: [], ...partial };
}

/** Title, description, canonical URL and structured data for any route. */
export function getSeo(pathname: string): Seo {
  const path = pathname.replace(/\/+$/, "") || "/";

  if (path === "/" || path === "/courses") {
    return page({
      title: `${SITE} | Learn Programming in Kannada`,
      description:
        "Learn programming in Kannada with structured video courses on Python, C, Data Structures and Algorithms and Web Development, plus notes and progress tracking.",
      path: "/",
      jsonLd: [
        organization,
        website,
        {
          "@type": "ItemList",
          name: "Courses",
          itemListElement: courses.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: abs(`/course/${c.id}`),
            name: c.title,
          })),
        },
      ],
    });
  }

  const courseMatch = path.match(/^\/course\/([^/]+)$/);
  if (courseMatch) {
    const course = getCourse(courseMatch[1]);
    if (!course) return notFound("Course not found");
    const lessons = getVideos(course.id);
    return page({
      title: `${course.title} | ${SITE}`,
      description: `${course.description} ${lessons.length} video lessons in Kannada with notes, practice and progress tracking.`,
      path,
      image: youtubeThumb(lessons[0]?.youtubeUrl, "hq") ?? course.thumbnail,
      imageAlt: course.title,
      jsonLd: [
        {
          "@type": "Course",
          "@id": `${abs(path)}#course`,
          name: course.title,
          description: course.description,
          url: abs(path),
          image: course.thumbnail,
          inLanguage: "kn",
          educationalLevel: course.difficulty,
          isAccessibleForFree: true,
          provider: { "@type": "EducationalOrganization", name: SITE, sameAs: SITE_URL },
          offers: { "@type": "Offer", category: "Free", price: 0, priceCurrency: "INR" },
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "Online",
            courseWorkload: `${lessons.length} video lessons`,
          },
          syllabusSections: lessons.map((v) => ({ "@type": "Syllabus", name: lessonTitle(v.title) })),
        },
        breadcrumbs([
          { name: "Courses", path: "/" },
          { name: course.title, path },
        ]),
      ],
    });
  }

  const blogMatch = path.match(/^\/blogs\/([^/]+)$/);
  if (blogMatch) {
    const post = getBlogSummary(blogMatch[1]);
    if (!post) return notFound("Blog post not found");
    const m = post.metadata;
    return page({
      title: `${m.title} | ${SITE}`,
      description: m.description,
      path,
      type: "article",
      jsonLd: [
        {
          "@type": "BlogPosting",
          headline: m.title,
          description: m.description,
          datePublished: m.date,
          inLanguage: "en",
          keywords: m.tags.join(", "),
          url: abs(path),
          mainEntityOfPage: abs(path),
          image: abs(BRAND.ogImage),
          author: { "@type": "Person", name: m.author, ...(m.authorUrl ? { url: m.authorUrl } : {}) },
          publisher: { "@id": ORG_ID },
        },
        breadcrumbs([
          { name: "Blogs", path: "/blogs" },
          { name: m.title, path },
        ]),
      ],
    });
  }

  switch (path) {
    case "/blogs":
      return page({
        title: `Blogs | ${SITE}`,
        description: "Guides, tutorials and stories from the Engineering in Kannada community, from Git basics to open source.",
        path,
        jsonLd: [
          {
            "@type": "Blog",
            name: `${SITE} Blog`,
            url: abs(path),
            publisher: { "@id": ORG_ID },
            blogPost: blogPosts.map((p) => ({
              "@type": "BlogPosting",
              headline: p.metadata.title,
              url: abs(`/blogs/${p.slug}`),
              datePublished: p.metadata.date,
            })),
          },
        ],
      });
    case "/leaderboard":
      return page({
        title: `Contributor Leaderboard | ${SITE}`,
        description: "Meet the open-source contributors who build the Engineering in Kannada website, ranked by pull requests, issues and commits.",
        path,
      });
    case "/links":
      return page({
        title: `Links | ${SITE}`,
        description: "Find Engineering in Kannada on YouTube, Instagram, X, GitHub and LinkedIn, plus our open-source projects and study notes.",
        path,
      });
    case "/learning":
      return page({
        title: `My Learning | ${SITE}`,
        description: "Your course progress, saved lessons and starred courses.",
        path,
        robots: "noindex, follow",
      });
    case "/terms":
      return page({ title: `Terms & Conditions | ${SITE}`, description: `The terms for using the ${SITE} website.`, path });
    case "/privacy":
      return page({
        title: `Privacy Policy | ${SITE}`,
        description: `What the ${SITE} website stores, what it shares and the choices you have.`,
        path,
      });
    default:
      return notFound("Page not found");
  }
}

function notFound(title: string): Seo {
  return page({
    title: `${title} | ${SITE}`,
    description: "This page doesn't exist. Browse Kannada engineering courses instead.",
    path: "/404",
    robots: "noindex, follow",
  });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Head tags for a route, as an HTML string (used by the prerenderer). */
export function renderHeadTags(seo: Seo): string {
  const url = abs(seo.path);
  const image = abs(seo.image);
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    seo.robots ? `<meta name="robots" content="${seo.robots}" />` : `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    seo.path !== "/404" ? `<link rel="canonical" href="${url}" />` : "",
    `<meta property="og:type" content="${seo.type}" />`,
    `<meta property="og:site_name" content="${esc(SITE)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:alt" content="${esc(seo.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@chandansgowdru" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    seo.jsonLd.length
      ? `<script type="application/ld+json" id="ld-json">${JSON.stringify({ "@context": "https://schema.org", "@graph": seo.jsonLd }).replace(/</g, "\\u003c")}</script>`
      : "",
  ];
  return tags.filter(Boolean).join("\n    ");
}
