import { PracticeSession } from "@/types/Events";

/** badge definitions */
const ACHIEVEMENT_DESCRIPTIONS: Record<string, string> = {
  "getting-started": "Completed your first practice session.",
  "warming-up": "Completed 5 total sessions.",
  "forming-habit": "Practiced 20 techniques in total.",
  "staying-consistent": "Practiced 100 techniques in total.",
  "dedicated-practitioner": "Completed 50 sessions. That's dedication.",
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

export const getRandomQuote = (): string => {
  const quotes = [
    "\"A black belt is a white belt who never gave up.\" - Unknown",
    "\"A black belt is a white belt who never quit.\" - Unknown",
    "\"A black belt is just the beginning, not the end, of martial arts training.\"",
    "\"A punch should stay like a treasure in the sleeve. It should not be used indiscriminately.\" - Chotoku Kyan",
    "\"A true martial artist doesn't live in balance; he creates it.\" - Dan Millman",
    "\"A true martial artist never fights for personal gain, but to protect others.\"",
    "\"Believe you can and you're halfway there.\" - Theodore Roosevelt",
    "\"I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.\" - Bruce Lee",
    "\"In karate, there is no first strike. Karate is about finishing a fight before it starts.\" - Gichin Funakoshi",
    "\"In life, unlike chess, the game continues after checkmate.\" - Isaac Asimov",
    "\"In martial arts, it's not the size of the fighter that matters, but the size of the fight in them.\"",
    "\"In martial arts, the biggest opponent you will ever face is yourself.\" - Unknown",
    "\"In martial arts, the journey is the reward.\" - Unknown",
    "\"In the end, we only regret the chances we didn't take.\" - Unknown",
    "\"In the martial arts, introspection begets wisdom. Always see contemplation on your actions as an opportunity to improve.\" - Soke Behzad Ahmadi",
    "\"In the martial arts, it is not how much you have learned, but how much you have absorbed from what you have learned.\" - Bruce Lee",
    "\"It does not matter how slowly you go as long as you do not stop.\" - Confucius",
    "\"It's not about being better than someone else, it's about being better than you were yesterday.\" - Unknown",
    "\"It's not the size of the dog in the fight, it's the size of the fight in the dog.\" - Mark Twain",
    "\"It's not whether you get knocked down, it's whether you get up.\" - Vince Lombardi",
    "\"Karate begins and ends with courtesy.\" - Anko Itosu",
    "\"Karate is a lifelong journey of self-discovery and self-improvement.\" - Unknown",
    "\"Karate is like boiling water. If you do not heat it constantly, it will cool.\" - Gichin Funakoshi",
    "\"Karate is not about techniques and their execution, but about perfecting one's character.\" - Funakoshi",
    "\"Karate is not for the faint-hearted. It's about pushing yourself to the limit and beyond.\" - Unknown",
    "\"Martial arts are less about fighting others and more about fighting ourselves. The real value lies in conquering one's own limitations.\" - Unknown",
    "\"Martial arts begin and end with respect.\" - Unknown",
    "\"Martial arts is a journey that never ends, as there is always room for growth and improvement.\"",
    "\"Martial arts is a way of life, not just a sport.\"",
    "\"Martial arts is not about being better than someone else, it's about being better than you used to be.\" - Unknown",
    "\"Martial arts is not about fighting; it's about building character.\" - Bo Bennett",
    "\"Martial arts is not just a physical practice, it's a mental and spiritual one as well.\"",
    "\"Martial arts is not just about fighting, it's about building character.\"",
    "\"Martial arts is not just about fighting, it's about learning how to control your emotions and reactions.\"",
    "\"Martial arts is not just about physical strength, it's about mental and emotional strength as well.\"",
    "\"Martial arts is not just about winning, it's about learning and growing from every experience.\"",
    "\"Martial arts is the perfect combination of mind, body, and spirit.\"",
    "\"Martial arts training is about becoming the best version of yourself, both physically and mentally.\"",
    "\"Martial arts training is about finding balance in all aspects of life.\"",
    "\"Strength does not come from physical capacity. It comes from an indomitable will.\" - Mahatma Gandhi",
    "\"Success in martial arts is a journey, not a destination.\"",
    "\"Success is not final, failure is not fatal: It is the courage to continue that counts.\" - Unknown",
    "\"Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.\" - Albert Schweitzer",
    "\"The best fighter is never angry.\" - Lao Tzu",
    "\"The best fighter is someone who never has to fight because they control the situation.\" - Bruce Lee",
    "\"The best time to plant a tree was 20 years ago. The second best time is now.\" - Chinese Proverb",
    "\"The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.\" - Vince Lombardi",
    "\"The goal of martial arts is to affect the mind and spirit, not just the body.\" - Gichin Funakoshi",
    "\"The greatest lesson of martial arts is to respect others, as well as oneself.\"",
    "\"The greatest weapon in martial arts is not the fist or the foot, but the mind.\"",
    "\"The harder you work for something, the greater you'll feel when you achieve it.\" - Unknown",
    "\"The journey of a thousand miles begins with a single step.\" - Lao Tzu",
    "\"The mind is everything. What you think, you become.\" - Buddha",
    "\"The more you practice, the luckier you get.\" - Gary Player",
    "\"The only bad workout is the one that didn't happen.\" - Unknown",
    "\"The only way to do great work is to love what you do.\" - Steve Jobs",
    "\"The only way to improve in martial arts is to consistently push yourself out of your comfort zone.\"",
    "\"The only way to truly understand martial arts is to consistently practice and experience it for yourself.\"",
    "\"The stillness in stillness is not the real stillness; only when there is stillness in movement does the universal rhythm manifest.\" - Bruce Lee",
    "\"The successful warrior is the average person, with laser-like focus.\" - Bruce Lee",
    "\"The true competitor isn't the one who wins, but the one who gives their best effort.\" - Unknown",
    "\"The true essence of martial arts lies in the ability to control one's own mind and body.\"",
    "\"The true measure of a martial artist is not the number of victories, but the number of battles they have fought with honor.\"",
    "\"The true test of martial arts is how you handle defeat.\"",
    "\"The ultimate aim of karate lies not in victory nor defeat, but in the perfection of character.\" - Gichin Funakoshi",
    "\"The ultimate aim of martial arts is not having to use them.\" - Miyamoto Musashi",
    "\"There is no losing in martial arts. Either you win or you learn.\"",
    "\"To win one hundred victories in one hundred battles is not the highest skill. To subdue the enemy without fighting is the highest skill.\" - Sun Tzu",
    "\"Train with the energy of a warrior and soon you will have the heart of a warrior.\" - Shifu Yan Lei",
    "\"True martial artists do not fight to win, they fight to better themselves.\" - Unknown",
    "\"Your body can stand almost anything. It's your mind you have to convince.\" - Unknown",
  ];

  const randomIndex = Math.floor(Math.random() * quotes.length);
  return quotes[randomIndex];
};
