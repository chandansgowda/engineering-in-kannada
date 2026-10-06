import { lazy, Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "./Toaster";
import { BackToTop } from "./BackToTop";
import { useUIStore } from "../store/ui";
import { initAnalytics, pageview } from "../lib/analytics";

const CommandPalette = lazy(() => import("./CommandPalette"));

/** Scroll to top on navigation, or to the element named by the URL hash. */
function useScrollManagement() {
  const { pathname, hash } = useLocation();
  const firstRender = useRef(true);
  useEffect(() => {
    const initial = firstRender.current;
    firstRender.current = false;
    // `/courses` is the home page scrolled to the catalog.
    const id = hash ? decodeURIComponent(hash.slice(1)) : pathname === "/courses" ? "courses" : null;
    if (!id) {
      window.scrollTo(0, 0);
      return;
    }
    // Routes are lazy, so the target may not exist yet: poll briefly for it.
    let tries = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(id);
      if (el || ++tries > 40) {
        clearInterval(timer);
        el?.scrollIntoView({
          behavior: initial ? "auto" : "smooth",
          block: id.startsWith("lesson-") ? "center" : "start",
        });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [pathname, hash]);
}

export function Layout() {
  const location = useLocation();
  const searchOpen = useUIStore((s) => s.searchOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  useScrollManagement();

  useEffect(() => initAnalytics(), []);
  useEffect(() => {
    // Let the page set its title first.
    const t = setTimeout(() => pageview(location.pathname + location.search), 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(target.tagName);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only z-[80] rounded-lg bg-primary px-4 py-2 font-semibold text-dark focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
      <Toaster />
      {searchOpen && (
        <Suspense fallback={null}>
          <CommandPalette onClose={() => setSearchOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}

function PageFallback() {
  return (
    <div className="container-page py-20">
      <div className="skeleton h-10 w-2/3 max-w-md" />
      <div className="skeleton mt-4 h-5 w-full max-w-xl" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
