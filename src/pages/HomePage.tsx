import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Github,
  Languages,
  LineChart,
  PlayCircle,
  Search,
  Sparkles,
  Star,
  X,
  Youtube,
} from "lucide-react";
import { CourseCard } from "../components/CourseCard";
import { AnnouncementTicker } from "../components/AnnouncementTicker";
import { EmptyState } from "../components/EmptyState";
import { ProgressRing } from "../components/ProgressRing";
import { Img } from "../components/Img";
import { YOUTUBE_CHANNEL } from "../lib/socials";
import { courses, findLesson, getVideos, lessonTitle, totalLessons, youtubeThumb } from "../lib/catalog";
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
      <div className="container-page -mt-4 sm:-mt-8">
        <AnnouncementTicker />
      </div>
      <ContinueLearning />
      <section id="courses" className="container-page scroll-mt-20 pt-20">
        <CourseCatalog />
      </section>
      <Features />
      <Community />
    </>
  );
}

function Hero() {
  const completedCount = useProgressStore((s) => s.completedVideos.length);
  const lastWatched = useProgressStore((s) => s.lastWatched);
  const resume = lastWatched && findLesson(lastWatched.videoId);

  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[120px] lg:left-[70%]" />

      <div className="container-page relative grid items-center gap-12 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            100% free · <span className="font-kannada">ಕನ್ನಡದಲ್ಲಿ</span>
          </span>
          <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
            Learn engineering
            <br />
            in <span className="text-gradient-gold">Kannada.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-neutral-400 lg:mx-0">
            Quality technical education in Kannada, accessible to everyone. Start your learning
            journey today with my free and carefully curated content.
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

          <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-8 sm:max-w-lg lg:max-w-none">
            {[
              { value: courses.length, label: "Courses" },
              { value: totalLessons, label: "Video lessons" },
              { value: completedCount ? completedCount : "₹0", label: completedCount ? "You've completed" : "Forever free" },
            ].map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-3xl font-extrabold text-white sm:text-4xl">{s.value}</dd>
                <dd className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:120ms] lg:max-w-none">
          <div className="relative rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.01] p-10 shadow-card backdrop-blur sm:p-14">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,215,0,0.14),transparent_60%)]" />
            <img
              src="/images/logo.png"
              alt="ಕನ್ನಡದಲ್ಲಿ Engineering"
              width={420}
              height={180}
              {...{ fetchpriority: "high" }}
              className="relative mx-auto w-full max-w-[340px] animate-float drop-shadow-[0_10px_40px_rgba(255,215,0,0.25)]"
            />
          </div>
          <div className="absolute -left-3 top-6 hidden animate-fade-up items-center gap-2.5 rounded-2xl border border-white/10 bg-dark-700/90 px-3.5 py-2.5 shadow-2xl backdrop-blur [animation-delay:400ms] sm:flex lg:-left-8">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-dark">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-white">Lesson complete!</span>
              <span className="block text-[11px] text-neutral-500">Progress saved automatically</span>
            </span>
          </div>
          <div className="absolute -bottom-5 -right-2 hidden animate-fade-up items-center gap-2.5 rounded-2xl border border-white/10 bg-dark-700/90 px-3.5 py-2.5 shadow-2xl backdrop-blur [animation-delay:550ms] sm:flex lg:-right-6">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-dark">
              <Languages className="h-4 w-4" />
            </span>
            <span className="text-left">
              <span className="block text-xs font-bold text-white">Python · C · DSA · Web</span>
              <span className="block text-[11px] text-neutral-500">Explained in Kannada</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContinueLearning() {
  const lastWatched = useProgressStore((s) => s.lastWatched);
  const completed = useProgressStore((s) => s.completedVideos);
  const resume = lastWatched && findLesson(lastWatched.videoId);
  if (!resume) return null;

  const videos = getVideos(resume.course.id);
  const done = videos.filter((v) => completed.includes(v.id)).length;
  const percent = Math.round((done / videos.length) * 100);
  const thumb = youtubeThumb(resume.video.youtubeUrl);

  return (
    <section className="container-page pt-16">
      <div className="mb-5 flex items-end justify-between">
        <h2 className="text-xl font-bold text-white">Pick up where you left off</h2>
        <Link to="/learning" className="text-sm font-semibold text-primary hover:underline">
          My Learning →
        </Link>
      </div>
      <Link
        to={`/course/${resume.course.id}#lesson-${resume.video.id}`}
        className="card card-hover group flex items-center gap-4 p-3 sm:gap-6 sm:p-4"
      >
        <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-dark-600 sm:w-48">
          {thumb && <Img src={thumb} alt="" className="h-full w-full object-cover" />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <PlayCircle className="h-8 w-8 text-white transition group-hover:scale-110 group-hover:text-primary" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{resume.course.title}</p>
          <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">
            Lesson {resume.index + 1}: {lessonTitle(resume.video.title)}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            {done} of {videos.length} lessons completed
          </p>
        </div>
        <div className="hidden pr-2 sm:block">
          <ProgressRing percent={percent} size={60} />
        </div>
      </Link>
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
  { icon: LineChart, title: "Track your progress", body: "Mark lessons done, save favourites and resume right where you stopped. Stored on your device." },
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
