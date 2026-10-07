import { memo, useRef } from "react";
import { Check, Code2, ExternalLink, FileText, Play, Share2, Star } from "lucide-react";
import { Course, Video } from "../types";
import { getVideos, isGithubMarkdown, lessonTitle, youtubeThumb } from "../lib/catalog";
import { useProgressStore } from "../store/progress";
import { celebrateCourse, celebrateLesson } from "../lib/celebrate";
import { shareLink } from "../lib/share";
import { toast } from "../store/toast";
import { trackEvent } from "../lib/analytics";
import { Img } from "./Img";
import { cn } from "../lib/cn";

interface LessonRowProps {
  course: Course;
  video: Video;
  index: number;
  isNext?: boolean;
  highlighted?: boolean;
  onOpenNotes: (video: Video) => void;
}

export const LessonRow = memo(function LessonRow({
  course,
  video,
  index,
  isNext,
  highlighted,
  onOpenNotes,
}: LessonRowProps) {
  const completed = useProgressStore((s) => s.completedVideos.includes(video.id));
  const starred = useProgressStore((s) => s.starredVideos.includes(video.id));
  const lastWatched = useProgressStore((s) => s.lastWatched?.videoId === video.id);
  const checkRef = useRef<HTMLButtonElement>(null);
  const title = lessonTitle(video.title);
  const thumb = youtubeThumb(video.youtubeUrl);

  const toggleComplete = () => {
    const store = useProgressStore.getState();
    if (completed) {
      store.markVideoIncomplete(video.id);
      return;
    }
    store.markVideoComplete(video.id);
    const ids = getVideos(course.id).map((v) => v.id);
    const done = useProgressStore.getState().completedVideos;
    if (ids.every((id) => done.includes(id))) {
      celebrateCourse();
      toast(`You finished ${course.title}! 🎉`, "success");
      trackEvent("course_complete", { course_id: course.id });
    } else {
      celebrateLesson(checkRef.current);
    }
  };

  const toggleStar = () => {
    useProgressStore.getState().toggleVideoStarred(video.id);
    toast(starred ? "Removed from saved lessons" : "Saved to My Learning", starred ? "default" : "success");
  };

  const onWatch = () => {
    useProgressStore.getState().setLastWatched(course.id, video.id);
    trackEvent("watch_video", { course_id: course.id, video_id: video.id });
  };

  const share = () => {
    if (!video.youtubeUrl) return toast("Video not available yet!");
    shareLink(video.title, video.youtubeUrl);
  };

  const notes = video.notesUrl?.trim();
  const practice = video.codingQuestionUrl?.trim();

  return (
    <li
      id={`lesson-${video.id}`}
      className={cn(
        "group relative flex gap-3 rounded-2xl border p-3 transition-all duration-300 sm:gap-4 sm:p-4",
        highlighted
          ? "border-primary/60 bg-primary/[0.07] shadow-glow"
          : isNext
            ? "border-primary/25 bg-white/[0.04]"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]",
        completed && !highlighted && "opacity-80 hover:opacity-100"
      )}
    >
      <button
        ref={checkRef}
        onClick={toggleComplete}
        aria-pressed={completed}
        aria-label={completed ? `Mark “${title}” as not done` : `Mark “${title}” as done`}
        className={cn(
          "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 active:scale-90",
          completed
            ? "border-emerald-500 bg-emerald-500 text-dark"
            : "border-white/15 text-neutral-400 hover:border-primary hover:text-primary"
        )}
      >
        {completed ? <Check className="h-4 w-4" strokeWidth={3} /> : index + 1}
      </button>

      {thumb && (
        <a
          href={video.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWatch}
          tabIndex={-1}
          aria-hidden="true"
          className="relative hidden aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-dark-600 sm:block md:w-44"
        >
          <Img src={thumb} alt="" width={176} height={99} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-dark">
              <Play className="h-4 w-4 translate-x-px" fill="currentColor" />
            </span>
          </span>
        </a>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                Lesson {index + 1}
              </span>
              <span className="chip">{video.type}</span>
              {isNext && !completed && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-dark">
                  Up next
                </span>
              )}
              {lastWatched && !isNext && (
                <span className="text-[11px] font-semibold text-neutral-500">· Last opened</span>
              )}
            </div>
            <h3 className={cn("font-semibold leading-snug sm:text-[17px]", completed ? "text-neutral-300" : "text-white")}>
              {title}
            </h3>
          </div>
          <div className="-mr-1 -mt-1 flex shrink-0">
            <button onClick={share} className="icon-btn" aria-label={`Share “${title}”`}>
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={toggleStar}
              aria-pressed={starred}
              className={cn("icon-btn", starred && "text-primary hover:text-primary")}
              aria-label={starred ? `Unsave “${title}”` : `Save “${title}”`}
            >
              <Star className="h-4 w-4" fill={starred ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {video.youtubeUrl ? (
            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onWatch}
              className="btn-primary px-3.5 py-2 text-[13px]"
            >
              <Play className="h-3.5 w-3.5" fill="currentColor" /> Watch
            </a>
          ) : (
            <button onClick={() => toast("🚀 Video coming soon! Stay tuned.")} className="btn-secondary px-3.5 py-2 text-[13px] opacity-60">
              <Play className="h-3.5 w-3.5" /> Coming soon
            </button>
          )}
          {notes &&
            (isGithubMarkdown(notes) ? (
              <button onClick={() => onOpenNotes(video)} className="btn-secondary px-3.5 py-2 text-[13px]">
                <FileText className="h-3.5 w-3.5" /> Notes
              </button>
            ) : (
              <a href={notes} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3.5 py-2 text-[13px]">
                <FileText className="h-3.5 w-3.5" /> Notes <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            ))}
          {practice && (
            <a href={practice} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3.5 py-2 text-[13px]">
              <Code2 className="h-3.5 w-3.5" /> Practice <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )}
        </div>
      </div>
    </li>
  );
});
