import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  FileText,
  ListChecks,
  Play,
  RotateCcw,
  Share2,
  Star,
} from "lucide-react";
import { getCourse, getVideos, courses, lessonTitle } from "../lib/catalog";
import { useCourseProgress, useProgressStore } from "../store/progress";
import { shareLink } from "../lib/share";
import { trackEvent } from "../lib/analytics";
import { toast } from "../store/toast";
import { LessonRow } from "../components/LessonRow";
import { NotesViewer } from "../components/NotesViewer";
import { CourseCard, CourseThumbFallback, DifficultyBadge } from "../components/CourseCard";
import { ProgressBar, ProgressRing } from "../components/ProgressRing";
import { EmptyState } from "../components/EmptyState";
import { Img } from "../components/Img";
import { Video } from "../types";
import { NotFoundPage } from "./NotFoundPage";
import { cn } from "../lib/cn";

type Tab = "all" | "remaining" | "completed" | "saved";

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const course = getCourse(courseId);

  if (!course) {
    return (
      <NotFoundPage
        title="Course not found"
        message="This course may have been renamed or removed. Browse all available courses instead."
      />
    );
  }
  return <CourseView key={course.id} courseId={course.id} />;
}

function CourseView({ courseId }: { courseId: string }) {
  const course = getCourse(courseId)!;
  const videos = useMemo(() => getVideos(courseId), [courseId]);
  const ids = useMemo(() => videos.map((v) => v.id), [videos]);
  const { done, total, percent } = useCourseProgress(ids);
  const completed = useProgressStore((s) => s.completedVideos);
  const saved = useProgressStore((s) => s.starredVideos);
  const starred = useProgressStore((s) => s.starredCourses.includes(courseId));
  const { hash } = useLocation();

  const [tab, setTab] = useState<Tab>("all");
  const [notesFor, setNotesFor] = useState<Video | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  const nextIndex = videos.findIndex((v) => !completed.includes(v.id));
  const next = nextIndex >= 0 ? videos[nextIndex] : null;
  const notesCount = videos.filter((v) => v.notesUrl?.trim()).length;
  const practiceCount = videos.filter((v) => v.codingQuestionUrl?.trim()).length;

  // Highlight the lesson linked from search / "continue learning".
  useEffect(() => {
    if (!hash.startsWith("#lesson-")) return;
    const id = decodeURIComponent(hash.slice("#lesson-".length));
    setTab("all");
    setHighlight(id);
    const t = setTimeout(() => setHighlight(null), 2600);
    return () => clearTimeout(t);
  }, [hash]);

  const counts: Record<Tab, number> = {
    all: total,
    remaining: total - done,
    completed: done,
    saved: videos.filter((v) => saved.includes(v.id)).length,
  };

  const visible = videos
    .map((video, index) => ({ video, index }))
    .filter(({ video }) => {
      if (tab === "remaining") return !completed.includes(video.id);
      if (tab === "completed") return completed.includes(video.id);
      if (tab === "saved") return saved.includes(video.id);
      return true;
    });

  const openNotes = useCallback((v: Video) => setNotesFor(v), []);

  const resetProgress = () => {
    if (window.confirm(`Reset your progress for “${course.title}”?`)) {
      useProgressStore.getState().resetVideos(ids);
      toast("Progress reset");
    }
  };

  const others = courses.filter((c) => c.id !== courseId).slice(0, 3);

  return (
    <>
      <div className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <Img src={course.thumbnail} alt="" className="h-full w-full scale-110 object-cover blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-dark/70 via-dark/90 to-dark" />

        <div className="container-page relative pb-10 pt-6 sm:pb-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500">
            <Link to="/" className="inline-flex items-center gap-1.5 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Courses
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-neutral-300">{course.title}</span>
          </nav>

          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
            <div className="animate-fade-up">
              <DifficultyBadge level={course.difficulty} />
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{course.title}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-neutral-400">{course.description}</p>

              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-400">
                <li className="inline-flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" /> {total} lessons
                </li>
                {notesCount > 0 && (
                  <li className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> {notesCount} with notes
                  </li>
                )}
                {practiceCount > 0 && (
                  <li className="inline-flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-primary" /> {practiceCount} practice sets
                  </li>
                )}
                <li className="inline-flex items-center gap-2">
                  <span className="font-kannada text-primary">ಕ</span> Kannada
                </li>
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                {next?.youtubeUrl ? (
                  <a
                    href={next.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      useProgressStore.getState().setLastWatched(courseId, next.id);
                      trackEvent("watch_video", { course_id: courseId, video_id: next.id });
                    }}
                    className="btn-primary px-5 py-3"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {done === 0 ? "Start course" : `Continue · Lesson ${nextIndex + 1}`}
                  </a>
                ) : (
                  done === total &&
                  total > 0 && (
                    <span className="btn bg-emerald-500/15 px-5 py-3 text-emerald-300 ring-1 ring-emerald-500/30">
                      <CheckCircle2 className="h-4 w-4" /> Course completed
                    </span>
                  )
                )}
                <button
                  onClick={() => shareLink(course.title, `${window.location.origin}/course/${course.id}`)}
                  className="btn-secondary px-4 py-3"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button
                  onClick={() => useProgressStore.getState().toggleCourseStarred(courseId)}
                  aria-pressed={starred}
                  className={cn("btn-secondary px-4 py-3", starred && "border-primary/40 text-primary")}
                >
                  <Star className="h-4 w-4" fill={starred ? "currentColor" : "none"} />
                  {starred ? "Starred" : "Star"}
                </button>
              </div>
            </div>

            <div className="card animate-fade-up overflow-hidden [animation-delay:100ms]">
              <div className="relative aspect-video bg-dark-600">
                <Img
                  src={course.thumbnail}
                  alt=""
                  className="h-full w-full object-cover"
                  fallback={<CourseThumbFallback title={course.title} />}
                />
              </div>
              <div className="flex items-center gap-4 p-5">
                <ProgressRing percent={percent} size={64} stroke={6} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-white">
                    {done === total && total > 0 ? "All done. Great work!" : "Your progress"}
                  </p>
                  <p className="text-sm text-neutral-400">
                    {done} of {total} lessons completed
                  </p>
                  <ProgressBar percent={percent} className="mt-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="container-page pt-10" aria-labelledby="lessons-heading">
        <h2 id="lessons-heading" className="sr-only">
          Lessons
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="tablist" aria-label="Filter lessons">
            {(["all", "remaining", "completed", "saved"] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition",
                  tab === t ? "bg-white/[0.08] text-white" : "text-neutral-500 hover:text-white"
                )}
              >
                {t}
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                    tab === t ? "bg-primary text-dark" : "bg-white/[0.06] text-neutral-400"
                  )}
                >
                  {counts[t]}
                </span>
              </button>
            ))}
          </div>
          {done > 0 && (
            <button onClick={resetProgress} className="btn-ghost self-start px-3 py-2 text-xs text-neutral-500 sm:self-auto">
              <RotateCcw className="h-3.5 w-3.5" /> Reset progress
            </button>
          )}
        </div>

        {visible.length ? (
          <ol className="mt-6 grid gap-3">
            {visible.map(({ video, index }) => (
              <LessonRow
                key={video.id}
                course={course}
                video={video}
                index={index}
                isNext={next?.id === video.id && done > 0}
                highlighted={highlight === video.id}
                onOpenNotes={openNotes}
              />
            ))}
          </ol>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={tab === "saved" ? Star : tab === "completed" ? CheckCircle2 : ListChecks}
              title={
                tab === "saved"
                  ? "No saved lessons in this course"
                  : tab === "completed"
                    ? "Nothing completed yet"
                    : "You've completed every lesson!"
              }
              action={
                <button className="btn-secondary" onClick={() => setTab("all")}>
                  Show all lessons
                </button>
              }
            >
              {tab === "saved"
                ? "Tap the star on a lesson to save it for later."
                : tab === "completed"
                  ? "Tick the circle next to a lesson once you've watched it."
                  : "Time to pick your next course."}
            </EmptyState>
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section className="container-page pt-20">
          <h2 className="text-2xl font-extrabold text-white">Keep learning</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((c, i) => (
              <CourseCard key={c.id} course={c} index={i} />
            ))}
          </div>
        </section>
      )}

      {notesFor && (
        <NotesViewer url={notesFor.notesUrl} title={lessonTitle(notesFor.title)} onClose={() => setNotesFor(null)} />
      )}
    </>
  );
}
