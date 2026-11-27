import { allLessons, courses, getVideos } from "./catalog";
import { ENGINEERING_BRANCHES, type StudentProfile, type WeeklyGoals } from "../store/dashboard";
import { useDashboardStore } from "../store/dashboard";
import {
  useProgressStore,
  type LastWatched,
  type LessonCompletion,
} from "../store/progress";

const FORMAT = "engineering-in-kannada-progress";
const VERSION = 1;
const validLessonIds = new Set(allLessons.map(({ video }) => video.id));
const validCourseIds = new Set(courses.map((course) => course.id));
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

interface ProgressData {
  completedVideos: string[];
  completionRecords: Record<string, LessonCompletion>;
  starredVideos: string[];
  starredCourses: string[];
  lastWatched: LastWatched | null;
  recentlyAccessed: LastWatched[];
  activityByDate: Record<string, string[]>;
  learningDaysByDate: Record<string, true>;
}

interface DashboardData {
  profile: StudentProfile | null;
  weeklyGoals: WeeklyGoals;
}

interface ProgressFile {
  format: typeof FORMAT;
  version: typeof VERSION;
  exportedAt: string;
  progress: ProgressData;
  dashboard: DashboardData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function uniqueKnownIds(value: unknown, knownIds: Set<string>, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`The progress file has invalid ${label}.`);
  }
  return [...new Set(value.filter((id) => knownIds.has(id)))];
}

function isDateKey(value: string): boolean {
  if (!dateKeyPattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function parseLastWatched(value: unknown): LastWatched | null {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    typeof value.courseId !== "string" ||
    typeof value.videoId !== "string" ||
    typeof value.at !== "number" ||
    !Number.isFinite(value.at) ||
    !validCourseIds.has(value.courseId) ||
    !getVideos(value.courseId).some((video) => video.id === value.videoId)
  ) {
    return null;
  }
  return { courseId: value.courseId, videoId: value.videoId, at: value.at };
}

function parseProfile(value: unknown): StudentProfile | null {
  if (value === null) return null;
  if (
    !isRecord(value) ||
    typeof value.name !== "string" ||
    !value.name.trim() ||
    !ENGINEERING_BRANCHES.includes(value.branch as StudentProfile["branch"]) ||
    typeof value.semester !== "number" ||
    !Number.isInteger(value.semester) ||
    value.semester < 1 ||
    value.semester > 8 ||
    (value.college !== undefined && typeof value.college !== "string")
  ) {
    throw new Error("The progress file has an invalid student profile.");
  }
  return {
    name: value.name,
    branch: value.branch as StudentProfile["branch"],
    semester: value.semester,
    ...(typeof value.college === "string" ? { college: value.college } : {}),
  };
}

function parseWeeklyGoals(value: unknown): WeeklyGoals | null {
  if (
    !isRecord(value) ||
    typeof value.lessons !== "number" ||
    !Number.isInteger(value.lessons) ||
    value.lessons < 1 ||
    value.lessons > 100 ||
    typeof value.learningDays !== "number" ||
    !Number.isInteger(value.learningDays) ||
    value.learningDays < 1 ||
    value.learningDays > 7
  ) {
    return null;
  }
  return { lessons: value.lessons, learningDays: value.learningDays };
}

function parseProgressData(value: unknown): ProgressData {
  if (!isRecord(value)) throw new Error("The progress file is missing learning data.");
  const completedVideos = uniqueKnownIds(value.completedVideos, validLessonIds, "completed lessons");
  const starredVideos = uniqueKnownIds(value.starredVideos, validLessonIds, "saved lessons");
  const starredCourses = uniqueKnownIds(value.starredCourses, validCourseIds, "starred courses");

  if (!isRecord(value.activityByDate) || !isRecord(value.learningDaysByDate)) {
    throw new Error("The progress file has invalid activity dates.");
  }

  const activityByDate: Record<string, string[]> = {};
  for (const [date, ids] of Object.entries(value.activityByDate)) {
    if (!isDateKey(date) || !Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
      throw new Error("The progress file has invalid daily lesson activity.");
    }
    activityByDate[date] = [...new Set(ids.filter((id) => validLessonIds.has(id)))];
  }

  const learningDaysByDate: Record<string, true> = {};
  for (const [date, active] of Object.entries(value.learningDaysByDate)) {
    if (!isDateKey(date) || active !== true) throw new Error("The progress file has invalid learning days.");
    learningDaysByDate[date] = true;
  }

  const completionRecords: Record<string, LessonCompletion> = {};
  if (!isRecord(value.completionRecords)) throw new Error("The progress file has invalid completion records.");
  for (const [videoId, record] of Object.entries(value.completionRecords)) {
    if (!validLessonIds.has(videoId) || !isRecord(record)) continue;
    const lesson = allLessons.find(({ video }) => video.id === videoId);
    if (
      !lesson ||
      record.courseId !== lesson.course.id ||
      record.status !== "completed" ||
      typeof record.completedAt !== "number" ||
      !Number.isFinite(record.completedAt) ||
      typeof record.completionDate !== "string" ||
      !isDateKey(record.completionDate)
    ) {
      continue;
    }
    completionRecords[videoId] = {
      courseId: record.courseId,
      status: "completed",
      completedAt: record.completedAt,
      completionDate: record.completionDate,
    };
  }

  if (!Array.isArray(value.recentlyAccessed)) throw new Error("The progress file has invalid recent lessons.");
  const recentlyAccessed = value.recentlyAccessed
    .map((item) => {
      const recent = parseLastWatched(item);
      if (!recent) throw new Error("The progress file has an invalid recently accessed lesson.");
      return recent;
    });
  const lastWatched = parseLastWatched(value.lastWatched);
  if (value.lastWatched !== null && !lastWatched) {
    throw new Error("The progress file has an invalid last-watched lesson.");
  }
  return {
    completedVideos,
    completionRecords,
    starredVideos,
    starredCourses,
    lastWatched,
    recentlyAccessed,
    activityByDate,
    learningDaysByDate,
  };
}

export function createProgressExport(): ProgressFile {
  const { completedVideos, completionRecords, starredVideos, starredCourses, lastWatched, recentlyAccessed, activityByDate, learningDaysByDate } =
    useProgressStore.getState();
  const { profile, weeklyGoals } = useDashboardStore.getState();
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    progress: {
      completedVideos,
      completionRecords,
      starredVideos,
      starredCourses,
      lastWatched,
      recentlyAccessed,
      activityByDate,
      learningDaysByDate,
    },
    dashboard: { profile, weeklyGoals },
  };
}

