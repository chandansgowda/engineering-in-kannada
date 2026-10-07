import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getSeo, SITE_URL } from "../lib/seo";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/**
 * Keeps the document head in sync on client-side navigation. The prerendered
 * HTML already ships the same tags (see renderHeadTags), so first paint and
 * crawlers never depend on this running.
 */
export function SeoHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = getSeo(pathname);
    const url = seo.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${seo.path}`;
    const image = seo.image.startsWith("http") ? seo.image : `${SITE_URL}${seo.image}`;

    document.title = seo.title;
    setMeta("name", "description", seo.description);
    setMeta("name", "robots", seo.robots ?? "index, follow, max-image-preview:large");
    setMeta("property", "og:type", seo.type);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:alt", seo.imageAlt);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.description);
    setMeta("name", "twitter:image", image);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (seo.path === "/404") canonical?.remove();
    else {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = url;
    }

    let ld = document.getElementById("ld-json") as HTMLScriptElement | null;
    if (seo.jsonLd.length) {
      if (!ld) {
        ld = document.createElement("script");
        ld.type = "application/ld+json";
        ld.id = "ld-json";
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": seo.jsonLd });
    } else ld?.remove();
  }, [pathname]);

  return null;
}
