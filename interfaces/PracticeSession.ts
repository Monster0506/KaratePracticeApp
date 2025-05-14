interface PracticeSession {
  timestamp: string; // ISO string
  techniques: string[]; // technique names
  durationMs: number; // time between start and finish
  flagged: string[]; // techniques flagged during session
}
