export const STREAK_MILESTONES = [7, 14, 30, 60, 100] as const;

/** Maps local calendar dates (`YYYY-MM-DD`) to unique completed video IDs. */
export type DailyCompletions = Record<string, string[]>;

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  weeklyConsistency: number;
  totalActiveDays: number;
  isActiveToday: boolean;
}

export interface HeatmapDay {
  date: string;
  count: number;
  intensity: 0 | 1 | 2 | 3;
  isToday: boolean;
  weekday: number;
  label: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Formats a Date into `YYYY-MM-DD` using the user's local calendar, avoiding UTC shifts. */
export function toLocalDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Validates `YYYY-MM-DD` format and ensures the calendar date actually exists (handles leap years). */
export function isValidDateString(dateStr: string): boolean {
  if (!DATE_RE.test(dateStr)) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  return parsed.getFullYear() === y && parsed.getMonth() === m - 1 && parsed.getDate() === d;
}

/** Adds/subtracts calendar days safely across month, year, leap-year and DST boundaries. */
export function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const next = new Date(y, m - 1, d + days);
  return toLocalDateString(next);
}

/** Formats `YYYY-MM-DD` as `"26 Nov 2026"` without locale dependency. */
export function formatActivityDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** Validates and deduplicates raw `dailyCompletions` from storage or import files. */
export function sanitizeDailyCompletions(raw: unknown): DailyCompletions {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const result: DailyCompletions = {};
  for (const [date, ids] of Object.entries(raw as Record<string, unknown>)) {
    if (!isValidDateString(date) || !Array.isArray(ids)) continue;
    const cleanIds = Array.from(
      new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))
    );
    if (cleanIds.length > 0) {
      result[date] = cleanIds;
    }
  }
  return result;
}

/** Merges two `DailyCompletions` maps non-destructively (used during backup import). */
export function mergeDailyCompletions(
  current: DailyCompletions,
  incoming: DailyCompletions
): DailyCompletions {
  const merged: DailyCompletions = {};
  for (const [date, ids] of Object.entries(current)) {
    merged[date] = [...ids];
  }
  for (const [date, ids] of Object.entries(incoming)) {
    const existing = merged[date] ?? [];
    const combined = Array.from(new Set([...existing, ...ids]));
    if (combined.length > 0) {
      merged[date] = combined;
    }
  }
  return merged;
}

/** Returns sorted ascending valid active dates on or before `todayStr`. */
export function getValidActiveDates(
  dailyCompletions: DailyCompletions,
  todayStr: string = toLocalDateString()
): string[] {
  if (!isValidDateString(todayStr)) return [];
  return Object.entries(dailyCompletions)
    .filter(([date, ids]) => isValidDateString(date) && date <= todayStr && Array.isArray(ids) && ids.length > 0)
    .map(([date]) => date)
    .sort();
}

/** Computes current streak, longest streak, Monday-based weekly consistency, and total active days. */
export function calculateStreakStats(
  dailyCompletions: DailyCompletions,
  todayStr: string = toLocalDateString()
): StreakStats {
  const activeDates = getValidActiveDates(dailyCompletions, todayStr);
  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      weeklyConsistency: 0,
      totalActiveDays: 0,
      isActiveToday: false,
    };
  }

  const activeSet = new Set(activeDates);
  const isActiveToday = activeSet.has(todayStr);
  const yesterdayStr = addDays(todayStr, -1);

  // Current streak: active today continues/starts; active yesterday stays alive until today ends.
  let currentStreak = 0;
  let cursor = isActiveToday ? todayStr : activeSet.has(yesterdayStr) ? yesterdayStr : null;
  while (cursor && activeSet.has(cursor)) {
    currentStreak++;
    cursor = addDays(cursor, -1);
  }

  // Longest streak across all valid historical dates.
  let longestStreak = 0;
  let run = 0;
  let prevDate: string | null = null;
  for (const date of activeDates) {
    if (prevDate && date === addDays(prevDate, 1)) {
      run++;
    } else {
      run = 1;
    }
    if (run > longestStreak) longestStreak = run;
    prevDate = date;
  }

  // Weekly consistency: Monday-start calendar week up to todayStr.
  const [y, m, d] = todayStr.split("-").map(Number);
  const dayOfWeek = new Date(y, m - 1, d).getDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayStr = addDays(todayStr, offsetToMonday);
  let weeklyConsistency = 0;
  let weekCursor = mondayStr;
  while (weekCursor <= todayStr) {
    if (activeSet.has(weekCursor)) weeklyConsistency++;
    weekCursor = addDays(weekCursor, 1);
  }

  return {
    currentStreak,
    longestStreak,
    weeklyConsistency,
    totalActiveDays: activeDates.length,
    isActiveToday,
  };
}

