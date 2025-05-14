import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, useTheme, Divider } from "react-native-paper";
import { getPracticeHistory, PracticeSession } from "@/utils/practiceLogger";
import { useRouter } from "expo-router";
import { getTechniqueViews, TechniqueViewEvent } from "@/utils/viewLogger";
import { getFlagEvents, FlagEvent } from "@/utils/flagLogger";
import { ACHIEVEMENTS, getAchievements } from "@/utils/achievement";
import { Chip, Button } from "react-native-paper";

export default function PracticeStatsScreen() {
  const theme = useTheme();
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [views, setViews] = useState<TechniqueViewEvent[]>([]);
  const [flags, setFlags] = useState<FlagEvent[]>([]);
  const router = useRouter();

  useEffect(() => {
    getPracticeHistory().then(setHistory);
    getTechniqueViews().then(setViews);
    getFlagEvents().then(setFlags);
  }, []);
  // --- Practice session stats ---
  const totalSessions = history.length;
  const allTechniques = history.flatMap((s) => s.techniques);
  const uniqueTechniques = new Set(allTechniques);

  const practicedCounts = allTechniques.reduce(
    (acc, name) => {
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostPracticed = Object.entries(practicedCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // --- View stats ---
  const viewCounts = views.reduce(
    (acc, v) => {
      acc[v.name] = (acc[v.name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostViewed = Object.entries(viewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // --- Flag stats ---
  const flagCounts = flags.reduce(
    (acc, evt) => {
      if (evt.type === "flag") {
        acc[evt.technique] = (acc[evt.technique] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostFlagged = Object.entries(flagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // --- Playlist stats ---
  const playlistAddCounts = flags.reduce(
    (acc, evt) => {
      if (evt.type === "playlist-add") {
        acc[evt.technique] = (acc[evt.technique] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const mostPlaylisted = Object.entries(playlistAddCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const earned = getAchievements({
    sessions: totalSessions,
    techniques: allTechniques.length,
    views: views.length,
    playlists: flags.filter((f) => f.type === "playlist-add").length,
    // longestStreak,
  });
  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Practice Stats
      </Text>

      <Text>Total Sessions: {totalSessions}</Text>
      <Text>Total Techniques Practiced: {allTechniques.length}</Text>
      <Text>Unique Techniques Practiced: {uniqueTechniques.size}</Text>
      <Text>Total Technique Views: {views.length}</Text>
      <Text>
        Total Flag Events: {flags.filter((f) => f.type === "flag").length}
      </Text>
      <Text>
        Total Playlist Adds:{" "}
        {flags.filter((f) => f.type === "playlist-add").length}
      </Text>

      <Divider style={styles.divider} />
      <Text variant="titleMedium">Most Practiced Techniques</Text>
      {mostPracticed.map(([name, count]) => (
        <Text key={name}>
          {name}: {count}
        </Text>
      ))}

      <Divider style={styles.divider} />
      <Text variant="titleMedium">Most Viewed Techniques</Text>
      {mostViewed.map(([name, count]) => (
        <Text key={name}>
          {name}: {count}
        </Text>
      ))}

      <Divider style={styles.divider} />
      <Text variant="titleMedium">Most Flagged Techniques</Text>
      {mostFlagged.map(([name, count]) => (
        <Text key={name}>
          {name}: {count}
        </Text>
      ))}

      <Divider style={styles.divider} />
      <Text variant="titleMedium">Most Added to Playlists</Text>
      {mostPlaylisted.map(([name, count]) => (
        <Text key={name}>
          {name}: {count}
        </Text>
      ))}
      <Text variant="titleMedium">Achievements</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {ACHIEVEMENTS.filter((a) => earned.includes(a.id)).map((a) => (
          <Chip key={a.id} compact>
            {a.label}
          </Chip>
        ))}
      </View>
      <Button
        mode="outlined"
        style={{ marginTop: 16 }}
        onPress={() => router.push("/share")}
      >
        Generate Share Card
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1 },
  header: { marginBottom: 16 },
  divider: { marginVertical: 12, opacity: 0.3 },
});
