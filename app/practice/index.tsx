import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Text, List, useTheme } from "react-native-paper";
import { getPracticeHistory, PracticeSession } from "@/utils/practiceLogger";
import { useRouter } from "expo-router";

export default function PracticeHistoryScreen() {
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    getPracticeHistory().then(setHistory);
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Practice History
      </Text>
      <FlatList
        data={[...history].reverse()}
        keyExtractor={(item) => item.timestamp}
        renderItem={({ item }) => (
          <List.Item
            title={`Practiced ${item.techniques.length} techniques`}
            description={`on ${new Date(item.timestamp).toLocaleString()}`}
            onPress={() =>
              router.push({
                pathname: "/practice/view",
                params: { timestamp: item.timestamp },
              })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No practice logged yet.</Text>
        }
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 16 },
  empty: { textAlign: "center", marginTop: 24, opacity: 0.6 },
});
