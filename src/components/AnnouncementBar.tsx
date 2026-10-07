import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone, Quote, X } from "lucide-react";
import announcementsData from "../data/announcements.json";
import { AnnouncementsData } from "../types";

const items = (announcementsData as AnnouncementsData).items.filter((i) => i.isActive);
// Dismissal is remembered per set of announcements, so new ones show up again.
const STORAGE_KEY = "eik-announcements-dismissed";
const signature = items.map((i) => i.id).join("|");

function wasDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEY) === signature;
  } catch {
    return false;
  }
}

/** Slim, dismissible announcement strip shown above the site header. */
export function AnnouncementBar() {
  const [hidden, setHidden] = useState(wasDismissed);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (hidden || paused || items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [hidden, paused]);

  if (hidden || !items.length) return null;

  const item = items[index];
  const Icon = item.type === "quote" ? Quote : Megaphone;
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
      <div className="container-page flex h-10 items-center gap-2 text-[13px]">
        {items.length > 1 && (
          <button onClick={() => step(-1)} className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white sm:flex" aria-label="Previous announcement">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <p key={item.id} className="flex min-w-0 flex-1 animate-fade-in items-center justify-center gap-2 text-neutral-200" aria-live="polite">
          <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="truncate">
            {item.content}
            {item.author && <span className="text-neutral-500"> — {item.author}</span>}
          </span>
        </p>
        {items.length > 1 && (
          <button onClick={() => step(1)} className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white sm:flex" aria-label="Next announcement">
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <button onClick={dismiss} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white/10 hover:text-white" aria-label="Dismiss announcements">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
