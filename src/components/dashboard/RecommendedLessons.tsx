import { ArrowRight, Bookmark, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { lessonTitle, youtubeThumb } from "../../lib/catalog";
import type { LessonRef } from "../../lib/catalog";
import { Img } from "../Img";
import { DifficultyBadge, CourseThumbFallback } from "../CourseCard";

export function RecommendedLessons({
  lessons,
  personalized,
}: {
  lessons: LessonRef[];
  personalized: boolean;
}) {
  return (
    <section aria-labelledby="recommendations-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{personalized ? "Picked for you" : "Good places to start"}</p>
          <h2 id="recommendations-title" className="mt-2 text-xl font-extrabold text-white">
            {personalized ? "Recommended lessons" : "Explore a lesson"}
          </h2>
        </div>
        <Link to="/" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:text-primary-300 sm:inline-flex">
          All courses <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {lessons.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {lessons.map(({ course, video, index }) => {
            const thumb = youtubeThumb(video.youtubeUrl) ?? course.thumbnail;
            return (
              <article key={video.id} className="card card-hover flex min-w-0 gap-3 p-3">
                <Link
                  to={`/course/${course.id}#lesson-${video.id}`}
                  aria-label={`Open ${lessonTitle(video.title)}`}
                  className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-dark-600 sm:w-32"
                >
                  <Img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                    fallback={<CourseThumbFallback title={course.title} />}
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-[11px] font-semibold text-neutral-500">{course.title}</p>
                  <Link
                    to={`/course/${course.id}#lesson-${video.id}`}
                    className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white hover:text-primary"
                  >
                    {lessonTitle(video.title)}
                  </Link>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <DifficultyBadge level={course.difficulty} className="px-2 py-0.5 text-[9px]" />
                    <Link
                      to={`/course/${course.id}#lesson-${video.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-300"
                    >
                      {video.type === "Theory" ? <Play className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                      Lesson {index + 1}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card p-6 text-center">
          <p className="font-semibold text-white">You have completed every available lesson</p>
          <p className="mt-1 text-sm text-neutral-400">Check back when new courses are added.</p>
        </div>
      )}
    </section>
  );
}
