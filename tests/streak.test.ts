import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  applyLocalDateChange,
  calculateStreakStats,
  getAchievedMilestone,
  getActivityHeatmap,
  getStreakPrompt,
  isValidDateString,
  mergeDailyCompletions,
  msUntilNextLocalMidnight,
  sanitizeDailyCompletions,
  toLocalDateString,
  type StreakStats,
} from "../src/lib/streak";

// ---------------------------------------------------------------------------
// Mock localStorage BEFORE loading the Zustand store.
// Static `import` is hoisted above runtime statements, so the store module
// must be loaded via dynamic `import()` after the mock is in place.
// ---------------------------------------------------------------------------
const storageMap = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  get length() {
    return storageMap.size;
  },
  clear() {
    storageMap.clear();
  },
  getItem(key: string) {
    return storageMap.get(key) ?? null;
  },
  key(index: number) {
    return Array.from(storageMap.keys())[index] ?? null;
  },
  removeItem(key: string) {
    storageMap.delete(key);
  },
  setItem(key: string, value: string) {
    storageMap.set(key, value);
  },
};

// Dynamic import – runs after the mock above is applied.
const { sanitizeMilestones, useProgressStore } = await import(
  "../src/store/progress"
);

function resetStore() {
  storageMap.clear();
  useProgressStore.setState({
    completedVideos: [],
    starredVideos: [],
    starredCourses: [],
    lastWatched: null,
    dailyCompletions: {},
    celebratedMilestones: [],
  });
}

test("1. First completed lesson starts streak at 1", () => {
  resetStore();
  useProgressStore.getState().markVideoComplete("py-1");
  const today = toLocalDateString();
  const state = useProgressStore.getState();

  assert.deepEqual(state.completedVideos, ["py-1"]);
  assert.deepEqual(state.dailyCompletions[today], ["py-1"]);

  const stats = calculateStreakStats(state.dailyCompletions, today);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.longestStreak, 1);
  assert.equal(stats.totalActiveDays, 1);
  assert.equal(stats.isActiveToday, true);
});

test("2. Multiple lessons completed on the same day count as one active day", () => {
  resetStore();
  useProgressStore.getState().markVideoComplete("py-1");
  useProgressStore.getState().markVideoComplete("py-2");
  useProgressStore.getState().markVideoComplete("py-3");
  const today = toLocalDateString();
  const state = useProgressStore.getState();

  assert.equal(state.dailyCompletions[today].length, 3);
  const stats = calculateStreakStats(state.dailyCompletions, today);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.longestStreak, 1);
  assert.equal(stats.totalActiveDays, 1);

  const heatmap = getActivityHeatmap(state.dailyCompletions, today, 28);
  const todayCell = heatmap[heatmap.length - 1];
  assert.equal(todayCell.count, 3);
  assert.equal(todayCell.intensity, 2);
});

test("3. Two consecutive learning days", () => {
  const stats = calculateStreakStats(
    { "2026-11-25": ["v1"], "2026-11-26": ["v2"] },
    "2026-11-26"
  );
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.longestStreak, 2);
});

test("4. Seven consecutive learning days", () => {
  const daily = {
    "2026-11-20": ["v1"],
    "2026-11-21": ["v2"],
    "2026-11-22": ["v3"],
    "2026-11-23": ["v4"],
    "2026-11-24": ["v5"],
    "2026-11-25": ["v6"],
    "2026-11-26": ["v7"],
  };
  const stats = calculateStreakStats(daily, "2026-11-26");
  assert.equal(stats.currentStreak, 7);
  assert.equal(stats.longestStreak, 7);
});

test("5 & 6. Missing one complete day breaks current streak, returning starts a new one without reducing longest", () => {
  const daily = {
    "2026-11-20": ["v1"],
    "2026-11-21": ["v2"],
    "2026-11-22": ["v3"],
    // 2026-11-23 missed
    "2026-11-24": ["v4"],
  };
  const missedStats = calculateStreakStats(daily, "2026-11-25");
  assert.equal(missedStats.currentStreak, 1); // 2026-11-24 was yesterday relative to 25th
  assert.equal(missedStats.longestStreak, 3);

  const brokenStats = calculateStreakStats(daily, "2026-11-26");
  assert.equal(brokenStats.currentStreak, 0);
  assert.equal(brokenStats.longestStreak, 3);

  const returned = { ...daily, "2026-11-26": ["v5"] };
  const returnedStats = calculateStreakStats(returned, "2026-11-26");
  assert.equal(returnedStats.currentStreak, 1);
  assert.equal(returnedStats.longestStreak, 3);
});

