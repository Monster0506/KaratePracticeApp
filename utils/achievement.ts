import { PracticeSession } from "@/utils/practiceLogger";

/** badge definitions */
export const ACHIEVEMENTS = [
  {
    id: "getting-started",
    label: "Getting Started",
    cond: (s: Stat) => s.sessions >= 1,
  },
  {
    id: "warming-up",
    label: "Warming Up",
    cond: (s: Stat) => s.sessions >= 5,
  },
  {
    id: "forming-habit",
    label: "Forming a Habit",
    cond: (s: Stat) => s.techniques >= 20,
  },
  {
    id: "staying-consistent",
    label: "Staying Consistent",
    cond: (s: Stat) => s.techniques >= 100,
  },
  {
    id: "dedicated-practitioner",
    label: "Dedicated Practitioner",
    cond: (s: Stat) => s.sessions >= 50,
  },
  {
    id: "endurance-engine",
    label: "Endurance Engine",
    cond: (s: Stat) => s.techniques >= 250,
  },
  {
    id: "organized-mind",
    label: "Organized Mind",
    cond: (s: Stat) => s.playlists >= 10,
  },
  {
    id: "curiosity-sparked",
    label: "Curiosity Sparked",
    cond: (s: Stat) => s.views >= 100,
  },
  {
    id: "momentum-builder",
    label: "Momentum Builder",
    cond: (s: Stat) => s.longestStreak && s.longestStreak >= 5,
  },
] as const;

export interface Stat {
  sessions: number;
  techniques: number;
  views: number;
  playlists: number;
  longestStreak?: number;
}

/** compute longest daily streak */
export const computeStreak = (sessions: PracticeSession[]) => {
  const days = new Set(
    sessions.map((s) => new Date(s.timestamp).toDateString()),
  );
  const sorted = Array.from(days)
    .map((d) => new Date(d).getTime())
    .sort((a, b) => a - b);

  let streak = 1,
    longest = 1;
  for (let i = 1; i < sorted.length; i++) {
    const diff = (sorted[i] - sorted[i - 1]) / 86400000; // ms → days
    if (diff === 1) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }
  return longest;
};

/** returns list of earned badge IDs */
export const getAchievements = (stat: Stat) =>
  ACHIEVEMENTS.filter((a) => a.cond(stat)).map((a) => a.id);
