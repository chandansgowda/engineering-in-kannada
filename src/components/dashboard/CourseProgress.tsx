import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { getNextLesson } from "../../lib/dashboard";
import { getVideos } from "../../lib/catalog";
import type { Course } from "../../types";
import type { LastWatched } from "../../store/progress";
import { Img } from "../Img";
import { CourseThumbFallback } from "../CourseCard";
import { ProgressBar } from "../ProgressRing";

export function CourseProgress({
  courses,
  completedVideoIds,
  recentlyAccessed,
}: {
  courses: Course[];
  completedVideoIds: string[];
  recentlyAccessed: LastWatched[];
}) {
  const recentByCourse = new Map(recentlyAccessed.map((item) => [item.courseId, item.videoId]));

  return (
    <section aria-labelledby="course-progress-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your courses</p>
          <h2 id="course-progress-title" className="mt-2 text-xl font-extrabold text-white">Course progress</h2>
        </div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-300">
          Browse all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {courses.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((course) => {
            const lessons = getVideos(course.id);
            const done = lessons.filter((lesson) => completedVideoIds.includes(lesson.id)).length;
            const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
            const next = getNextLesson(course.id, completedVideoIds);
            const lessonId = next?.video.id ?? recentByCourse.get(course.id);
            const href = lessonId ? `/course/${course.id}#lesson-${lessonId}` : `/course/${course.id}`;
            return (
              <article key={course.id} className="card flex gap-4 p-4">
                <Link to={href} className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-dark-600 sm:w-36">
                  <Img
                    src={course.thumbnail}
                    alt={`${course.title} thumbnail`}
                    className="h-full w-full object-cover"
                    fallback={<CourseThumbFallback title={course.title} />}
                  />
                  {percent === 100 && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-emerald-500 p-1 text-dark" title="Course completed">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                  )}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={href} className="line-clamp-2 text-sm font-bold leading-snug text-white hover:text-primary">
                    {course.title}
                  </Link>
                  <p className="mt-1 text-xs text-neutral-500">{done} of {lessons.length} lessons</p>
                  <div className="mt-auto pt-3">
                    <div className="mb-1.5 flex justify-between text-[11px] font-semibold">
                      <span className="text-neutral-500">{percent === 100 ? "Completed" : "Progress"}</span>
                      <span className="text-primary">{percent}%</span>
                    </div>
                    <ProgressBar percent={percent} />
                    <Link to={href} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-300">
                      {percent === 100 ? "Review course" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card flex flex-col items-start gap-3 p-5">
          <p className="text-sm leading-relaxed text-neutral-400">Your course progress will appear here after you start a lesson.</p>
          <Link to="/" className="btn-primary">Explore courses <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
    </section>
  );
}