test("7 & 8. Activity today vs activity yesterday", () => {
  const yesterdayOnly = { "2026-11-25": ["v1"], "2026-11-24": ["v0"] };
  const statsYesterday = calculateStreakStats(yesterdayOnly, "2026-11-26");
  assert.equal(statsYesterday.currentStreak, 2);
  assert.equal(statsYesterday.isActiveToday, false);

  const withToday = { ...yesterdayOnly, "2026-11-26": ["v2"] };
  const statsToday = calculateStreakStats(withToday, "2026-11-26");
  assert.equal(statsToday.currentStreak, 3);
  assert.equal(statsToday.isActiveToday, true);
});

test("9. Month boundary", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-11-01", -1), "2026-10-31");
  const stats = calculateStreakStats(
    { "2026-10-30": ["v1"], "2026-10-31": ["v2"], "2026-11-01": ["v3"] },
    "2026-11-01"
  );
  assert.equal(stats.currentStreak, 3);
});

test("10. Year boundary", () => {
  assert.equal(addDays("2025-12-31", 1), "2026-01-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
  const stats = calculateStreakStats(
    { "2025-12-31": ["v1"], "2026-01-01": ["v2"] },
    "2026-01-01"
  );
  assert.equal(stats.currentStreak, 2);
});

test("11. Leap year handling", () => {
  assert.equal(isValidDateString("2024-02-29"), true);
  assert.equal(isValidDateString("2025-02-29"), false);
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2024-02-29", 1), "2024-03-01");
  const stats = calculateStreakStats(
    { "2024-02-28": ["v1"], "2024-02-29": ["v2"], "2024-03-01": ["v3"] },
    "2024-03-01"
  );
  assert.equal(stats.currentStreak, 3);
});

test("12. Future activity dates are ignored", () => {
  const stats = calculateStreakStats(
    {
      "2026-11-26": ["v1"],
      "2026-11-27": ["v2"],
      "2099-01-01": ["v3"],
    },
    "2026-11-26"
  );
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.longestStreak, 1);
  assert.equal(stats.totalActiveDays, 1);
});

test("13. Duplicate activity records are prevented", () => {
  resetStore();
  useProgressStore.getState().markVideoComplete("py-1");
  useProgressStore.getState().markVideoComplete("py-1");
  const today = toLocalDateString();
  assert.deepEqual(useProgressStore.getState().completedVideos, ["py-1"]);
  assert.deepEqual(useProgressStore.getState().dailyCompletions[today], ["py-1"]);

  const sanitized = sanitizeDailyCompletions({
    "2026-11-26": ["v1", "v1", "v2"],
    "invalid-date": ["v3"],
    "2025-02-29": ["v4"],
    "2026-11-25": [],
  });
  assert.deepEqual(sanitized, { "2026-11-26": ["v1", "v2"] });
});

test("14 & 15. Unchecking one of multiple vs final completed lesson for a day", () => {
  resetStore();
  const today = toLocalDateString();
  useProgressStore.getState().markVideoComplete("py-1");
  useProgressStore.getState().markVideoComplete("py-2");

  // Uncheck one: day remains active with py-2
  useProgressStore.getState().markVideoIncomplete("py-1");
  assert.deepEqual(useProgressStore.getState().dailyCompletions[today], ["py-2"]);
  assert.equal(
    calculateStreakStats(useProgressStore.getState().dailyCompletions, today).currentStreak,
    1
  );

  // Uncheck final: day is removed
  useProgressStore.getState().markVideoIncomplete("py-2");
  assert.equal(useProgressStore.getState().dailyCompletions[today], undefined);
  assert.equal(
    calculateStreakStats(useProgressStore.getState().dailyCompletions, today).currentStreak,
    0
  );
});

