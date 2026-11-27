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
  saveProfile: (profile: StudentProfile) => void;
  setWeeklyGoals: (goals: WeeklyGoals) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      profile: null,
      weeklyGoals: { lessons: 5, learningDays: 5 },
      saveProfile: (profile) => set({ profile }),
      setWeeklyGoals: (weeklyGoals) => set({ weeklyGoals }),
    }),
    {
      name: "student-dashboard",
      storage: createJSONStorage(() => localStorage),
      version: 4,
      migrate: (persisted) => {
        const state = {
          ...(persisted as Partial<DashboardState> & {
            studySessionStartedAt?: number | null;
            studySecondsByDate?: Record<string, number>;
            weeklyGoals?: { lessons?: number; learningDays?: number };
          }),
        };
        delete state.studySessionStartedAt;
        delete state.studySecondsByDate;
        state.weeklyGoals = {
          lessons: state.weeklyGoals?.lessons ?? 5,
          learningDays: state.weeklyGoals?.learningDays ?? 5,
        };
        return state as DashboardState;
      },
    }
  )
);
