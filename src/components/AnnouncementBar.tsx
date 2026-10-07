import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone, Quote, X } from "lucide-react";
import announcementsData from "../data/announcements.json";
import { AnnouncementItem, AnnouncementsData } from "../types";

const items = (announcementsData as AnnouncementsData).items.filter((i) => i.isActive);
// Dismissal is remembered per set of announcements, so new ones show up again.
const STORAGE_KEY = "eik-announcements-dismissed";
const signature = items.map((i) => i.id).join("|");
const MARQUEE_SPEED = 45; // px per second
const STATIC_DURATION = 6000;

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === signature;
  } catch {
    return false;
  }
}

function Message({ item }: { item: AnnouncementItem }) {
  const Icon = item.type === "quote" ? Quote : Megaphone;
  return (
    <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
      {item.content}
      {item.author && <span className="text-neutral-500"> — {item.author}</span>}
    </span>
  );
}

/** Slim, dismissible announcement strip; long messages scroll as a marquee. */
export function AnnouncementBar() {
  const [hidden, setHidden] = useState(wasDismissed);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [marquee, setMarquee] = useState<{ distance: number } | null>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const item = items[index];

  // Decide whether the current message fits; re-check when the bar resizes.
  useLayoutEffect(() => {
    if (hidden || !item) return;
    const check = () => {
      const viewport = viewportRef.current;
      const text = measureRef.current;
      if (!viewport || !text) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const overflow = text.scrollWidth > viewport.clientWidth + 1;
      setMarquee(overflow && !reduced ? { distance: text.scrollWidth + 64 } : null);
    };
    check();
    const ro = new ResizeObserver(check);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, [hidden, item]);

  // Rotate: static messages stay 6s; scrolling ones finish a full pass first.
  useEffect(() => {
    if (hidden || paused || items.length <= 1) return;
    const duration = marquee ? Math.max(STATIC_DURATION, (marquee.distance / MARQUEE_SPEED) * 1000 + 800) : STATIC_DURATION;
    const t = setTimeout(() => setIndex((i) => (i + 1) % items.length), duration);
    return () => clearTimeout(t);
  }, [hidden, paused, index, marquee]);

  if (hidden || !item) return null;

  const step = (d: number) => setIndex((i) => (i + d + items.length) % items.length);
  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(STORAGE_KEY, signature);
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      className="relative z-[51] border-b border-primary/15 bg-[linear-gradient(90deg,rgba(255,215,0,0.06),rgba(255,215,0,0.13),rgba(255,215,0,0.06))]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Announcements"
    >
      <div className="container-page flex h-10 items-center gap-2 text-[13px] text-neutral-200">
        {items.length > 1 && (
          <button
            onClick={() => step(-1)}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white sm:flex"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div
          ref={viewportRef}
          className="relative min-w-0 flex-1 overflow-hidden"
          style={
            marquee
              ? { maskImage: "linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent)" }
              : undefined
          }
          aria-live="polite"
        >
          {/* Invisible copy used only to measure the message's natural width. */}
          <span ref={measureRef} className="pointer-events-none invisible absolute left-0 top-0 whitespace-nowrap" aria-hidden="true">
            <Message item={item} />
          </span>
          {marquee ? (
            <div
              key={item.id}
              className="announce-marquee flex w-max"
              style={
                {
                  "--marquee-distance": `-${marquee.distance}px`,
                  animationDuration: `${marquee.distance / MARQUEE_SPEED}s`,
                  animationPlayState: paused ? "paused" : "running",
                } as React.CSSProperties
              }
            >
              <span className="pr-16">
                <Message item={item} />
              </span>
              <span className="pr-16" aria-hidden="true">
                <Message item={item} />
              </span>
            </div>
          ) : (
            <p key={item.id} className="flex animate-fade-in justify-center">
              <Message item={item} />
            </p>
          )}
        </div>

        {items.length > 1 && (
          <button
            onClick={() => step(1)}
            className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white sm:flex"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={dismiss}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss announcements"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
