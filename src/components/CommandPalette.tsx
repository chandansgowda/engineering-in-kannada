import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CornerDownLeft,
  ExternalLink,
  FileText,
  PlayCircle,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Modal } from "./Modal";
import { NAV } from "../lib/nav";
import { allLessons, courses, lessonTitle } from "../lib/catalog";
import { blogPosts } from "../lib/blog";
import linksData from "../data/links.json";
import { LinkCategory } from "../types";
import { cn } from "../lib/cn";

interface Item {
  id: string;
  group: "Pages" | "Courses" | "Lessons" | "Blogs" | "Links";
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  haystack: string;
  to?: string;
  href?: string;
}

const categories = linksData.categories as LinkCategory[];

const INDEX: Item[] = [
  ...NAV.map((n) => ({
    id: `page-${n.to}`,
    group: "Pages" as const,
    title: n.label,
    icon: n.icon,
    to: n.to,
    haystack: n.label.toLowerCase(),
  })),
  ...[
    { to: "/terms", label: "Terms & Conditions" },
    { to: "/privacy", label: "Privacy Policy" },
  ].map((n) => ({
    id: `page-${n.to}`,
    group: "Pages" as const,
    title: n.label,
    icon: FileText,
    to: n.to,
    haystack: `${n.label} legal`.toLowerCase(),
  })),
  ...courses.map((c) => ({
    id: `course-${c.id}`,
    group: "Courses" as const,
    title: c.title,
    subtitle: `${c.difficulty} · ${c.description}`,
    icon: BookOpen,
    to: `/course/${c.id}`,
    haystack: `${c.title} ${c.description} ${c.difficulty}`.toLowerCase(),
  })),
  ...allLessons.map(({ course, video, index }) => ({
    id: `lesson-${video.id}`,
    group: "Lessons" as const,
    title: lessonTitle(video.title),
    subtitle: `${course.title} · Lesson ${index + 1}`,
    icon: PlayCircle,
    to: `/course/${course.id}#lesson-${video.id}`,
    haystack: `${video.title} ${video.type} ${course.title}`.toLowerCase(),
  })),
  ...blogPosts.map((p) => ({
    id: `blog-${p.slug}`,
    group: "Blogs" as const,
    title: p.metadata.title,
    subtitle: `by ${p.metadata.author}`,
    icon: FileText,
    to: `/blogs/${p.slug}`,
    haystack: `${p.metadata.title} ${p.metadata.description} ${p.metadata.tags.join(" ")} ${p.metadata.author}`.toLowerCase(),
  })),
  ...categories.flatMap((cat) =>
    cat.links.map((l) => ({
      id: `link-${cat.id}-${l.id}`,
      group: "Links" as const,
      title: l.title,
      subtitle: l.description,
      icon: ExternalLink,
      href: l.url,
      haystack: `${l.title} ${l.description} ${cat.title}`.toLowerCase(),
    }))
  ),
];

const GROUP_ORDER: Item["group"][] = ["Pages", "Courses", "Lessons", "Blogs", "Links"];

function search(query: string): Item[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) {
    return INDEX.filter(
      (i) => (i.group === "Pages" && !/terms|privacy/.test(i.to ?? "")) || i.group === "Courses"
    );
  }
  return INDEX.filter((i) => terms.every((t) => i.haystack.includes(t)))
    .sort((a, b) => GROUP_ORDER.indexOf(a.group) - GROUP_ORDER.indexOf(b.group))
    .slice(0, 40);
}

export default function CommandPalette({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const results = useMemo(() => search(query), [query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const select = useCallback(
    (item: Item | undefined) => {
      if (!item) return;
      onClose();
      if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
      else if (item.to) navigate(item.to);
    },
    [navigate, onClose]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(results[active]);
    }
  };

  let lastGroup: string | null = null;

  return (
    <Modal open onClose={onClose} label="Search" position="top" className="max-w-xl">
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-4">
        <Search className="h-5 w-5 shrink-0 text-primary" />
        <input
          data-autofocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search courses, lessons, blogs…"
          className="h-14 w-full bg-transparent text-base text-white placeholder:text-neutral-500 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `opt-${results[active].id}` : undefined}
        />
        <kbd className="hidden rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 sm:block">
          ESC
        </kbd>
      </div>
      <div ref={listRef} id="search-results" role="listbox" className="max-h-[60vh] overflow-y-auto p-2">
        {results.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-neutral-500">
            No results for “{query}”. Try “python”, “loops” or “git”.
          </p>
        )}
        {results.map((item, i) => {
          const header = item.group !== lastGroup ? item.group : null;
          lastGroup = item.group;
          const Icon = item.icon;
          return (
            <div key={item.id}>
              {header && (
                <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  {header}
                </p>
              )}
              <button
                id={`opt-${item.id}`}
                role="option"
                aria-selected={i === active}
                data-index={i}
                onMouseMove={() => setActive(i)}
                onClick={() => select(item)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  i === active ? "bg-primary/10" : "hover:bg-white/[0.04]"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    i === active ? "bg-primary text-dark" : "bg-white/[0.06] text-neutral-400"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">{item.title}</span>
                  {item.subtitle && (
                    <span className="block truncate text-xs text-neutral-500">{item.subtitle}</span>
                  )}
                </span>
                {i === active &&
                  (item.href ? (
                    <ExternalLink className="h-4 w-4 text-primary" />
                  ) : (
                    <CornerDownLeft className="h-4 w-4 text-primary" />
                  ))}
              </button>
            </div>
          );
        })}
      </div>
      <div className="hidden items-center gap-4 border-t border-white/[0.08] px-4 py-2.5 text-[11px] text-neutral-500 sm:flex">
        <span>↑↓ to navigate</span>
        <span>↵ to open</span>
        <span className="ml-auto inline-flex items-center gap-1">
          Tip: press <kbd className="rounded border border-white/10 px-1">/</kbd> anywhere <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Modal>
  );
}