test("16 & 17. Persistence and Zustand v1/v2 -> v3 migration", async () => {
  resetStore();
  const persistOptions = useProgressStore.persist.getOptions();
  const migrate = persistOptions.migrate!;

  const migratedFromV2 = migrate(
    {
      completedVideos: ["py-1", "py-1", "py-2"],
      starredVideos: ["py-1"],
      starredCourses: ["python-fundamentals"],
      lastWatched: { courseId: "python-fundamentals", videoId: "py-2", at: 12345 },
    },
    2
  ) as ReturnType<typeof useProgressStore.getState>;

  assert.deepEqual(migratedFromV2.completedVideos, ["py-1", "py-2"]);
  assert.deepEqual(migratedFromV2.starredVideos, ["py-1"]);
  assert.deepEqual(migratedFromV2.dailyCompletions, {});
  assert.deepEqual(migratedFromV2.celebratedMilestones, []);

  // Simulate persistence write & rehydrate
  useProgressStore.getState().markVideoComplete("py-3");
  const savedRaw = storageMap.get("course-progress");
  assert.ok(savedRaw);
  const parsed = JSON.parse(savedRaw);
  assert.equal(parsed.version, 3);
  assert.ok(Array.isArray(parsed.state.dailyCompletions[toLocalDateString()]));
});

test("18. Export and import merge & validation", () => {
  const merged = mergeDailyCompletions(
    { "2026-11-25": ["v1"] },
    sanitizeDailyCompletions({
      "2026-11-25": ["v1", "v2"],
      "2026-11-26": ["v3"],
      "bad-date": ["v4"],
    })
  );
  assert.deepEqual(merged, {
    "2026-11-25": ["v1", "v2"],
    "2026-11-26": ["v3"],
  });
  assert.deepEqual(sanitizeMilestones([7, 7, 14, 999, "bad"]), [7, 14]);
});

test("19. Weekly consistency (Monday-start calendar week)", () => {
  // 2026-11-26 is Thursday; Monday is 2026-11-23.
  const daily = {
    "2026-11-22": ["prev-sun"], // previous week (Sunday)
    "2026-11-23": ["mon"],
    "2026-11-25": ["wed"],
    "2026-11-26": ["thu"],
  };
  const stats = calculateStreakStats(daily, "2026-11-26");
  assert.equal(stats.weeklyConsistency, 3);

  // Check Sunday (2026-11-29) includes Mon-Sun of that week
  const sundayStats = calculateStreakStats(daily, "2026-11-29");
  assert.equal(sundayStats.weeklyConsistency, 3);
});

test("20. Milestone celebration duplication prevention", () => {
  assert.equal(getAchievedMilestone(6, []), null);
  assert.equal(getAchievedMilestone(7, []), 7);
  assert.equal(getAchievedMilestone(7, [7]), null);
  assert.equal(getAchievedMilestone(14, [7]), 14);
  assert.equal(getAchievedMilestone(100, [7, 14, 30, 60]), 100);
  assert.equal(getAchievedMilestone(100, [7, 14, 30, 60, 100]), null);
});

test("21. Unchecking an old lesson preserves historical activity and longest streak", () => {
  resetStore();
  const today = toLocalDateString();
  const yesterday = addDays(today, -1);
  useProgressStore.setState({
    completedVideos: ["old-1", "today-1"],
    dailyCompletions: {
      [yesterday]: ["old-1"],
      [today]: ["today-1"],
    },
  });

  useProgressStore.getState().markVideoIncomplete("old-1");
  const state = useProgressStore.getState();

  assert.deepEqual(state.completedVideos, ["today-1"]);
  assert.deepEqual(state.dailyCompletions[yesterday], ["old-1"]);
  assert.deepEqual(state.dailyCompletions[today], ["today-1"]);

  const stats = calculateStreakStats(state.dailyCompletions, today);
  assert.equal(stats.currentStreak, 2);
  assert.equal(stats.longestStreak, 2);
  assert.equal(stats.totalActiveDays, 2);
});

test("22. Unchecking today's last lesson removes today only", () => {
  resetStore();
  const today = toLocalDateString();
  const yesterday = addDays(today, -1);
  useProgressStore.setState({
    completedVideos: ["old-1", "today-1"],
    dailyCompletions: {
      [yesterday]: ["old-1"],
      [today]: ["today-1"],
    },
  });

  useProgressStore.getState().markVideoIncomplete("today-1");
  const state = useProgressStore.getState();

  assert.deepEqual(state.completedVideos, ["old-1"]);
  assert.equal(state.dailyCompletions[today], undefined);
  assert.deepEqual(state.dailyCompletions[yesterday], ["old-1"]);

  const stats = calculateStreakStats(state.dailyCompletions, today);
  assert.equal(stats.isActiveToday, false);
  assert.equal(stats.currentStreak, 1);
  assert.equal(stats.longestStreak, 1);
});

