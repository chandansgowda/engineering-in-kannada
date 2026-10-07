import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Calendar, PenLine, Search, User } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { EmptyState } from "../components/EmptyState";
import { blogPosts, formatDate } from "../lib/blog";
import { REPO_URL } from "../lib/github";
import { cn } from "../lib/cn";

const allTags = Array.from(new Set(blogPosts.flatMap((p) => p.metadata.tags))).sort();

export function BlogsPage() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return blogPosts.filter(({ metadata: m }) => {
      const hay = `${m.title} ${m.description} ${m.author} ${m.tags.join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t)) && (!tag || m.tags.includes(tag));
    });
  }, [query, tag]);

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title={
          <>
            Explore our <span className="text-gradient-gold">tech blogs</span>
          </>
        }
        description="Guides, tutorials and stories from the Engineering in Kannada community."
      >
        <a
          href={`${REPO_URL}#adding-a-blog-post`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-8"
        >
          <PenLine className="h-4 w-4" /> Write for us
        </a>
      </PageHeader>

      <div className="container-page pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
            {[null, ...allTags].map((t) => (
              <button
                key={t ?? "all"}
                onClick={() => setTag(t)}
                aria-pressed={tag === t}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
                  tag === t
                    ? "border-primary bg-primary text-dark"
                    : "border-white/10 bg-white/[0.03] text-neutral-400 hover:text-white"
                )}
              >
                {t ? `#${t}` : "All posts"}
              </button>
            ))}
          </div>
          <label className="relative block w-full md:w-72">
            <span className="sr-only">Search blogs</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10"
            />
          </label>
        </div>

        {results.length ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map(({ slug, metadata: m }, i) => (
              <Link
                key={slug}
                to={`/blogs/${slug}`}
                className="card card-hover group relative flex animate-fade-up flex-col overflow-hidden p-6"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <div className="flex flex-wrap gap-2">
                  {m.tags.map((t) => (
                    <span key={t} className="chip">
                      #{t}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 text-xl font-bold leading-snug text-white transition group-hover:text-primary">
                  {m.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-400">{m.description}</p>
                <div className="mt-auto flex items-center justify-between pt-6 text-xs text-neutral-500">
                  <span className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" /> {m.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" /> {formatDate(m.date)}
                    </span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-primary transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState icon={Search} title="No posts match your search">
              Try another keyword or tag.
            </EmptyState>
          </div>
        )}
      </div>
    </>
  );
}