function getIntensity(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  return 3;
}

/** Builds a chronological `days`-day activity grid ending on `todayStr`. */
export function getActivityHeatmap(
  dailyCompletions: DailyCompletions,
  todayStr: string = toLocalDateString(),
  days = 28
): HeatmapDay[] {
  if (!isValidDateString(todayStr) || days <= 0) return [];
  const startStr = addDays(todayStr, -(days - 1));
  const result: HeatmapDay[] = [];

  for (let i = 0; i < days; i++) {
    const date = addDays(startStr, i);
    const ids = dailyCompletions[date];
    const count = Array.isArray(ids) ? ids.length : 0;
    const [y, m, d] = date.split("-").map(Number);
    const weekday = new Date(y, m - 1, d).getDay();
    result.push({
      date,
      count,
      intensity: getIntensity(count),
      isToday: date === todayStr,
      weekday,
      label: formatActivityDate(date),
    });
  }

  return result;
}

/**
 * Returns the lowest uncelebrated milestone that `currentStreak` has reached or passed.
 * Callers celebrate one milestone at a time so skipped days still surface 7 before 14, without repeats.
 */
export function getAchievedMilestone(
  currentStreak: number,
  celebratedMilestones: number[]
): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone && !celebratedMilestones.includes(milestone)) {
      return milestone;
    }
  }
  return null;
}

export type KalikeRank =
  | "Starter"
  | "Consistent"
  | "Dedicated"
  | "Achiever"
  | "Proficient"
  | "Champion";

/** Derives a permanent learning rank from `longestStreak`, starting at Starter for 0 days. */
export function getKalikeRank(longestStreak: number): KalikeRank {
  if (longestStreak < 7) return "Starter";
  if (longestStreak < 14) return "Consistent";
  if (longestStreak < 30) return "Dedicated";
  if (longestStreak < 60) return "Achiever";
  if (longestStreak < 100) return "Proficient";
  return "Champion";
}

export interface StreakPrompt {
  message: string;
  highlight?: string;
}

/** Returns a concise, context-aware motivational prompt derived from genuine streak stats. */
export function getStreakPrompt(stats: StreakStats): StreakPrompt {
  const { currentStreak, longestStreak, isActiveToday, totalActiveDays } = stats;
  const hasPreviousActivity = longestStreak > 0 || totalActiveDays > 0;

  // An alive streak with no activity yet today is at risk until midnight.
  if (currentStreak > 0 && !isActiveToday) {
    return {
      message: "Complete a lesson today to keep your streak alive.",
    };
  }

  if (currentStreak >= 3 && currentStreak === longestStreak) {
    return {
      highlight: "Personal best",
      message: "New personal best! Keep going.",
    };
  }

  if (longestStreak >= 3 && currentStreak === longestStreak - 1) {
    return {
      highlight: "Almost there",
      message: "You're one day away from matching your best streak!",
    };
  }

  if (currentStreak === 0 && hasPreviousActivity) {
    return {
      message:
        longestStreak >= 2
          ? `Your best was ${longestStreak} days. Start a new journey today.`
          : "Your streak reset. Complete a lesson today to start a new one.",
    };
  }

  if (currentStreak > 0) {
    return {
      message: "You're building a consistent learning habit.",
    };
  }

  return {
    message: "Complete your first lesson today to start a learning streak.",
  };
}

/**
 * When the local calendar rolls past midnight, keep a user-picked historical date
 * but move the selection forward if it was still pointing at the previous "today".
 */
export function applyLocalDateChange(
  previousToday: string | null,
  nextToday: string,
  selectedDate: string | null
): { todayStr: string; selectedDate: string } {
  if (previousToday === null || previousToday === nextToday) {
    return { todayStr: nextToday, selectedDate: selectedDate ?? nextToday };
  }
  const followToday = selectedDate === null || selectedDate === previousToday;
  return {
    todayStr: nextToday,
    selectedDate: followToday ? nextToday : selectedDate,
  };
}

/** Milliseconds until the next local midnight, for dashboard date refresh. */
export function msUntilNextLocalMidnight(now: Date = new Date()): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(next.getTime() - now.getTime(), 0);
}