test("23. Course progress reset does not erase historical streak records", () => {
  resetStore();
  const today = toLocalDateString();
  const yesterday = addDays(today, -1);
  const older = addDays(today, -2);
  useProgressStore.setState({
    completedVideos: ["py-1", "py-2", "js-1"],
    dailyCompletions: {
      [older]: ["py-1"],
      [yesterday]: ["py-2"],
      [today]: ["js-1", "py-1"],
    },
  });

  useProgressStore.getState().resetVideos(["py-1", "py-2"]);
  const state = useProgressStore.getState();

  assert.deepEqual(state.completedVideos, ["js-1"]);
  assert.deepEqual(state.dailyCompletions[older], ["py-1"]);
  assert.deepEqual(state.dailyCompletions[yesterday], ["py-2"]);
  assert.deepEqual(state.dailyCompletions[today], ["js-1"]);

  const stats = calculateStreakStats(state.dailyCompletions, today);
  assert.equal(stats.longestStreak, 3);
  assert.equal(stats.isActiveToday, true);
});

test("24. Skipped milestones return the lowest uncelebrated threshold", () => {
  assert.equal(getAchievedMilestone(10, []), 7);
  assert.equal(getAchievedMilestone(15, [7]), 14);
  assert.equal(getAchievedMilestone(30, []), 7);
  assert.equal(getAchievedMilestone(30, [7, 14]), 30);
  assert.equal(getAchievedMilestone(30, [7, 14, 30]), null);
  assert.equal(getAchievedMilestone(100, [7]), 14);
});

function promptStats(partial: Partial<StreakStats>): StreakStats {
  return {
    currentStreak: 0,
    longestStreak: 0,
    weeklyConsistency: 0,
    totalActiveDays: 0,
    isActiveToday: false,
    ...partial,
  };
}

test("25. At-risk prompt precedes personal-best and almost-there prompts", () => {
  const atRiskBest = getStreakPrompt(
    promptStats({ currentStreak: 5, longestStreak: 5, isActiveToday: false, totalActiveDays: 5 })
  );
  assert.equal(atRiskBest.highlight, undefined);
  assert.match(atRiskBest.message, /keep your streak alive/i);

  const atRiskAlmost = getStreakPrompt(
    promptStats({ currentStreak: 4, longestStreak: 5, isActiveToday: false, totalActiveDays: 9 })
  );
  assert.equal(atRiskAlmost.highlight, undefined);
  assert.match(atRiskAlmost.message, /keep your streak alive/i);

  const activeBest = getStreakPrompt(
    promptStats({ currentStreak: 5, longestStreak: 5, isActiveToday: true, totalActiveDays: 5 })
  );
  assert.equal(activeBest.highlight, "Personal best");
});

test("26. Previous activity with a zero current streak is not treated as a first lesson", () => {
  const afterBreak = getStreakPrompt(
    promptStats({ currentStreak: 0, longestStreak: 5, totalActiveDays: 8 })
  );
  assert.match(afterBreak.message, /best was 5 days/i);
  assert.doesNotMatch(afterBreak.message, /first lesson/i);

  const singleDayHistory = getStreakPrompt(
    promptStats({ currentStreak: 0, longestStreak: 1, totalActiveDays: 1 })
  );
  assert.doesNotMatch(singleDayHistory.message, /first lesson/i);

  const brandNew = getStreakPrompt(
    promptStats({ currentStreak: 0, longestStreak: 0, totalActiveDays: 0 })
  );
  assert.match(brandNew.message, /first lesson/i);
});

test("27. Local date refresh keeps a historical selection and follows previous today", () => {
  assert.deepEqual(applyLocalDateChange(null, "2026-11-27", null), {
    todayStr: "2026-11-27",
    selectedDate: "2026-11-27",
  });
  assert.deepEqual(applyLocalDateChange("2026-11-26", "2026-11-26", "2026-11-20"), {
    todayStr: "2026-11-26",
    selectedDate: "2026-11-20",
  });
  assert.deepEqual(applyLocalDateChange("2026-11-26", "2026-11-27", "2026-11-26"), {
    todayStr: "2026-11-27",
    selectedDate: "2026-11-27",
  });
  assert.deepEqual(applyLocalDateChange("2026-11-26", "2026-11-27", "2026-11-20"), {
    todayStr: "2026-11-27",
    selectedDate: "2026-11-20",
  });

  const noon = new Date(2026, 10, 26, 12, 0, 0, 0);
  assert.equal(msUntilNextLocalMidnight(noon), 12 * 60 * 60 * 1000);
});
