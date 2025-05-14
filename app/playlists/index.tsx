import React, { useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import {
  Button,
  TextInput,
  List,
  Text,
  useTheme,
  IconButton,
  Dialog,
  Portal,
} from "react-native-paper";
import { useTechniques } from "@/context/TechniquesProvider";
import { useRouter } from "expo-router";

export default function PlaylistsScreen() {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } =
    useTechniques();

  const router = useRouter();
  const theme = useTheme();

  const [name, setName] = useState("");
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Your Playlists
      </Text>

      <TextInput
        mode="outlined"
        label="New playlist name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={() => {
          createPlaylist(name.trim());
          setName("");
        }}
        disabled={!name.trim()}
        style={styles.button}
      >
        Create Playlist
      </Button>

      <FlatList
        data={playlists}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            <TouchableOpacity
              onPress={() =>
                router.push(`/playlists/${encodeURIComponent(item.name)}`)
              }
              style={styles.listTouchable}
              activeOpacity={0.7}
            >
              <List.Item title={item.name} />
            </TouchableOpacity>
            <IconButton
              icon="pencil"
              onPress={() => {
                setRenameTarget(item.name);
                setNewName(item.name);
              }}
            />
            <IconButton
              icon="delete"
              onPress={() => deletePlaylist(item.name)}
              style={styles.deleteIcon}
            />
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No playlists yet</Text>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <Portal>
        <Dialog
          visible={!!renameTarget}
          onDismiss={() => setRenameTarget(null)}
        >
          <Dialog.Title>Rename Playlist</Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="New name"
              value={newName}
              onChangeText={setNewName}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRenameTarget(null)}>Cancel</Button>
            <Button
              onPress={() => {
                if (
                  renameTarget &&
                  newName.trim() &&
                  newName.trim() !== renameTarget
                ) {
                  renamePlaylist(renameTarget, newName.trim());
                }
                setRenameTarget(null);
              }}
            >
              Rename
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 16 },
  input: { marginBottom: 8 },
  button: { marginBottom: 16 },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 8,
    marginVertical: 4,
  },
  listTouchable: {
    flex: 1,
  },
  deleteIcon: {
    marginLeft: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 32,
    opacity: 0.7,
  },
});
