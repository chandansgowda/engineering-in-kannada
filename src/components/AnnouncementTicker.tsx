import { useEffect, useState } from "react";
import { Megaphone, Quote } from "lucide-react";
import announcementsData from "../data/announcements.json";
import { AnnouncementsData } from "../types";
import { cn } from "../lib/cn";

const items = (announcementsData as AnnouncementsData).items.filter((i) => i.isActive);

export function AnnouncementTicker() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  if (!items.length) return null;
  const item = items[index];
  const Icon = item.type === "quote" ? Quote : Megaphone;

  return (
    <div
      className="relative mx-auto flex max-w-3xl items-center gap-3 overflow-hidden rounded-2xl border border-primary/20 bg-primary/[0.06] py-3 pl-3 pr-4 backdrop-blur"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-dark">
        <Icon className="h-4 w-4" />
      </span>
      <p key={item.id} className="min-w-0 flex-1 animate-fade-up text-sm font-medium text-neutral-200">
        {item.content}
        {item.author && <span className="text-neutral-500"> — {item.author}</span>}
      </p>
      {items.length > 1 && (
        <div className="flex shrink-0 gap-1.5" role="tablist" aria-label="Announcements">
          {items.map((it, i) => (
            <button
              key={it.id}
              role="tab"
              aria-selected={i === index}
              aria-label={`Show announcement ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === index ? "w-5 bg-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
