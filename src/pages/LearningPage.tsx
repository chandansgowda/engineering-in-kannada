import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookmarkX,
  CheckCircle2,
  Download,
  GraduationCap,
  Play,
  Star,
  Trophy,
  Upload,
  Flame,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { CourseCard } from "../components/CourseCard";
import { EmptyState } from "../components/EmptyState";
import { ProgressRing } from "../components/ProgressRing";
import { Img } from "../components/Img";
import { allLessons, courses, getVideos, lessonTitle, youtubeThumb } from "../lib/catalog";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { useProgressStore } from "../store/progress";
import { toast } from "../store/toast";

export function LearningPage() {
  useDocumentTitle("My Learning");
  const completed = useProgressStore((s) => s.completedVideos);
  const starredVideos = useProgressStore((s) => s.starredVideos);
  const starredCourses = useProgressStore((s) => s.starredCourses);

  const courseStats = courses.map((course) => {
    const videos = getVideos(course.id);
    const done = videos.filter((v) => completed.includes(v.id)).length;
    const nextIndex = videos.findIndex((v) => !completed.includes(v.id));
    return { course, videos, done, total: videos.length, nextIndex };
  });
  const inProgress = courseStats.filter((c) => c.done > 0 && c.done < c.total);
  const finished = courseStats.filter((c) => c.total > 0 && c.done === c.total);
  const savedLessons = allLessons.filter((l) => starredVideos.includes(l.video.id));
  const favourites = courses.filter((c) => starredCourses.includes(c.id));
  const completedKnown = allLessons.filter((l) => completed.includes(l.video.id)).length;
  const isEmpty = !completedKnown && !savedLessons.length && !favourites.length;

  return (
    <>
      <PageHeader
        eyebrow="Your dashboard"
        title={
          <>
            My <span className="text-gradient-gold">Learning</span>
          </>
        }
        description="Everything you've watched, saved and finished — in one place. Progress is saved in this browser."
      >
        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: CheckCircle2, value: completedKnown, label: "Lessons done" },
            { icon: Flame, value: inProgress.length, label: "In progress" },
            { icon: Trophy, value: finished.length, label: "Courses finished" },
            { icon: Star, value: savedLessons.length, label: "Saved lessons" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="card p-4">
              <Icon className="h-5 w-5 text-primary" />
              <dd className="mt-3 text-3xl font-extrabold text-white">{value}</dd>
              <dt className="text-xs font-medium text-neutral-500">{label}</dt>
            </div>
          ))}
        </dl>
      </PageHeader>

      <div className="container-page space-y-16 pt-12">
        {isEmpty && (
          <EmptyState
            icon={GraduationCap}
            title="Your learning journey starts here"
            action={
              <Link to="/" className="btn-primary">
                Browse courses <ArrowRight className="h-4 w-4" />
              </Link>
            }
          >
            Mark lessons as done, star courses and save lessons for later — they'll all show up here.
          </EmptyState>
        )}

        {inProgress.length > 0 && (
          <Section title="Continue learning">
            <div className="grid gap-4 md:grid-cols-2">
              {inProgress.map(({ course, videos, done, total, nextIndex }) => {
                const percent = Math.round((done / total) * 100);
                const next = videos[nextIndex];
                return (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}#lesson-${next.id}`}
                    className="card card-hover group flex items-center gap-4 p-4"
                  >
                    <ProgressRing percent={percent} size={64} stroke={6} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">{course.title}</p>
                      <p className="mt-1 truncate text-sm text-neutral-400">
                        Next: {nextIndex + 1}. {lessonTitle(next.title)}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {done}/{total} lessons
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-dark transition group-hover:scale-110">
                      <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {savedLessons.length > 0 && (
          <Section title="Saved lessons" count={savedLessons.length}>
            <ul className="grid gap-3 md:grid-cols-2">
              {savedLessons.map(({ course, video, index }) => {
                const thumb = youtubeThumb(video.youtubeUrl);
                const done = completed.includes(video.id);
                return (
                  <li key={video.id} className="card flex items-center gap-3 p-3">
                    <Link
                      to={`/course/${course.id}#lesson-${video.id}`}
                      className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-dark-600"
                    >
                      {thumb && <Img src={thumb} alt="" className="h-full w-full object-cover" />}
                      {done && (
                        <span className="absolute right-1 top-1 rounded-full bg-emerald-500 p-0.5 text-dark">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/course/${course.id}#lesson-${video.id}`}
                        className="line-clamp-2 text-sm font-semibold text-white hover:text-primary"
                      >
                        {lessonTitle(video.title)}
                      </Link>
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {course.title} · Lesson {index + 1}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                      {video.youtubeUrl && (
                        <a
                          href={video.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => useProgressStore.getState().setLastWatched(course.id, video.id)}
                          className="icon-btn bg-primary/10 text-primary hover:bg-primary hover:text-dark"
                          aria-label={`Watch “${lessonTitle(video.title)}”`}
                        >
                          <Play className="h-4 w-4" fill="currentColor" />
                        </a>
                      )}
                      <button
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
          </Section>
        )}

        {favourites.length > 0 && (
          <Section title="Starred courses" count={favourites.length}>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favourites.map((c, i) => (
                <CourseCard key={c.id} course={c} index={i} />
              ))}
            </div>
          </Section>
        )}

        <BackupCard />
      </div>
    </>
  );
}

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3 text-xl font-extrabold text-white">
        {title}
        {count !== undefined && (
          <span className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-xs font-bold text-neutral-400">{count}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

/** Progress lives in localStorage, so let learners carry it between devices. */
function BackupCard() {
  const fileRef = useRef<HTMLInputElement>(null);

  const exportProgress = () => {
    const { completedVideos, starredVideos, starredCourses, lastWatched } = useProgressStore.getState();
    const blob = new Blob(
      [JSON.stringify({ app: "engineering-in-kannada", version: 2, completedVideos, starredVideos, starredCourses, lastWatched }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eik-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Progress exported", "success");
  };

  const importProgress = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const list = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
      if (data.app !== "engineering-in-kannada") throw new Error("not ours");
      const s = useProgressStore.getState();
      useProgressStore.setState({
        completedVideos: Array.from(new Set([...s.completedVideos, ...list(data.completedVideos)])),
        starredVideos: Array.from(new Set([...s.starredVideos, ...list(data.starredVideos)])),
        starredCourses: Array.from(new Set([...s.starredCourses, ...list(data.starredCourses)])),
        lastWatched: s.lastWatched ?? data.lastWatched ?? null,
      });
      toast("Progress restored", "success");
    } catch {
      toast("That file doesn't look like a progress backup", "error");
    }
  };

  return (
    <section className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-bold text-white">Switching devices?</h2>
        <p className="mt-1 text-sm text-neutral-400">
          Export your progress and import it on another browser. Imports are merged, nothing is lost.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button onClick={exportProgress} className="btn-secondary">
          <Download className="h-4 w-4" /> Export
        </button>
        <button onClick={() => fileRef.current?.click()} className="btn-secondary">
          <Upload className="h-4 w-4" /> Import
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importProgress(file);
            e.target.value = "";
          }}
        />
      </div>
    </section>
  );
}
