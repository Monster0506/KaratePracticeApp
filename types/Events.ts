
export type TechniqueViewEvent = {
  name: string;
  timestamp: string;
};

export interface FlagEvent {
  type: "flag" | "unflag" | "playlist-add" | "playlist-remove";
  technique: string;
  playlist?: string; // optional for playlist events
  timestamp?: string;
}

export interface PracticeSession {
  timestamp: string; // ISO string
  techniques: string[]; // technique names
  durationMs: number;
  flagged: string[];
}
