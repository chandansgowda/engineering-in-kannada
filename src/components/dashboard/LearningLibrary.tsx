import { BookmarkX, CheckCircle2, GraduationCap, Play, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { allLessons, courses, lessonTitle, youtubeThumb } from "../../lib/catalog";
import { useProgressStore } from "../../store/progress";
import { CourseCard } from "../CourseCard";
import { EmptyState } from "../EmptyState";
import { Img } from "../Img";

export function LearningLibrary() {
  const completed = useProgressStore((state) => state.completedVideos);
  const starredVideos = useProgressStore((state) => state.starredVideos);
  const starredCourses = useProgressStore((state) => state.starredCourses);

  const savedLessons = allLessons.filter(({ video }) => starredVideos.includes(video.id));
  const favorites = courses.filter((course) => starredCourses.includes(course.id));

  return (
    <section id="saved-lessons" className="scroll-mt-24 space-y-10" aria-labelledby="learning-library-title">
      <div>
        <p className="eyebrow">Saved for later</p>
        <h2 id="learning-library-title" className="mt-2 text-xl font-extrabold text-white">Your learning library</h2>
      </div>

      {!savedLessons.length && !favorites.length ? (
        <EmptyState
          icon={GraduationCap}
          title="Your learning library is empty"
          action={<Link to="/" className="btn-primary">Browse courses</Link>}
        >
          Star lessons or courses to keep them here for later.
        </EmptyState>
      ) : (
        <>
          {savedLessons.length > 0 && (
            <section aria-labelledby="saved-lessons-title">
              <h3 id="saved-lessons-title" className="mb-5 flex items-center gap-3 text-xl font-extrabold text-white">
                Saved lessons
                <span className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-xs font-bold text-neutral-400">
                  {savedLessons.length}
                </span>
              </h3>
              <ul className="grid gap-3 md:grid-cols-2">
                {savedLessons.map(({ course, video, index }) => {
                  const thumbnail = youtubeThumb(video.youtubeUrl);
                  const isComplete = completed.includes(video.id);
                  const lessonUrl = `/course/${course.id}#lesson-${video.id}`;
                  return (
                    <li key={video.id} className="card flex items-center gap-3 p-3">
                      <Link
                        to={lessonUrl}
                        className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-dark-600"
                      >
                        {thumbnail && <Img src={thumbnail} alt="" className="h-full w-full object-cover" />}
                        {isComplete && (
                          <span className="absolute right-1 top-1 rounded-full bg-emerald-500 p-0.5 text-dark">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link to={lessonUrl} className="line-clamp-2 text-sm font-semibold text-white hover:text-primary">
                          {lessonTitle(video.title)}
                        </Link>
                        <p className="mt-1 truncate text-xs text-neutral-500">
                          {course.title} · Lesson {index + 1}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                        {video.youtubeUrl && (
                          <Link
                            to={lessonUrl}
                            onClick={() => useProgressStore.getState().setLastWatched(course.id, video.id)}
                            className="icon-btn bg-primary/10 text-primary hover:bg-primary hover:text-dark"
                            aria-label={`Watch “${lessonTitle(video.title)}”`}
                          >
                            <Play className="h-4 w-4" fill="currentColor" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => useProgressStore.getState().toggleVideoStarred(video.id)}
                          className="icon-btn"
                          aria-label={`Remove “${lessonTitle(video.title)}” from saved`}
                        >
                          <BookmarkX className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {favorites.length > 0 && (
            <section id="starred-courses" className="scroll-mt-24" aria-labelledby="starred-courses-title">
              <h3 id="starred-courses-title" className="mb-5 flex items-center gap-3 text-xl font-extrabold text-white">
                <Star className="h-5 w-5 text-primary" />
                Starred courses
                <span className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-xs font-bold text-neutral-400">
                  {favorites.length}
                </span>
              </h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.map((course, index) => <CourseCard key={course.id} course={course} index={index} />)}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}
