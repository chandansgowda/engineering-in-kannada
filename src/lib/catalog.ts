import coursesData from "../data/courses.json";
import { Course, Video, VideoData } from "../types";

/**
 * All course + lesson data lives in small JSON files, so we load it eagerly.
 * That lets every page know lesson counts and progress without waterfalls.
 * Video files are matched to courses by file name (`src/data/videos/<course-id>.json`).
 */
const videoModules = import.meta.glob<VideoData>("../data/videos/*.json", {
  eager: true,
  import: "default",
});

export const courses = coursesData.courses as Course[];

const videosByCourse: Record<string, Video[]> = {};
for (const [path, data] of Object.entries(videoModules)) {
  const courseId = path.split("/").pop()!.replace(/\.json$/, "");
  videosByCourse[courseId] = data.videos;
}

export function getCourse(courseId: string | undefined): Course | undefined {
  return courses.find((c) => c.id === courseId);
}

export function getVideos(courseId: string): Video[] {
  return videosByCourse[courseId] ?? [];
}

export const totalLessons = courses.reduce((n, c) => n + getVideos(c.id).length, 0);

export interface LessonRef {
  course: Course;
  video: Video;
  index: number;
}

export const allLessons: LessonRef[] = courses.flatMap((course) =>
  getVideos(course.id).map((video, index) => ({ course, video, index }))
);

export function findLesson(videoId: string): LessonRef | undefined {
  return allLessons.find((l) => l.video.id === videoId);
}

/** Extracts the 11-char YouTube id from watch / youtu.be / embed / shorts URLs. */
export function youtubeId(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export function youtubeThumb(url: string | undefined, quality: "mq" | "hq" = "mq") {
  const id = youtubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/${quality}default.jpg` : null;
}

/** Strips the leading "12. " numbering that lesson titles carry in the data files. */
export function lessonTitle(title: string) {
  return title.replace(/^\s*\d+[a-z]?\.\s*/i, "").trim();
}

export function isGithubMarkdown(url: string | undefined) {
  return !!url && url.includes("github.com") && /\.md($|[?#])/.test(url);
}
