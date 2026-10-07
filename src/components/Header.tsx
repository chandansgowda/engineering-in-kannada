import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, Search, X } from "lucide-react";
import { NAV } from "../lib/nav";
import { Logo } from "./Logo";
import { TranslateToggle } from "./TranslateToggle";
import { useUIStore } from "../store/ui";
import { useProgressStore } from "../store/progress";
import { cn } from "../lib/cn";


const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

export function Header() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const openSearch = useUIStore((s) => s.setSearchOpen);
  const savedCount = useProgressStore((s) => s.starredVideos.length);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled || menuOpen
          ? "border-white/[0.08] bg-dark/80 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-dark/0"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] p-1 lg:flex" aria-label="Main">
          {NAV.map(({ to, label, match }) => {
            const active = match(pathname);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
                  active ? "bg-primary text-dark" : "text-neutral-400 hover:text-white"
                )}
              >
                {label}
                {to === "/learning" && savedCount > 0 && !active && (
                  <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
                    {savedCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <TranslateToggle />
          <button
            onClick={() => openSearch(true)}
            className="group flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-3 pr-2 text-sm text-neutral-400 transition hover:border-white/20 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded-md border border-white/10 bg-white/[0.06] px-1.5 py-0.5 font-sans text-[10px] font-semibold text-neutral-400 sm:inline">
              {isMac ? "⌘" : "Ctrl"} K
            </kbd>
          </button>
          <button
            className="icon-btn lg:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out lg:hidden",
          menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <nav className="min-h-0" aria-label="Mobile">
          <div className="container-page grid grid-cols-2 gap-2 pb-4 pt-1">
            {NAV.map(({ to, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <NavLink
                  key={to}
                  to={to}
                  tabIndex={menuOpen ? 0 : -1}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-white/[0.06] bg-white/[0.03] text-neutral-300 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
