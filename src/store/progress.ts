import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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
  markVideoComplete: (videoId: string) => void;
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
      starredVideos: [],
      starredCourses: [],
      lastWatched: null,
      markVideoComplete: (videoId) =>
        set((s) =>
          s.completedVideos.includes(videoId)
            ? s
            : { completedVideos: [...s.completedVideos, videoId] }
        ),
      markVideoIncomplete: (videoId) =>
        set((s) => ({ completedVideos: without(s.completedVideos, videoId) })),
      toggleVideoStarred: (videoId) =>
        set((s) => ({ starredVideos: toggle(s.starredVideos, videoId) })),
      toggleCourseStarred: (courseId) =>
        set((s) => ({ starredCourses: toggle(s.starredCourses, courseId) })),
      setLastWatched: (courseId, videoId) =>
        set({ lastWatched: { courseId, videoId, at: Date.now() } }),
      resetVideos: (videoIds) =>
        set((s) => ({
          completedVideos: s.completedVideos.filter((id) => !videoIds.includes(id)),
        })),
    }),
    {
      // Same storage key as v1 so existing learners keep their progress.
      name: "course-progress",
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 2) {
          return {
            ...state,
            completedVideos: Array.from(new Set(state.completedVideos ?? [])),
            starredVideos: state.starredVideos ?? [],
            starredCourses: state.starredCourses ?? [],
            lastWatched: null,
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
