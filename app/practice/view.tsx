import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Text, Button, Divider, useTheme } from "react-native-paper";
import { getPracticeHistory, PracticeSession } from "@/utils/practiceLogger";

export default function PracticeViewScreen() {
  const { timestamp } = useLocalSearchParams<{ timestamp: string }>();
  const theme = useTheme();
  const [session, setSession] = useState<PracticeSession | null>(null);

  useEffect(() => {
    getPracticeHistory().then((list) => {
      const match = list.find((s) => s.timestamp === timestamp);
      if (match) setSession(match);
    });
  }, [timestamp]);

  if (!session) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="bodyMedium">Session not found.</Text>
        <Button onPress={() => router.back()} style={{ marginTop: 12 }}>
          Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Practice Session
      </Text>
      <Text>Date: {new Date(session.timestamp).toLocaleString()}</Text>
      <Text>Duration: {(session.durationMs / 1000).toFixed(1)} seconds</Text>
      <Text>Techniques Practiced: {session.techniques.length}</Text>

      <Divider style={{ marginVertical: 16 }} />

      {session.techniques.map((name, i) => (
        <Text key={`${i}-${name}`} style={styles.technique}>
          {i + 1}. {name}
        </Text>
      ))}

      <Button
        onPress={() => router.back()}
        style={{ marginTop: 24 }}
        mode="outlined"
      >
        Back
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
    flexGrow: 1,
  },
  header: {
    marginBottom: 12,
  },
  technique: {
    fontSize: 16,
    paddingVertical: 2,
  },
});
