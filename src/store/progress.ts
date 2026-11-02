import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const localDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export interface LastWatched {
  courseId: string;
  videoId: string;
  at: number;
}

export interface LessonCompletion {
  courseId: string;
  status: "completed";
  completedAt: number;
  completionDate: string;
}

interface ProgressState {
  completedVideos: string[];
  completionRecords: Record<string, LessonCompletion>;
  starredVideos: string[];
  starredCourses: string[];
  lastWatched: LastWatched | null;
  recentlyAccessed: LastWatched[];
  activityByDate: Record<string, string[]>;
  learningDaysByDate: Record<string, true>;
  markVideoComplete: (courseId: string, videoId: string) => void;
  recordLearningDay: () => void;
  markVideoIncomplete: (videoId: string) => void;
  toggleVideoStarred: (videoId: string) => void;
  toggleCourseStarred: (courseId: string) => void;
  setLastWatched: (courseId: string, videoId: string) => void;
  resetVideos: (videoIds: string[]) => void;
}

const without = (list: string[], id: string) => list.filter((x) => x !== id);
const toggle = (list: string[], id: string) =>
  list.includes(id) ? without(list, id) : [...list, id];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedVideos: [],
      completionRecords: {},
      starredVideos: [],
      starredCourses: [],
      lastWatched: null,
      recentlyAccessed: [],
      activityByDate: {},
      learningDaysByDate: {},
      markVideoComplete: (courseId, videoId) =>
        set((s) => {
          if (s.completedVideos.includes(videoId)) return s;
          const now = new Date();
          const date = localDateKey(now);
          const lessons = s.activityByDate[date] ?? [];
          return {
            completedVideos: [...s.completedVideos, videoId],
            completionRecords: {
              ...s.completionRecords,
              [videoId]: {
                courseId,
                status: "completed",
                completedAt: now.getTime(),
                completionDate: date,
              },
            },
            activityByDate: {
              ...s.activityByDate,
              [date]: lessons.includes(videoId) ? lessons : [...lessons, videoId],
            },
          };
        }),
      recordLearningDay: () =>
        set((s) => {
          const date = localDateKey(new Date());
          if (s.learningDaysByDate[date]) return s;
          return {
            learningDaysByDate: { ...s.learningDaysByDate, [date]: true },
          };
        }),
      markVideoIncomplete: (videoId) =>
        set((s) => {
          const completionRecords = { ...s.completionRecords };
          delete completionRecords[videoId];
          return {
            completedVideos: without(s.completedVideos, videoId),
            completionRecords,
          };
        }),
      toggleVideoStarred: (videoId) =>
        set((s) => ({ starredVideos: toggle(s.starredVideos, videoId) })),
      toggleCourseStarred: (courseId) =>
        set((s) => ({ starredCourses: toggle(s.starredCourses, courseId) })),
      setLastWatched: (courseId, videoId) =>
        set((s) => {
          const accessed = { courseId, videoId, at: Date.now() };
          return {
            lastWatched: accessed,
            recentlyAccessed: [
              accessed,
              ...s.recentlyAccessed.filter((item) => item.courseId !== courseId),
            ],
          };
        }),
      resetVideos: (videoIds) =>
        set((s) => {
          const resetIds = new Set(videoIds);
          const completionRecords = Object.fromEntries(
            Object.entries(s.completionRecords).filter(([id]) => !resetIds.has(id))
          );
          return {
            completedVideos: s.completedVideos.filter((id) => !resetIds.has(id)),
            completionRecords,
          };
        }),
    }),
    {
      // Same storage key as v1 so existing learners keep their progress.
      name: "course-progress",
      storage: createJSONStorage(() => localStorage),
      version: 5,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        const migrated: Partial<ProgressState> = version < 2
          ? {
            ...state,
            completedVideos: Array.from(new Set(state.completedVideos ?? [])),
            starredVideos: state.starredVideos ?? [],
            starredCourses: state.starredCourses ?? [],
            lastWatched: null,
          }
          : state;
        if (version < 3) {
          migrated.recentlyAccessed = migrated.lastWatched ? [migrated.lastWatched] : [];
          migrated.activityByDate = {};
        }
        if (version < 4) migrated.completionRecords = {};
        if (version < 5) migrated.learningDaysByDate = {};
        return migrated as ProgressState;
      },
    }
  )
);

/** Completed / total for a list of lesson ids, re-rendering only when the count changes. */
export function useCourseProgress(videoIds: string[]) {
  const done = useProgressStore(
    (s) => videoIds.filter((id) => s.completedVideos.includes(id)).length
  );
  const total = videoIds.length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}
