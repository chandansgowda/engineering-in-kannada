import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  FileText,
  GitBranch,
  Github,
  Languages,
  LineChart,
  PlayCircle,
  Search,
  Star,
  X,
  Youtube,
} from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { KarnatakaMap } from "../components/KarnatakaMap";
import { EmptyState } from "../components/EmptyState";
import { GITNAADU_URL, YOUTUBE_CHANNEL } from "../lib/socials";
import { courses, findLesson, getVideos } from "../lib/catalog";
import { blogPosts, formatDate } from "../lib/blog";
import { REPO_URL } from "../lib/github";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useProgressStore } from "../store/progress";
import { Difficulty } from "../types";
import { cn } from "../lib/cn";

type Filter = "all" | Difficulty | "starred" | "progress";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
  { value: "progress", label: "In progress" },
  { value: "starred", label: "Starred" },
];

export function HomePage() {
  useDocumentTitle();

  return (
    <>
      <Hero />
      <section id="courses" className="container-page scroll-mt-20 pt-8 sm:pt-12">
        <CourseCatalog />
      </section>
      <Features />
      <Community />
    </>
  );
}

function Hero() {
  const lastWatched = useProgressStore((s) => s.lastWatched);
  const resume = lastWatched && findLesson(lastWatched.videoId);

  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[120px] lg:left-[72%]" />
      <div className="pointer-events-none absolute bottom-0 right-[10%] hidden h-72 w-72 rounded-full bg-[#E8112D]/[0.08] blur-[100px] lg:block" />

      <div className="container-page relative grid items-center gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pb-24 lg:pt-16">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex h-9 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] pl-2 pr-4">
            <span className="flex h-5 w-5 overflow-hidden rounded-full ring-1 ring-white/20" aria-hidden="true">
              <span className="h-full w-1/2 bg-primary" />
              <span className="h-full w-1/2 bg-[#E8112D]" />
            </span>
            <span className="kn-line notranslate font-kannada text-[13px] font-semibold text-primary" translate="no">
              ನಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ತಂತ್ರಜ್ಞಾನ
            </span>
          </span>
          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
            Learn engineering
            <br />
            in <span className="text-gradient-gold">Kannada.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400 lg:mx-0">
            Quality technical education in Kannada, accessible to everyone. Start your learning
            journey today with carefully curated courses, notes and practice.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            {resume ? (
              <Link to={`/course/${resume.course.id}#lesson-${resume.video.id}`} className="btn-primary px-6 py-3.5 text-[15px]">
                <PlayCircle className="h-5 w-5" /> Continue learning
              </Link>
            ) : (
              <a href="#courses" className="btn-primary px-6 py-3.5 text-[15px]">
                Explore courses <ArrowRight className="h-4 w-4" />
              </a>
            )}
            <a href={YOUTUBE_CHANNEL} target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-3.5 text-[15px]">
              <Youtube className="h-5 w-5 text-red-500" /> YouTube channel
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[280px] animate-fade-in sm:max-w-[340px] lg:max-w-[360px]">
          <KarnatakaMap className="aspect-[400/621] w-full" />
          <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500">
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-primary/60" />
            <span className="kn-line notranslate font-kannada text-sm text-neutral-300" translate="no">
              31 ಜಿಲ್ಲೆಗಳು · ಒಂದೇ ಕನ್ನಡ
            </span>
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-[#E8112D]/60" />
          </p>
        </div>
      </div>
    </section>
  );
}

