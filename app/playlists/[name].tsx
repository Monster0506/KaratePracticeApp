import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useTechniques } from "@/context/TechniquesProvider";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";

export default function PlaylistView() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const { playlists, techniques, setCurrentList } = useTechniques();
  const [status, setStatus] = useState<"loading" | "notFound" | "done">(
    "loading",
  );
  const theme = useTheme();

  useEffect(() => {
    if (!name) return;

    const playlist = playlists.find((p) => p.name === name);
    if (!playlist) {
      setStatus("notFound");
      return;
    }

    const filtered = techniques.filter((t) => playlist.ids.includes(t.Name));
    setCurrentList(filtered);
    setStatus("done");
    router.replace("/technique");
  }, [name, playlists, techniques]);

  if (status === "notFound") {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <Text variant="titleMedium">Playlist not found</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator size="large" />
      <Text style={styles.loadingText}>Loading playlist...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
  },
});
