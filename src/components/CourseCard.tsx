import { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, PlayCircle, Star } from "lucide-react";
import { Course } from "../types";
import { getVideos } from "../lib/catalog";
import { useCourseProgress, useProgressStore } from "../store/progress";
import { Img } from "./Img";
import { ProgressBar } from "./ProgressRing";
import { cn } from "../lib/cn";

export function DifficultyBadge({ level, className }: { level: Course["difficulty"]; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-dark/60 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary ring-1 ring-inset ring-primary/40 backdrop-blur-md",
        className
      )}
    >
      {level}
    </span>
  );
}

export function CourseThumbFallback({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-600 via-dark-700 to-primary/20 p-6">
      <span className="text-center text-lg font-extrabold text-white/80">{title}</span>
    </div>
  );
}

export const CourseCard = memo(function CourseCard({ course, index = 0 }: { course: Course; index?: number }) {
  const ids = useMemo(() => getVideos(course.id).map((v) => v.id), [course.id]);
  const { done, total, percent } = useCourseProgress(ids);
  const starred = useProgressStore((s) => s.starredCourses.includes(course.id));
  const toggleStar = useProgressStore((s) => s.toggleCourseStarred);
  const complete = total > 0 && done === total;

  return (
    <article
      className="card card-hover group relative flex animate-fade-up flex-col overflow-hidden"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="relative aspect-video overflow-hidden bg-dark-600">
        <Img
          src={course.thumbnail}
          alt=""
          width={480}
          height={270}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          fallback={<CourseThumbFallback title={course.title} />}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-dark shadow-glow">
            <PlayCircle className="h-7 w-7" />
          </span>
        </div>
        <DifficultyBadge level={course.difficulty} className="absolute left-4 top-4" />
        {complete && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-dark">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug text-white">
          <Link to={`/course/${course.id}`} className="after:absolute after:inset-0 focus:outline-none">
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">{course.description}</p>

        <div className="mt-auto pt-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-neutral-400">
              {total} {total === 1 ? "lesson" : "lessons"}
            </span>
            <span className={done ? "text-primary" : "text-neutral-500"}>
              {done > 0 ? `${done}/${total} · ${percent}%` : "Not started"}
            </span>
          </div>
          <ProgressBar percent={percent} />
        </div>
      </div>

      <button
        onClick={() => toggleStar(course.id)}
        aria-pressed={starred}
        aria-label={starred ? "Remove from starred courses" : "Star this course"}
        className={cn(
          "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition active:scale-90",
          starred ? "bg-primary text-dark" : "bg-black/40 text-white hover:bg-black/60"
        )}
      >
        <Star className="h-4 w-4" fill={starred ? "currentColor" : "none"} />
      </button>
    </article>
  );
});
