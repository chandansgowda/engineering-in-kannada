import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DailyCompletions,
  STREAK_MILESTONES,
  sanitizeDailyCompletions,
  toLocalDateString,
} from "../lib/streak";

export interface LastWatched {
  courseId: string;
  videoId: string;
  at: number;
}

interface ProgressState {
  completedVideos: string[];
  starredVideos: string[];
  starredCourses: string[];
  lastWatched: LastWatched | null;
  dailyCompletions: DailyCompletions;
  celebratedMilestones: number[];
  markVideoComplete: (videoId: string) => void;
  markVideoIncomplete: (videoId: string) => void;
  toggleVideoStarred: (videoId: string) => void;
  toggleCourseStarred: (courseId: string) => void;
  setLastWatched: (courseId: string, videoId: string) => void;
  resetVideos: (videoIds: string[]) => void;
  markMilestoneCelebrated: (milestone: number) => void;
}

const without = (list: string[], id: string) => list.filter((x) => x !== id);
const toggle = (list: string[], id: string) =>
  list.includes(id) ? without(list, id) : [...list, id];

/**
 * Drops video IDs from today's activity only.
 * Historical days are left intact so longest streak and rank survive unchecks and course resets.
 * `completedVideos` can therefore omit IDs that still appear on past dates.
 */
function removeVideosFromToday(
  dailyCompletions: DailyCompletions,
  videoIds: Set<string>
): DailyCompletions {
  const today = toLocalDateString();
  const todayIds = dailyCompletions[today];
  if (!todayIds) return dailyCompletions;
  const filtered = todayIds.filter((id) => !videoIds.has(id));
  if (filtered.length === todayIds.length) return dailyCompletions;
  if (filtered.length === 0) {
    const next = { ...dailyCompletions };
    delete next[today];
    return next;
  }
  return { ...dailyCompletions, [today]: filtered };
}

export function sanitizeMilestones(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const valid = new Set<number>(STREAK_MILESTONES);
  return Array.from(new Set(raw.filter((m): m is number => typeof m === "number" && valid.has(m))));
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      completedVideos: [],
      starredVideos: [],
      starredCourses: [],
      lastWatched: null,
      dailyCompletions: {},
      celebratedMilestones: [],
      markVideoComplete: (videoId) =>
        set((s) => {
          if (s.completedVideos.includes(videoId)) return s;
          const today = toLocalDateString();
          const todayIds = s.dailyCompletions[today] ?? [];
          const nextTodayIds = todayIds.includes(videoId) ? todayIds : [...todayIds, videoId];
          return {
            completedVideos: [...s.completedVideos, videoId],
            dailyCompletions: {
              ...s.dailyCompletions,
              [today]: nextTodayIds,
            },
          };
        }),
      markVideoIncomplete: (videoId) =>
        set((s) => ({
          completedVideos: without(s.completedVideos, videoId),
          dailyCompletions: removeVideosFromToday(s.dailyCompletions, new Set([videoId])),
        })),
      toggleVideoStarred: (videoId) =>
        set((s) => ({ starredVideos: toggle(s.starredVideos, videoId) })),
      toggleCourseStarred: (courseId) =>
        set((s) => ({ starredCourses: toggle(s.starredCourses, courseId) })),
      setLastWatched: (courseId, videoId) =>
        set({ lastWatched: { courseId, videoId, at: Date.now() } }),
      resetVideos: (videoIds) =>
        set((s) => {
          const removeSet = new Set(videoIds);
          return {
            completedVideos: s.completedVideos.filter((id) => !removeSet.has(id)),
            dailyCompletions: removeVideosFromToday(s.dailyCompletions, removeSet),
          };
        }),
      markMilestoneCelebrated: (milestone) =>
        set((s) =>
          s.celebratedMilestones.includes(milestone)
            ? s
            : { celebratedMilestones: [...s.celebratedMilestones, milestone] }
        ),
    }),
    {
      // Same storage key as v1/v2 so existing learners keep their progress.
      name: "course-progress",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 2) {
          return {
            ...state,
            completedVideos: Array.from(new Set(state.completedVideos ?? [])),
            starredVideos: state.starredVideos ?? [],
            starredCourses: state.starredCourses ?? [],
            lastWatched: null,
            dailyCompletions: sanitizeDailyCompletions(state.dailyCompletions),
            celebratedMilestones: sanitizeMilestones(state.celebratedMilestones),
          } as ProgressState;
        }
        if (version < 3) {
          return {
            ...state,
            completedVideos: Array.from(new Set(state.completedVideos ?? [])),
            starredVideos: state.starredVideos ?? [],
            starredCourses: state.starredCourses ?? [],
            lastWatched: state.lastWatched ?? null,
            dailyCompletions: sanitizeDailyCompletions(state.dailyCompletions),
            celebratedMilestones: sanitizeMilestones(state.celebratedMilestones),
          } as ProgressState;
        }
        return state as ProgressState;
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
