import { PracticeSession } from "@/utils/practiceLogger";

/** badge definitions */
const ACHIEVEMENT_DESCRIPTIONS: Record<string, string> = {
  "getting-started": "Completed your first practice session.",
  "warming-up": "Completed 5 total sessions.",
  "forming-habit": "Practiced 20 techniques in total.",
  "staying-consistent": "Practiced 100 techniques in total.",
  "dedicated-practitioner": "Completed 50 sessions. That’s dedication.",
  "endurance-engine": "Practiced 250 techniques total. Keep grinding!",
  "organized-mind": "Created 10+ playlists to structure your practice.",
  "curiosity-sparked": "Viewed 100 techniques in the detail screen.",
  "momentum-builder": "Practiced at least 5 days in a row.",
};
export const ACHIEVEMENTS = [
  {
    id: "getting-started",
    label: "Getting Started",
    description: ACHIEVEMENT_DESCRIPTIONS["getting-started"],
    cond: (s: Stat) => s.sessions >= 1,
  },
  {
    id: "warming-up",
    label: "Warming Up",
    description: ACHIEVEMENT_DESCRIPTIONS["warming-up"],
    cond: (s: Stat) => s.sessions >= 5,
  },
  {
    id: "forming-habit",
    label: "Forming a Habit",
    description: ACHIEVEMENT_DESCRIPTIONS["forming-habit"],
    cond: (s: Stat) => s.techniques >= 20,
  },
  {
    id: "staying-consistent",
    label: "Staying Consistent",
    description: ACHIEVEMENT_DESCRIPTIONS["staying-consistent"],
    cond: (s: Stat) => s.techniques >= 100,
  },
  {
    id: "dedicated-practitioner",
    label: "Dedicated Practitioner",
    description: ACHIEVEMENT_DESCRIPTIONS["dedicated-practitioner"],
    cond: (s: Stat) => s.sessions >= 50,
  },
  {
    id: "endurance-engine",
    label: "Endurance Engine",
    description: ACHIEVEMENT_DESCRIPTIONS["endurance-engine"],
    cond: (s: Stat) => s.techniques >= 250,
  },
  {
    id: "organized-mind",
    label: "Organized Mind",
    description: ACHIEVEMENT_DESCRIPTIONS["organized-mind"],
    cond: (s: Stat) => s.playlists >= 10,
  },
  {
    id: "curiosity-sparked",
    label: "Curiosity Sparked",
    description: ACHIEVEMENT_DESCRIPTIONS["curiosity-sparked"],
    cond: (s: Stat) => s.views >= 100,
  },
  {
    id: "momentum-builder",
    label: "Momentum Builder",
    description: ACHIEVEMENT_DESCRIPTIONS["momentum-builder"],
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
