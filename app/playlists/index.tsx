import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
  Button,
  TextInput,
  List,
  Text,
  useTheme,
  IconButton,
  Dialog,
  Portal,
  Appbar, // Added for header
  Card, // Added for list items and input section
  Divider, // For visual separation
  MD3Colors, // For subtle colors
} from "react-native-paper";
import { useTechniques } from "@/context/TechniquesProvider";
import { useRouter } from "expo-router";

export default function PlaylistsScreen() {
  const { playlists, createPlaylist, deletePlaylist, renamePlaylist } =
    useTechniques();

  const router = useRouter();
  const theme = useTheme();

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [renameTarget, setRenameTarget] = useState<string | null>(null);
  const [updatedPlaylistName, setUpdatedPlaylistName] = useState("");

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
    }
  };

  const handleRenamePlaylist = () => {
    if (
      renameTarget &&
      updatedPlaylistName.trim() &&
      updatedPlaylistName.trim() !== renameTarget
    ) {
      renamePlaylist(renameTarget, updatedPlaylistName.trim());
    }
    setRenameTarget(null);
    setUpdatedPlaylistName("");
  };

  const openRenameDialog = (currentName: string) => {
    setRenameTarget(currentName);
    setUpdatedPlaylistName(currentName);
  };

  const renderPlaylistItem = ({ item }: { item: { name: string } }) => (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push(`/playlists/${encodeURIComponent(item.name)}`)}
    >
      <List.Item
        title={item.name}
        titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
        left={(props) => (
          <List.Icon
            {...props}
            icon="playlist-play"
            color={theme.colors.primary}
          />
        )}
        right={(props) => (
          <View style={styles.itemActions}>
            <IconButton
              {...props}
              icon="pencil-outline"
              size={20}
              onPress={() => openRenameDialog(item.name)}
              iconColor={theme.colors.onSurfaceVariant}
            />
            <IconButton
              {...props}
              icon="delete-outline"
              size={20}
              onPress={() => deletePlaylist(item.name)}
              iconColor={theme.colors.error}
            />
          </View>
        )}
      />
    </Card>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
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
          title="Your Playlists"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <View style={styles.contentContainer}>
        <Card
          style={[styles.inputCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <TextInput
              mode="outlined"
              label="New playlist name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              style={styles.input}
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
            />
            <Button
              mode="contained"
              onPress={handleCreatePlaylist}
              disabled={!newPlaylistName.trim()}
              style={styles.button}
              icon="plus-circle-outline"
              labelStyle={{ fontWeight: "bold" }}
            >
              Create Playlist
            </Button>
          </Card.Content>
        </Card>

        <Divider style={styles.divider} />

        <FlatList
          data={playlists}
          keyExtractor={(item) => item.name}
          renderItem={renderPlaylistItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton
                icon="playlist-plus"
                size={48}
                iconColor={theme.colors.outline}
              />
              <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
                No playlists yet. Create one above!
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContentContainer}
        />
      </View>

      <Portal>
        <Dialog
          visible={!!renameTarget}
          onDismiss={() => setRenameTarget(null)}
          style={{ backgroundColor: theme.colors.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Rename Playlist
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              mode="outlined"
              label="New name"
              value={updatedPlaylistName}
              onChangeText={setUpdatedPlaylistName}
              autoFocus
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
              style={{ backgroundColor: theme.colors.surfaceVariant }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setRenameTarget(null)}
              textColor={theme.colors.secondary}
            >
              Cancel
            </Button>
            <Button
              onPress={handleRenamePlaylist}
              disabled={
                !updatedPlaylistName.trim() ||
                updatedPlaylistName.trim() === renameTarget
              }
              textColor={theme.colors.primary}
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
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  inputCard: {
    marginBottom: 20,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    paddingVertical: 4, // Add some vertical padding to the button
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: MD3Colors.neutralVariant80,
  },
  listContentContainer: {
    flexGrow: 1, // Ensures empty component can utilize space
  },
  card: {
    marginBottom: 12,
    elevation: 1, // Subtle shadow for cards
  },
  itemTitle: {
    fontSize: 17, // Slightly larger title
    fontWeight: "500",
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
});
