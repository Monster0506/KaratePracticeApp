import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router"; // useRouter instead of router
import {
  Text,
  Button,
  Divider,
  useTheme,
  Appbar, // Added
  Card, // Added
  List, // Added
  ActivityIndicator, // Added
  IconButton, // Added
} from "react-native-paper";
import { getPracticeHistory } from "@/utils/practiceLogger";
import { PracticeSession } from "@/types/Events";

export default function PracticeViewScreen() {
  const { timestamp } = useLocalSearchParams<{ timestamp: string }>();
  const theme = useTheme();
  const router = useRouter(); // Use useRouter hook
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (timestamp) {
      setLoading(true);
      getPracticeHistory()
        .then((list) => {
          const match = list.find((s) => s.timestamp === timestamp);
          setSession(match || null);
        })
        .catch((err) => {
          console.error("Failed to load session:", err);
          setSession(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // No timestamp, nothing to load
    }
  }, [timestamp]);

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!session) {
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
            title="Session Not Found"
            titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
          />
        </Appbar.Header>
        <View style={styles.emptyContainer}>
          <IconButton
            icon="alert-circle-outline"
            size={48}
            iconColor={theme.colors.error}
          />
          <Text
            variant="headlineSmall"
            style={[styles.notFoundText, { color: theme.colors.error }]}
          >
            Session Not Found
          </Text>
          <Text
            style={[
              styles.notFoundSubText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            The practice session you are looking for could not be found.
          </Text>
          <Button
            onPress={() => router.back()}
            mode="contained"
            style={{ marginTop: 24 }}
          >
            Go Back
          </Button>
        </View>
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
          title="Practice Session Details"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="titleLarge"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              Session Summary
            </Text>
            <List.Item
              title="Date & Time"
              description={new Date(session.timestamp).toLocaleString([], {
                dateStyle: "full",
                timeStyle: "medium",
              })}
              left={(props) => <List.Icon {...props} icon="calendar-clock" />}
              titleStyle={{ color: theme.colors.onSurfaceVariant }}
              descriptionStyle={{ color: theme.colors.onSurface }}
              descriptionNumberOfLines={2}
            />
            <List.Item
              title="Duration"
              description={`${(session.durationMs / 1000 / 60).toFixed(1)} minutes (${(session.durationMs / 1000).toFixed(1)}s)`}
              left={(props) => <List.Icon {...props} icon="timer-sand" />}
              titleStyle={{ color: theme.colors.onSurfaceVariant }}
              descriptionStyle={{ color: theme.colors.onSurface }}
            />
            <List.Item
              title="Techniques Practiced"
              description={`${session.techniques.length} technique${session.techniques.length === 1 ? "" : "s"}`}
              left={(props) => (
                <List.Icon {...props} icon="format-list-numbered" />
              )}
              titleStyle={{ color: theme.colors.onSurfaceVariant }}
              descriptionStyle={{ color: theme.colors.onSurface }}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <List.Section>
            <List.Subheader
              style={[styles.subHeader, { color: theme.colors.onSurface }]}
            >
              <List.Icon icon="arm-flex" color={theme.colors.primary} />
              Techniques in this Session
            </List.Subheader>
            {session.techniques.map((name, i) => (
              <React.Fragment key={`${i}-${name}`}>
                <List.Item
                  title={name}
                  onPress={() =>
                    router.push(`/technique/${encodeURIComponent(name)}`)
                  }
                  titleStyle={{ color: theme.colors.onSurfaceVariant }}
                  left={(props) => (
                    <Text
                      {...props}
                      style={{
                        alignSelf: "center",
                        marginLeft: 16,
                        marginRight: 16,
                        color: theme.colors.primary,
                      }}
                    >
                      {i + 1}
                    </Text>
                  )}
                />
                {i < session.techniques.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List.Section>
        </Card>
      </ScrollView>
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
    marginBottom: 8,
    fontWeight: "bold",
  },
  subHeader: {
    fontWeight: "bold",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  notFoundText: {
    marginTop: 8,
    textAlign: "center",
  },
  notFoundSubText: {
    marginTop: 4,
    textAlign: "center",
    opacity: 0.8,
  },
});
