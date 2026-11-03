import { ArrowRight, Clock3, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { formatLastAccessed } from "../../lib/dashboard";
import { findLesson, getVideos, lessonTitle } from "../../lib/catalog";
import type { LastWatched } from "../../store/progress";
import { Img } from "../Img";
import { CourseThumbFallback } from "../CourseCard";
import { ProgressBar } from "../ProgressRing";

export function ContinueLearning({
  recentlyAccessed,
  completedVideoIds,
}: {
  recentlyAccessed: LastWatched[];
  completedVideoIds: string[];
}) {
  const recent = recentlyAccessed
    .map((item) => ({ item, lesson: findLesson(item.videoId) }))
    .filter((entry): entry is { item: LastWatched; lesson: NonNullable<ReturnType<typeof findLesson>> } => Boolean(entry.lesson))
    .slice(0, 3);

  return (
    <section aria-labelledby="continue-title">
      <div className="mb-4">
        <p className="eyebrow">Pick up where you left off</p>
        <h2 id="continue-title" className="mt-2 text-xl font-extrabold text-white">Continue learning</h2>
      </div>
      {recent.length ? (
        <div className="grid gap-3">
          {recent.map(({ item, lesson }) => {
            const videos = getVideos(lesson.course.id);
            const done = videos.filter((video) => completedVideoIds.includes(video.id)).length;
            const percent = videos.length ? Math.round((done / videos.length) * 100) : 0;
            const target = `/course/${lesson.course.id}#lesson-${lesson.video.id}`;
            return (
              <article key={lesson.course.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <Link to={target} className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-dark-600 sm:w-32">
                  <Img
                    src={lesson.course.thumbnail}
                    alt={`${lesson.course.title} thumbnail`}
                    className="h-full w-full object-cover"
                    fallback={<CourseThumbFallback title={lesson.course.title} />}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-white">{lesson.course.title}</h3>
                  <p className="mt-1 truncate text-sm text-neutral-400">Last lesson: {lessonTitle(lesson.video.title)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <ProgressBar percent={percent} className="max-w-48 flex-1" />
                    <span className="text-xs font-semibold text-neutral-500">{done}/{videos.length}</span>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock3 className="h-3.5 w-3.5" /> Last accessed {formatLastAccessed(item.at)}
                  </p>
                </div>
                <Link to={target} className="btn-primary shrink-0 px-3 py-2.5">
                  <Play className="h-4 w-4" fill="currentColor" />
                  <span className="sm:hidden lg:inline">Continue</span>
                  <ArrowRight className="hidden h-4 w-4 sm:inline lg:hidden" />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="card flex flex-col items-start gap-3 p-5">
          <p className="text-sm leading-relaxed text-neutral-400">
            Open a course lesson to save your place here. Your next lesson is always one click away.
          </p>
          <Link to="/" className="btn-secondary">Browse courses <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}
    </section>
  );
}
