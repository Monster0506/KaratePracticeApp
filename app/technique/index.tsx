import { ModernCard } from "@/components/ui/ModernCard";
import { ModernHeader } from "@/components/ui/ModernHeader";
import { useTechniques } from "@/context/TechniquesProvider";
import { logPracticeSession } from "@/utils/practiceLogger";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  List,
  ProgressBar,
  Text,
  useTheme,
} from "react-native-paper";

export default function TechniqueList() {
  const { currentList, flagged } = useTechniques();
  const router = useRouter();
  const theme = useTheme();
  const [playing, setPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [delayMs, setDelayMs] = useState(4000);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        if (index < sortedList.length - 1) {
          timeoutRef.current = setTimeout(() => setIndex((prev) => prev + 1), delayMs);
        } else {
          setIndex(sortedList.length);
          setPlaying(false);
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
        }
      },
      onError: (error) => {
        console.error("Speech error:", error);
        if (index < sortedList.length - 1) {
          timeoutRef.current = setTimeout(() => setIndex((prev) => prev + 1), delayMs);
        } else {
          setIndex(sortedList.length);
          setPlaying(false);
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
        }
      },
    });
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [playing, index, sortedList, delayMs, startTime, flagged]);

  const togglePlay = () => {
    if (sortedList.length === 0) return;
    if (playing) {
      Speech.stop();
      setPlaying(false);
    } else {
      if (index >= sortedList.length) {
        setIndex(0);
        setStartTime(Date.now());
      } else {
        if (index === 0) setStartTime(Date.now());
      }
      setPlaying(true);
    }
  };

  const rewind = () => {
    if (sortedList.length === 0) return;
    Speech.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIndex((i) => {
      const newIndex = Math.max(i - 1, 0);
      if (playing && newIndex < sortedList.length) {
        Speech.speak(sortedList[newIndex].Name);
      }
      return newIndex;
    });
  };

  const next = () => {
    if (sortedList.length === 0) return;
    Speech.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIndex((i) => {
      const newIndex = Math.min(i + 1, sortedList.length - 1);
      if (newIndex >= sortedList.length - 1) {
        setPlaying(false); // Stop playing if at the end
        return sortedList.length - 1;
      }
      if (playing && newIndex < sortedList.length) {
        Speech.speak(sortedList[newIndex].Name);
      }
      return newIndex;
    });
  };

  // Calculate progress - start at 0 when not playing, show current progress when playing
  const getProgress = () => {
    if (sortedList.length === 0) return 0;
    if (!playing && index === 0) return 0; // Not started yet
    if (index >= sortedList.length) return 1; // Completed
    return index / sortedList.length; // Current progress
  };

  // Get display text for progress
  const getProgressText = () => {
    if (sortedList.length === 0) return "0 of 0";
    if (!playing && index === 0) return "0 of " + sortedList.length;
    if (index >= sortedList.length) return sortedList.length + " of " + sortedList.length;
    return (index + 1) + " of " + sortedList.length;
  };

  // Get percentage for display
  const getProgressPercentage = () => {
    if (sortedList.length === 0) return 0;
    if (!playing && index === 0) return 0;
    if (index >= sortedList.length) return 100;
    return Math.round((index / sortedList.length) * 100);
  };

  const renderItem = ({ item, index: i }: { item: any; index: number }) => {
    const isPlayingThis = i === index && playing;
    const isFlagged = flagged.includes(item.Name);
    
    return (
      <ModernCard
        key={`${item.Belt}-${item.Number}-${item.Name}`}
        variant="elevated"
        padding="medium"
        style={[
          styles.techniqueCard,
          isPlayingThis && {
            borderColor: theme.colors.primary,
            borderWidth: 2,
            backgroundColor: theme.colors.primaryContainer,
          },
        ] as any}
      >
        <List.Item
          title={item.Name}
          description={`${item.Belt} - #${item.Number}`}
          titleStyle={[
            styles.itemTitle,
            { color: theme.colors.onSurface },
            isPlayingThis && { color: theme.colors.onPrimaryContainer },
          ]}
          descriptionStyle={[
            styles.itemDesc,
            { color: theme.colors.onSurfaceVariant },
            isPlayingThis && { color: theme.colors.onPrimaryContainer },
          ]}
          left={(props) => (
            <View style={styles.leftContent}>
              <List.Icon
                {...props}
                icon={isPlayingThis ? "volume-high" : "chevron-right-circle"}
                color={
                  isPlayingThis
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
              />
              {isFlagged && (
                <IconButton
                  icon="flag"
                  size={16}
                  iconColor={theme.colors.secondary}
                  style={styles.flagIcon}
                />
              )}
            </View>
          )}
          onPress={() =>
            router.push(`/technique/${encodeURIComponent(item.Name)}`)
          }
        />
      </ModernCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ModernHeader
        title="Techniques"
        subtitle={`${sortedList.length} techniques`}
        showBack
      />

      <FlatList
        data={sortedList}
        keyExtractor={(item) => `${item.Belt}-${item.Number}-${item.Name}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
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
        <View style={styles.player}>
          <View style={styles.playerContent}>
            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text variant="bodySmall" style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
                  {getProgressText()}
                </Text>
              </View>
              <ProgressBar
                progress={getProgress()}
                color={theme.colors.primary}
                style={styles.progressBar}
              />
            </View>
            
            {/* Player Controls */}
            <View style={styles.playerControls}>
              <IconButton
                icon="rewind"
                size={24}
                onPress={rewind}
                disabled={index === 0}
                iconColor={index === 0 ? theme.colors.onSurfaceDisabled : theme.colors.onSurface}
                style={styles.controlButton}
              />
              
              <IconButton
                icon={playing ? "pause-circle" : "play-circle"}
                size={48}
                onPress={togglePlay}
                iconColor={theme.colors.primary}
                style={styles.playButton}
              />
              
              <IconButton
                icon="fast-forward"
                size={24}
                onPress={next}
                disabled={index >= sortedList.length - 1}
                iconColor={index >= sortedList.length - 1 ? theme.colors.onSurfaceDisabled : theme.colors.onSurface}
                style={styles.controlButton}
              />
            </View>
          </View>
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
    padding: 20,
    gap: 12,
  },
  techniqueCard: {
    marginBottom: 8,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    marginLeft: -8,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemDesc: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
  player: {
    margin: 20,
    marginTop: 0,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  playerContent: {
    gap: 16,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  controlButton: {
    margin: 0,
  },
  playButton: {
    margin: 0,
  },
});
