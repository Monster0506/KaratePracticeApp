// utils/flagLogger.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface FlagEvent {
  type: "flag" | "unflag" | "playlist-add" | "playlist-remove";
  technique: string;
  playlist?: string; // optional for playlist events
  timestamp?: string;
}

const FLAG_LOG_KEY = "flag-events-log";

export const logFlagEvent = async (event: FlagEvent) => {
  const existing = await AsyncStorage.getItem(FLAG_LOG_KEY);
  const parsed: FlagEvent[] = existing ? JSON.parse(existing) : [];
  parsed.push({ ...event, timestamp: new Date().toISOString() });
  await AsyncStorage.setItem(FLAG_LOG_KEY, JSON.stringify(parsed));
};

export const getFlagEvents = async (): Promise<FlagEvent[]> => {
  const stored = await AsyncStorage.getItem(FLAG_LOG_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearFlagEvents = async () => {
  await AsyncStorage.removeItem(FLAG_LOG_KEY);
};
