import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PracticeSession {
  timestamp: string; // ISO string
  techniques: string[]; // technique names
  durationMs: number;
  flagged: string[];
}

const HISTORY_KEY = "practice-history";

export const logPracticeSession = async (session: PracticeSession) => {
  const existing = await AsyncStorage.getItem(HISTORY_KEY);
  const parsed: PracticeSession[] = existing ? JSON.parse(existing) : [];
  parsed.push(session);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(parsed));
};

export const getPracticeHistory = async (): Promise<PracticeSession[]> => {
  const stored = await AsyncStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearPracticeHistory = async () => {
  await AsyncStorage.removeItem(HISTORY_KEY);
};
