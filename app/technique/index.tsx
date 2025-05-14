import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { List, IconButton, Text, useTheme, Divider } from "react-native-paper";
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

  const sortedList = currentList;

  useEffect(() => {
    AsyncStorage.getItem("delayBetweenTechniques").then((stored) => {
      if (stored) {
        const ms = parseInt(stored, 10);
        if (!isNaN(ms)) setDelayMs(ms);
      }
    });
  }, []);

  useEffect(() => {
    if (!playing) return;

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
    });
  }, [playing, index]);

  const togglePlay = () => {
    if (playing) {
      Speech.stop();
      setPlaying(false);
    } else {
      setStartTime(Date.now());
      setPlaying(true);
    }
  };

  const rewind = () => {
    Speech.stop();
    setIndex((i) => Math.max(i - 1, 0));
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={sortedList}
        keyExtractor={(item) => `${item.Belt}-${item.Number}-${item.Name}`}
        renderItem={({ item, index: i }) => (
          <View
            style={[
              styles.itemWrapper,
              i === index && playing && styles.playing,
            ]}
          >
            <List.Item
              title={item.Name}
              description={`${item.Belt} - #${item.Number}`}
              onPress={() =>
                router.push(`/technique/${encodeURIComponent(item.Name)}`)
              }
              style={styles.item}
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDesc}
            />
            <Divider />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No techniques to display</Text>
        }
      />

      <View
        style={[
          styles.player,
          { backgroundColor: theme.colors.elevation.level2 },
        ]}
      >
        <IconButton
          icon={playing ? "pause" : "play"}
          onPress={togglePlay}
          size={32}
        />
        <IconButton icon="rewind" onPress={rewind} size={32} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  itemWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  item: {
    paddingVertical: 4,
  },
  itemTitle: {
    fontSize: 18,
  },
  itemDesc: {
    opacity: 0.7,
    fontSize: 14,
  },
  playing: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  player: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 16,
    borderTopWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    opacity: 0.7,
  },
});
