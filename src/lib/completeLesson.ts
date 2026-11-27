import { getVideos, lessonTitle } from "./catalog";
import { celebrateCourse, celebrateLesson } from "./celebrate";
import { trackEvent } from "./analytics";
import { toast } from "../store/toast";
import { useProgressStore } from "../store/progress";
import type { Course, Video } from "../types";

type CompletionSource = "playback" | "manual" | "youtube-open";

export function completeLesson(
  course: Course,
  video: Video,
  origin?: HTMLElement | null,
  source: CompletionSource = "playback"
): boolean {
  const store = useProgressStore.getState();
  if (store.completedVideos.includes(video.id)) return false;

  store.markVideoComplete(course.id, video.id);
  const completed = useProgressStore.getState().completedVideos;
  const courseComplete = getVideos(course.id).every((lesson) => completed.includes(lesson.id));
  if (courseComplete) {
    celebrateCourse();
    toast(
      source === "youtube-open"
        ? "Course marked complete after opening its final lesson. YouTube viewing isn't verified."
        : `You finished ${course.title}! 🎉`,
      "success"
    );
    trackEvent("course_complete", { course_id: course.id });
  } else {
    celebrateLesson(origin);
    toast(
      source === "youtube-open"
        ? "Lesson marked complete when opened. YouTube viewing isn't verified."
        : `Lesson completed: ${lessonTitle(video.title)}`,
      "success"
    );
  }
  return true;
}