export function mergeProgressImport(input: unknown): void {
  if (
    !isRecord(input) ||
    input.format !== FORMAT ||
    input.version !== VERSION ||
    !isRecord(input.dashboard)
  ) {
    throw new Error("This file is not a supported Engineering in Kannada progress backup.");
  }

  const imported = parseProgressData(input.progress);
  const importedProfile = parseProfile(input.dashboard.profile);
  const importedGoals = parseWeeklyGoals(input.dashboard.weeklyGoals);
  if (!importedGoals) throw new Error("The progress file has invalid weekly goals.");

  const current = useProgressStore.getState();
  const mergedActivity = { ...current.activityByDate };
  for (const [date, ids] of Object.entries(imported.activityByDate)) {
    mergedActivity[date] = [...new Set([...(mergedActivity[date] ?? []), ...ids])];
  }
  const mergedLearningDays = { ...current.learningDaysByDate, ...imported.learningDaysByDate };
  for (const [date, ids] of Object.entries(mergedActivity)) {
    if (ids.length) mergedLearningDays[date] = true;
  }
  const recentByCourse = new Map<string, LastWatched>();
  for (const item of [...current.recentlyAccessed, ...imported.recentlyAccessed]) {
    const previous = recentByCourse.get(item.courseId);
    if (!previous || item.at > previous.at) recentByCourse.set(item.courseId, item);
  }
  const importedLastWatched = imported.lastWatched;
  const lastWatched =
    importedLastWatched && (!current.lastWatched || importedLastWatched.at > current.lastWatched.at)
      ? importedLastWatched
      : current.lastWatched;

  useProgressStore.setState({
    completedVideos: [...new Set([...current.completedVideos, ...imported.completedVideos])],
    completionRecords: { ...imported.completionRecords, ...current.completionRecords },
    starredVideos: [...new Set([...current.starredVideos, ...imported.starredVideos])],
    starredCourses: [...new Set([...current.starredCourses, ...imported.starredCourses])],
    lastWatched,
    recentlyAccessed: [...recentByCourse.values()].sort((a, b) => b.at - a.at),
    activityByDate: mergedActivity,
    learningDaysByDate: mergedLearningDays,
  });

  const currentDashboard = useDashboardStore.getState();
  useDashboardStore.setState({
    profile: currentDashboard.profile ?? importedProfile,
    weeklyGoals:
      currentDashboard.weeklyGoals.lessons !== 5 || currentDashboard.weeklyGoals.learningDays !== 5
        ? currentDashboard.weeklyGoals
        : importedGoals,
  });
}
