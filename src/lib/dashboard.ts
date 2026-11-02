import { allLessons, courses, getVideos, lessonTitle, type LessonRef } from "./catalog";
import type { EngineeringBranch, StudentProfile } from "../store/dashboard";
import type { LastWatched } from "../store/progress";

export function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getCurrentWeekKeys(date = new Date()): string[] {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return localDateKey(day);
  });
}

export function getLearningStreak(activityByDate: Record<string, string[]>, today = new Date()) {
  const activeDays = Object.keys(activityByDate)
    .filter((date) => (activityByDate[date]?.length ?? 0) > 0)
    .sort();
  const active = new Set(activeDays);
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayKey = localDateKey(todayDate);
  const yesterday = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - 1);
  let current = 0;
  let cursor = active.has(todayKey) ? todayDate : active.has(localDateKey(yesterday)) ? yesterday : null;
  while (cursor && active.has(localDateKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
  }

  let longest = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const key of activeDays) {
    const date = dateFromKey(key);
    const nextDay = previous ? new Date(previous.getFullYear(), previous.getMonth(), previous.getDate() + 1) : null;
    const consecutive = nextDay !== null && localDateKey(nextDay) === key;
    run = consecutive ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return { current, longest };
}

export function getWeeklyActivity(
  activityByDate: Record<string, string[]>,
  studySecondsByDate: Record<string, number>,
  weekKeys = getCurrentWeekKeys()
) {
  const lessons = new Set(weekKeys.flatMap((date) => activityByDate[date] ?? []));
  const seconds = weekKeys.reduce((total, date) => total + (studySecondsByDate[date] ?? 0), 0);
  return { lessons: lessons.size, seconds, weekKeys };
}

const branchTopics: Record<EngineeringBranch, string[]> = {
  CSE: ["python", "data structures", "algorithm", "git", "web development", "programming"],
  AIML: ["python", "data structures", "algorithm", "programming", "data"],
  ISE: ["python", "data structures", "algorithm", "git", "web development", "programming"],
  ECE: ["c programming", "programming", "data structures", "python"],
  EEE: ["c programming", "programming", "data structures", "python"],
  Mechanical: ["c programming", "programming", "python"],
  Civil: ["c programming", "programming", "python"],
  Other: ["programming", "python", "data structures"],
};

function recommendationScore(
  lesson: LessonRef,
  profile: StudentProfile | null,
  starredVideoIds: string[],
  accessedCourseIds: string[]
): number {
  let score = 0;
  if (starredVideoIds.includes(lesson.video.id)) score += 100;
  if (accessedCourseIds.includes(lesson.course.id)) score += 25;

  if (profile) {
    const text = `${lesson.course.title} ${lesson.course.description} ${lesson.video.title}`.toLowerCase();
    const topics = branchTopics[profile.branch] ?? branchTopics.Other;
    if (topics.some((topic) => text.includes(topic))) score += 20;
    if (profile.semester <= 2 && lesson.course.difficulty === "Beginner") score += 8;
    if (profile.semester >= 5 && lesson.course.difficulty === "Intermediate") score += 8;
  }

  return score;
}

export function getRecommendedLessons(
  completedVideoIds: string[],
  starredVideoIds: string[],
  recentlyAccessed: LastWatched[],
  profile: StudentProfile | null,
  limit = 4
): LessonRef[] {
  const completed = new Set(completedVideoIds);
  if (!profile && starredVideoIds.length === 0 && recentlyAccessed.length === 0) {
    const startingLessons = courses
      .map((course) => allLessons.find(({ course: item, video }) => item.id === course.id && !completed.has(video.id)))
      .filter((lesson): lesson is LessonRef => Boolean(lesson));
    return startingLessons.slice(0, limit);
  }
  const accessedCourseIds = recentlyAccessed.map((item) => item.courseId);
  const remaining = allLessons.filter(({ video }) => !completed.has(video.id));
  return remaining
    .map((lesson, index) => ({
      lesson,
      score: recommendationScore(lesson, profile, starredVideoIds, accessedCourseIds),
      index,
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ lesson }) => lesson);
}

export function getEnrolledCourses(completedVideoIds: string[], recentlyAccessed: LastWatched[]) {
  const accessed = new Set(recentlyAccessed.map((item) => item.courseId));
  const completed = new Set(completedVideoIds);
  for (const course of courses) {
    if (getVideos(course.id).some((video) => completed.has(video.id))) accessed.add(course.id);
  }
  return courses.filter((course) => accessed.has(course.id));
}

export function formatLastAccessed(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (localDateKey(date) === localDateKey(today)) return "Today";
  if (localDateKey(date) === localDateKey(yesterday)) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export function getNextLesson(courseId: string, completedVideoIds: string[]) {
  const videos = getVideos(courseId);
  const next = videos.find((video) => !completedVideoIds.includes(video.id));
  if (!next) return null;
  const index = videos.indexOf(next);
  const lesson = allLessons.find(({ video }) => video.id === next.id);
  return lesson ? { ...lesson, index } : null;
}

export function displayLessonTitle(lesson: LessonRef): string {
  return lessonTitle(lesson.video.title);
}
