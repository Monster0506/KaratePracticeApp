import AsyncStorage from "@react-native-async-storage/async-storage";

export interface TechniqueViewEvent {
  name: string;
  timestamp: string;
}

const VIEW_KEY = "technique-view-history";

export const logTechniqueView = async (name: string) => {
  const record: TechniqueViewEvent = {
    name,
    timestamp: new Date().toISOString(),
  };
  const stored = await AsyncStorage.getItem(VIEW_KEY);
  const existing: TechniqueViewEvent[] = stored ? JSON.parse(stored) : [];
  existing.push(record);
  await AsyncStorage.setItem(VIEW_KEY, JSON.stringify(existing));
};

export const getTechniqueViews = async (): Promise<TechniqueViewEvent[]> => {
  const stored = await AsyncStorage.getItem(VIEW_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearTechniqueViews = async () => {
  await AsyncStorage.removeItem(VIEW_KEY);
};
