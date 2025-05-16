import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  List,
  IconButton,
  Text,
  useTheme,
  Appbar, // Added for header
  Card, // Added for list items
  MD3Colors, // For more distinct playing highlight
  ActivityIndicator, // For empty list or loading
  Divider, // Re-added for subtle separation if needed
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useTechniques } from "@/context/TechniquesProvider";
import * as Speech from "expo-speech";
import { logPracticeSession } from "@/utils/practiceLogger";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TechniqueList() {
  const { currentList, flagged } = useTechniques();
  const router = useRouter();
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [delayMs, setDelayMs] = useState(4000);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Assuming currentList might be null or undefined initially
  const sortedList = currentList || [];

  useEffect(() => {
    AsyncStorage.getItem("delayBetweenTechniques").then((stored) => {
      if (stored) {
        const ms = parseInt(stored, 10);
        if (!isNaN(ms)) setDelayMs(ms);
      }
    });
  }, []);

  useEffect(() => {
    if (!playing || sortedList.length === 0) return;

    if (index >= sortedList.length) {
      setPlaying(false);
      setIndex(0);

      if (startTime) {
        logPracticeSession({
          timestamp: new Date().toISOString(),
          techniques: sortedList.map((t) => t.Name),
          durationMs: Date.now() - startTime,
          flagged: flagged.filter((id) =>
            sortedList.some((t) => t.Name === id),
          ),
        });
        setStartTime(null);
      }
      return;
    }

    const tech = sortedList[index];
    Speech.stop();
    Speech.speak(tech.Name, {
      onDone: () => {
        setTimeout(() => setIndex((prev) => prev + 1), delayMs);
      },
      onError: (error) => {
        console.error("Speech error:", error);
        // Optionally, move to the next item or stop playback on error
        setTimeout(() => setIndex((prev) => prev + 1), delayMs);
      },
    });
  }, [playing, index, sortedList, delayMs, startTime, flagged]);

  const togglePlay = () => {
    if (sortedList.length === 0) return;
    if (playing) {
      Speech.stop();
      setPlaying(false);
    } else {
      setStartTime(Date.now());
      setIndex(0); // Reset index when starting play
      setPlaying(true);
    }
  };

  const rewind = () => {
    if (sortedList.length === 0) return;
    Speech.stop();
    setIndex((i) => {
      const newIndex = Math.max(i - 1, 0);
      // If playing, immediately speak the new item
      if (playing && newIndex < sortedList.length) {
        Speech.speak(sortedList[newIndex].Name, {
          onDone: () => {
            setTimeout(
              () => setIndex((prev) => prev + 1), // This seems off, should just set to newIndex + 1 or handle next step
              delayMs,
            );
          },
        });
      }
      return newIndex;
    });
  };

  const renderItem = ({ item, index: i }: { item: any; index: number }) => {
    const isPlayingThis = i === index && playing;
    return (
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.surfaceVariant },
          isPlayingThis && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
        onPress={() =>
          router.push(`/technique/${encodeURIComponent(item.Name)}`)
        }
      >
        <List.Item
          title={item.Name}
          description={`${item.Belt} - #${item.Number}`}
          titleStyle={[
            styles.itemTitle,
            { color: theme.colors.onSurfaceVariant },
            isPlayingThis && { color: theme.colors.onPrimaryContainer },
          ]}
          descriptionStyle={[
            styles.itemDesc,
            { color: theme.colors.onSurfaceVariant },
            isPlayingThis && { color: theme.colors.onPrimaryContainer },
          ]}
          left={(props) => (
            <List.Icon
              {...props}
              icon={isPlayingThis ? "volume-high" : "chevron-right-circle"}
              color={
                isPlayingThis
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
            />
          )}
        />
      </Card>
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header
        style={{ backgroundColor: theme.colors.surface }}
        statusBarHeight={0} // Assuming status bar is handled by Expo
      >
        <Appbar.BackAction
          onPress={() => router.back()}
          color={theme.colors.onSurface}
        />
        <Appbar.Content
          title="Techniques"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <FlatList
        data={sortedList}
        keyExtractor={(item) => `${item.Belt}-${item.Number}-${item.Name}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton
              icon="information-outline"
              size={48}
              iconColor={theme.colors.outline}
            />
            <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
              No techniques to display
            </Text>
            {currentList === null && (
              <ActivityIndicator style={{ marginTop: 10 }} animating={true} />
            )}
          </View>
        }
      />

      {sortedList.length > 0 && (
        <View
          style={[
            styles.player,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <IconButton
            icon="rewind"
            onPress={rewind}
            size={36}
            iconColor={theme.colors.onSurfaceVariant}
            disabled={playing && index === 0}
          />
          <IconButton
            icon={playing ? "pause-circle" : "play-circle"}
            onPress={togglePlay}
            size={56} // Larger main button
            iconColor={theme.colors.primary}
            animated
          />
          <IconButton // Placeholder for a potential "next" button
            icon="fast-forward"
            onPress={() => {
              if (playing) {
                Speech.stop();
                setIndex((i) => Math.min(i + 1, sortedList.length - 1));
              }
            }}
            size={36}
            iconColor={theme.colors.onSurfaceVariant}
            disabled={playing && index >= sortedList.length - 1}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexGrow: 1, // Ensures empty component can center
  },
  card: {
    marginBottom: 12,
    elevation: 2, // Subtle shadow for cards
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600", // Bolder title
  },
  itemDesc: {
    fontSize: 14,
    opacity: 0.8,
  },
  player: {
    flexDirection: "row",
    justifyContent: "space-around", // Better spacing for controls
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: MD3Colors.neutralVariant50, // Subtle border
    elevation: 4, // Player bar stands out a bit
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 12,
    textAlign: "center",
  },
});