function CourseCatalog() {
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const filter = (params.get("level") as Filter) || "all";
  const starredCourses = useProgressStore((s) => s.starredCourses);
  const completed = useProgressStore((s) => s.completedVideos);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return courses.filter((c) => {
      const lessons = getVideos(c.id);
      const haystack = `${c.title} ${c.description} ${lessons.map((v) => v.title).join(" ")}`.toLowerCase();
      if (!terms.every((t) => haystack.includes(t))) return false;
      if (filter === "starred") return starredCourses.includes(c.id);
      if (filter === "progress") {
        const done = lessons.filter((v) => completed.includes(v.id)).length;
        return done > 0 && done < lessons.length;
      }
      if (filter !== "all") return c.difficulty === filter;
      return true;
    });
  }, [query, filter, starredCourses, completed]);

  return (
    <>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Courses</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Available courses</h2>
          <p className="mt-2 text-neutral-400">Structured playlists with notes, practice and progress tracking.</p>
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Search courses</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Search courses or topics…"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-10 text-sm text-white placeholder:text-neutral-500 transition focus:border-primary/50 focus:bg-white/[0.06] focus:outline-none focus:ring-4 focus:ring-primary/10 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              onClick={() => update("q", "")}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-500 hover:bg-white/10 hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
      </div>

      <div className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Filter courses">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            role="tab"
            aria-selected={filter === f.value}
            onClick={() => update("level", f.value)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              filter === f.value
                ? "border-primary bg-primary text-dark"
                : "border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
            )}
          >
            {f.value === "starred" && <Star className="h-3.5 w-3.5" fill={filter === f.value ? "currentColor" : "none"} />}
            {f.label}
          </button>
        ))}
      </div>

      {results.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={filter === "starred" ? Star : Search}
            title={filter === "starred" && !query ? "No starred courses yet" : "No courses found"}
            action={
              <button className="btn-secondary" onClick={() => setParams({}, { replace: true, preventScrollReset: true })}>
                Clear filters
              </button>
            }
          >
            {filter === "starred" && !query
              ? "Tap the star on any course to keep it handy here."
              : "Try a different keyword, or ask for a new course on YouTube!"}
          </EmptyState>
        </div>
      )}
    </>
  );
}

const FEATURES = [
  { icon: Languages, title: "Taught in Kannada", body: "Concepts explained in the language you think in — no more getting lost in translation." },
  { icon: LineChart, title: "Track your progress", body: "Mark lessons done, save favourites and resume right where you stopped." },
  { icon: FileText, title: "Notes & practice", body: "Read lesson notes right here and sharpen your skills with practice problems." },
  { icon: BookOpen, title: "Structured paths", body: "Go from zero to confident with carefully ordered lessons for every topic." },
];

function Features() {
  return (
    <section className="container-page pt-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Why learn here</p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Built for Kannada-speaking engineers
        </h2>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card group p-6 transition hover:border-primary/25">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary group-hover:text-dark">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-400">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Community() {
  const latest = blogPosts[0];
  return (
    <section className="container-page grid gap-4 pt-6 lg:grid-cols-2">
      <div className="card relative overflow-hidden p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <Github className="h-8 w-8 text-white" />
        <h3 className="mt-5 text-2xl font-extrabold text-white">This site is open source</h3>
        <p className="mt-2 max-w-md text-neutral-400">
          Add a course, fix a bug or write a blog — and climb the contributor leaderboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <Github className="h-4 w-4" /> Contribute
          </a>
          <Link to="/leaderboard" className="btn-secondary">
            View leaderboard
          </Link>
        </div>
        <a
          href={GITNAADU_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-6 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 transition hover:border-primary/30"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GitBranch className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-white">GitNaadu</span>
            <span className="block truncate text-xs text-neutral-500">Another open-source project from Engineering in Kannada</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-neutral-500 transition group-hover:translate-x-0.5 group-hover:text-primary" />
        </a>
      </div>
      {latest && (
        <Link to={`/blogs/${latest.slug}`} className="card card-hover group relative flex flex-col overflow-hidden p-8">
          <p className="eyebrow">Latest from the blog</p>
          <h3 className="mt-4 text-2xl font-extrabold leading-snug text-white transition group-hover:text-primary">
            {latest.metadata.title}
          </h3>
          <p className="mt-3 line-clamp-2 text-neutral-400">{latest.metadata.description}</p>
          <p className="mt-auto flex items-center justify-between pt-6 text-sm text-neutral-500">
            <span>
              {latest.metadata.author} · {formatDate(latest.metadata.date)}
            </span>
            <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
          </p>
        </Link>
      )}
    </section>
  );
}
