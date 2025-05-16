import React, { useEffect, useState, useMemo } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  useTheme,
  Divider,
  Portal,
  Dialog,
  Chip,
  Button,
  Appbar, // Added
  Card, // Added
  List, // Added
  ActivityIndicator, // Added
  IconButton, // Added
} from "react-native-paper";
import { getPracticeHistory } from "@/utils/practiceLogger";
import { useRouter } from "expo-router";
import { getTechniqueViews } from "@/utils/viewLogger";
import { getFlagEvents } from "@/utils/flagLogger";
import { ACHIEVEMENTS, getAchievements } from "@/utils/achievement";
import { TechniqueViewEvent, FlagEvent, PracticeSession } from "@/types/Events";

// Define a type for the achievement object for clarity
type Achievement = (typeof ACHIEVEMENTS)[number];

export default function PracticeStatsScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [views, setViews] = useState<TechniqueViewEvent[]>([]);
  const [flags, setFlags] = useState<FlagEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [practiceData, viewData, flagData] = await Promise.all([
          getPracticeHistory(),
          getTechniqueViews(),
          getFlagEvents(),
        ]);
        setHistory(practiceData);
        setViews(viewData);
        setFlags(flagData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalSessions = history.length;
    const allTechniquesPracticed = history.flatMap((s) => s.techniques);
    const uniqueTechniquesPracticed = new Set(allTechniquesPracticed);

    const practicedCounts = allTechniquesPracticed.reduce(
      (acc, name) => {
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostPracticed = Object.entries(practicedCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

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

    const flagEvents = flags.filter((f) => f.type === "flag");
    const flagCounts = flagEvents.reduce(
      (acc, evt) => {
        acc[evt.technique] = (acc[evt.technique] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostFlagged = Object.entries(flagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const playlistAddEvents = flags.filter((f) => f.type === "playlist-add");
    const playlistAddCounts = playlistAddEvents.reduce(
      (acc, evt) => {
        acc[evt.technique] = (acc[evt.technique] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const mostPlaylisted = Object.entries(playlistAddCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const earnedAchievements = getAchievements({
      sessions: totalSessions,
      techniques: allTechniquesPracticed.length,
      views: views.length,
      playlists: playlistAddEvents.length,
    });

    return {
      totalSessions,
      allTechniquesPracticedCount: allTechniquesPracticed.length,
      uniqueTechniquesPracticedCount: uniqueTechniquesPracticed.size,
      totalViews: views.length,
      totalFlagEvents: flagEvents.length,
      totalPlaylistAdds: playlistAddEvents.length,
      mostPracticed,
      mostViewed,
      mostFlagged,
      mostPlaylisted,
      earnedAchievements,
    };
  }, [history, views, flags]);

  const StatItem = ({ label, value }: { label: string; value: any }) => (
    <View style={styles.statItemContainer}>
      <Text
        variant="bodyLarge"
        style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}
      >
        {label}:
      </Text>
      <Text
        variant="bodyLarge"
        style={[styles.statValue, { color: theme.colors.primary }]}
      >
        {value}
      </Text>
    </View>
  );

  const TopList = ({
    title,
    items,
    icon,
  }: {
    title: string;
    items: [string, number][];
    icon: string;
  }) => (
    <Card style={styles.card}>
      <List.Section>
        <List.Subheader
          style={[styles.subHeader, { color: theme.colors.onSurface }]}
        >
          <List.Icon icon={icon} color={theme.colors.primary} />
          {title}
        </List.Subheader>
        {items.length > 0 ? (
          items.map(([name, count]) => (
            <List.Item
              key={name}
              title={name}
              right={() => (
                <Text
                  style={{
                    color: theme.colors.secondary,
                    alignSelf: "center",
                  }}
                >
                  {count} times
                </Text>
              )}
              titleStyle={{ color: theme.colors.onSurfaceVariant }}
            />
          ))
        ) : (
          <Text style={styles.emptyListText}>No data yet.</Text>
        )}
      </List.Section>
    </Card>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator animating={true} size="large" />
        <Text style={{ marginTop: 10, color: theme.colors.onSurface }}>
          Loading stats...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.pageContainer,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Appbar.Header
        style={{ backgroundColor: theme.colors.surface }}
        statusBarHeight={0}
      >
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.onSurface}
        />
        <Appbar.Content
          title="Practice Stats"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              Overall Summary
            </Text>
            <StatItem label="Total Sessions" value={stats.totalSessions} />
            <StatItem
              label="Total Techniques Practiced"
              value={stats.allTechniquesPracticedCount}
            />
            <StatItem
              label="Unique Techniques Practiced"
              value={stats.uniqueTechniquesPracticedCount}
            />
            <StatItem label="Total Technique Views" value={stats.totalViews} />
            <StatItem label="Total Flag Events" value={stats.totalFlagEvents} />
            <StatItem
              label="Total Playlist Adds"
              value={stats.totalPlaylistAdds}
            />
          </Card.Content>
        </Card>

        <TopList
          title="Most Practiced Techniques"
          items={stats.mostPracticed}
          icon="sword-cross"
        />
        <TopList
          title="Most Viewed Techniques"
          items={stats.mostViewed}
          icon="eye-outline"
        />
        <TopList
          title="Most Flagged Techniques"
          items={stats.mostFlagged}
          icon="flag-variant-outline"
        />
        <TopList
          title="Most Added to Playlists"
          items={stats.mostPlaylisted}
          icon="playlist-plus"
        />

        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              Achievements ({stats.earnedAchievements.length}/
              {ACHIEVEMENTS.length})
            </Text>
            <View style={styles.achievementsContainer}>
              {ACHIEVEMENTS.map((ach) => {
                const earnedIt = stats.earnedAchievements.includes(ach.id);
                return (
                  <Chip
                    key={ach.id}
                    icon={earnedIt ? "star-circle" : "lock-outline"}
                    mode={earnedIt ? "flat" : "outlined"}
                    style={[
                      styles.achievementChip,
                      earnedIt && {
                        backgroundColor: theme.colors.primaryContainer,
                      },
                      !earnedIt && {
                        borderColor: theme.colors.outlineVariant,
                      },
                    ]}
                    textStyle={{
                      color: earnedIt
                        ? theme.colors.onPrimaryContainer
                        : theme.colors.onSurfaceDisabled,
                    }}
                    onPress={() => setSelectedAchievement(ach)}
                  >
                    {ach.label}
                  </Chip>
                );
              })}
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          style={styles.shareButton}
          icon="share-variant"
          onPress={() => router.push("/share")}
          labelStyle={{ fontWeight: "bold" }}
        >
          Generate Share Card
        </Button>
      </ScrollView>

      <Portal>
        <Dialog
          visible={!!selectedAchievement}
          onDismiss={() => setSelectedAchievement(null)}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            {selectedAchievement?.label}
          </Dialog.Title>
          <Dialog.Content>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {selectedAchievement?.description}
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setSelectedAchievement(null)}
              textColor={theme.colors.primary}
            >
              Close
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  statItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  statLabel: {
    // fontWeight: '500',
  },
  statValue: {
    fontWeight: "bold",
  },
  subHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyListText: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  achievementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  achievementChip: {
    // No specific style needed here if using theme colors directly
  },
  shareButton: {
    marginTop: 8,
    marginBottom: 16, // Ensure space at the bottom
    paddingVertical: 6,
  },
});
