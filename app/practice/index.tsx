import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
  Text,
  List,
  useTheme,
  Appbar, // Added
  Card, // Added
  ActivityIndicator, // Added
  IconButton, // Added
} from "react-native-paper";
import { getPracticeHistory } from "@/utils/practiceLogger";
import { PracticeSession } from "@/types/Events";
import { useRouter } from "expo-router";

export default function PracticeHistoryScreen() {
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    getPracticeHistory()
      .then((data) => setHistory([...data].reverse())) // Show newest first
      .catch((err) => console.error("Failed to load history", err))
      .finally(() => setLoading(false));
  }, []);

  const renderItem = ({ item }: { item: PracticeSession }) => (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() =>
        router.push({
          pathname: "/practice/view",
          params: { timestamp: item.timestamp },
        })
      }
    >
      <List.Item
        title={`Practiced ${item.techniques.length} technique${item.techniques.length === 1 ? "" : "s"}`}
        description={`On: ${new Date(item.timestamp).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        })}\nDuration: ${(item.durationMs / 1000 / 60).toFixed(1)} mins`}
        titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
        descriptionStyle={[
          styles.itemDescription,
          { color: theme.colors.onSurfaceVariant },
        ]}
        left={(props) => (
          <List.Icon {...props} icon="history" color={theme.colors.primary} />
        )}
        right={(props) => (
          <List.Icon
            {...props}
            icon="chevron-right"
            color={theme.colors.onSurfaceDisabled}
          />
        )}
        descriptionNumberOfLines={2}
      />
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
          Loading history...
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
          title="Practice History"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <FlatList
        data={history}
        keyExtractor={(item) => item.timestamp}
        renderItem={renderItem}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton
              icon="clipboard-text-clock-outline"
              size={48}
              iconColor={theme.colors.outline}
            />
            <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
              No practice sessions logged yet.
            </Text>
            <Text
              style={[styles.emptySubText, { color: theme.colors.outline }]}
            >
              Start a practice session to see your history here.
            </Text>
          </View>
        }
      />
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
  listContentContainer: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "500",
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.8,
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
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    opacity: 0.7,
  },
});
