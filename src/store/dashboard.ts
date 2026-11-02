import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const ENGINEERING_BRANCHES = [
  "CSE",
  "AIML",
  "ISE",
  "ECE",
  "EEE",
  "Mechanical",
  "Civil",
  "Other",
] as const;

export type EngineeringBranch = (typeof ENGINEERING_BRANCHES)[number];

export interface StudentProfile {
  name: string;
  branch: EngineeringBranch;
  semester: number;
  college?: string;
}

export interface WeeklyGoals {
  lessons: number;
  learningDays: number;
}

interface DashboardState {
  profile: StudentProfile | null;
  weeklyGoals: WeeklyGoals;
  studySecondsByDate: Record<string, number>;
  saveProfile: (profile: StudentProfile) => void;
  setWeeklyGoals: (goals: WeeklyGoals) => void;
  addStudySeconds: (date: string, seconds: number) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      profile: null,
      weeklyGoals: { lessons: 5, learningDays: 5 },
      studySecondsByDate: {},
      saveProfile: (profile) => set({ profile }),
      setWeeklyGoals: (weeklyGoals) => set({ weeklyGoals }),
      addStudySeconds: (date, seconds) =>
        set((state) => ({
          studySecondsByDate: {
            ...state.studySecondsByDate,
            [date]: (state.studySecondsByDate[date] ?? 0) + seconds,
          },
        })),
    }),
    {
      name: "student-dashboard",
      storage: createJSONStorage(() => localStorage),
      version: 3,
      migrate: (persisted) => {
        const state = {
          ...(persisted as Partial<DashboardState> & {
            studySessionStartedAt?: number | null;
            weeklyGoals?: { lessons?: number; learningDays?: number };
          }),
        };
        delete state.studySessionStartedAt;
        state.weeklyGoals = {
          lessons: state.weeklyGoals?.lessons ?? 5,
          learningDays: state.weeklyGoals?.learningDays ?? 5,
        };
        return state as DashboardState;
      },
    }
  )
);
