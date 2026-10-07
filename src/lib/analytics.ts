type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;
let initialised = false;

/** Loads gtag.js after the page is interactive so it never blocks first paint. */
export function initAnalytics() {
  if (initialised || !GA_ID || typeof window === "undefined") return;
  initialised = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { send_page_view: false });

  const load = () => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(s);
  };
  if ("requestIdleCallback" in window) window.requestIdleCallback(load);
  else setTimeout(load, 1500);
}

export function pageview(path: string) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function trackEvent(action: string, params: Record<string, unknown> = {}) {
  if (!GA_ID || !window.gtag) return;
  window.gtag("event", action, params);
}
