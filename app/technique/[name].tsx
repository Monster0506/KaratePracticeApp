import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput as RNTextInput,
} from "react-native";
import {
  Text,
  Chip,
  IconButton,
  Button,
  useTheme,
  Divider,
  Portal,
  Dialog,
  TextInput,
} from "react-native-paper";
import { useLocalSearchParams, router } from "expo-router";
import { useTechniques } from "@/context/TechniquesProvider";
import { logTechniqueView } from "@/utils/viewLogger";

export default function TechniqueView() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const {
    techniques,
    toggleFlag,
    flagged,
    playlists,
    setCurrentList,
    toggleInPlaylist,
    createPlaylist,
  } = useTechniques();

  const theme = useTheme();
  const tech = techniques.find((t) => t.Name === name);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (tech) logTechniqueView(tech.Name);
  }, [tech]);

  if (!tech)
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <Text>Technique not found</Text>
      </View>
    );

  const isFlagged = flagged.includes(tech.Name);

  const openBelt = () => {
    const list = techniques.filter((t) => t.Belt === tech.Belt);
    setCurrentList(list);
    router.push("/technique");
  };

  const handleCreatePlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) return;
    createPlaylist(name);
    toggleInPlaylist(name, tech.Name);
    setNewPlaylistName("");
    setDialogVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.name}>
          {tech.Name}
        </Text>
        <IconButton
          icon={isFlagged ? "flag" : "flag-outline"}
          onPress={() => toggleFlag(tech.Name)}
        />
      </View>

      <Chip style={styles.chip} onPress={openBelt}>
        {tech.Belt} Belt — #{tech.Number}
      </Chip>

      <Divider style={styles.divider} />

      <View style={styles.details}>
        <Text style={styles.label}>Attack</Text>
        <Text style={styles.value}>{tech.Attack}</Text>

        <Text style={styles.label}>Block</Text>
        <Text style={styles.value}>{tech.Block}</Text>

        <Text style={styles.label}>First Strike</Text>
        <Text style={styles.value}>{tech.Strike}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.playlistSection}>
        <View style={styles.playlistHeader}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Playlists
          </Text>
          <Button compact onPress={() => setDialogVisible(true)}>
            + New
          </Button>
        </View>

        {playlists.map((pl) => {
          const inPlaylist = pl.ids.includes(tech.Name);
          return (
            <Button
              key={pl.name}
              onPress={() => toggleInPlaylist(pl.name, tech.Name)}
              mode={inPlaylist ? "contained-tonal" : "outlined"}
              style={styles.playlistBtn}
              icon={inPlaylist ? "check" : undefined}
            >
              {pl.name}
            </Button>
          );
        })}
      </View>

      <Button
        mode="outlined"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Back
      </Button>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>Create New Playlist</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleCreatePlaylist}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    flex: 1,
    fontSize: 22,
  },
  chip: {
    alignSelf: "flex-start",
    marginTop: -4,
  },
  divider: {
    marginVertical: 12,
    opacity: 0.3,
  },
  details: {
    gap: 8,
  },
  label: {
    fontWeight: "600",
    opacity: 0.6,
  },
  value: {
    marginBottom: 8,
  },
  playlistSection: {
    gap: 8,
  },
  playlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: 4,
  },
  playlistBtn: {
    alignSelf: "flex-start",
  },
  backButton: {
    marginTop: 24,
  },
});
