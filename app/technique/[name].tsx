import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Text,
  Chip,
  Button,
  useTheme,
  Divider,
  Portal,
  Dialog,
  TextInput,
  Appbar, // Added
  Card, // Added
  List, // Added
  IconButton, // Keep for potential use, but flag will be Appbar.Action
  ActivityIndicator, // For loading state
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router"; // useRouter
import { useTechniques } from "@/context/TechniquesProvider";
import { logTechniqueView } from "@/utils/viewLogger";

export default function TechniqueView() {
  const { name: encodedName } = useLocalSearchParams<{ name: string }>();
  const name = encodedName ? decodeURIComponent(encodedName) : undefined; // Decode the name

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
  const router = useRouter(); // Use useRouter hook

  const [tech, setTech] = useState<
    (typeof techniques)[number] | undefined | null
  >(undefined); // null for not found, undefined for loading
  const [dialogVisible, setDialogVisible] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    if (name) {
      const foundTechnique = techniques.find((t) => t.Name === name);
      setTech(foundTechnique || null); // Set to null if not found
      if (foundTechnique) {
        logTechniqueView(foundTechnique.Name);
      }
    } else {
      setTech(null); // No name provided
    }
  }, [name, techniques]);

  if (tech === undefined) {
    // Loading state
    return (
      <View
        style={[styles.centered, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator animating={true} size="large" />
      </View>
    );
  }

  if (!tech) {
    // Not found state
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
            title="Error"
            titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
          />
        </Appbar.Header>
        <View style={styles.centered}>
          <IconButton
            icon="alert-circle-outline"
            size={48}
            iconColor={theme.colors.error}
          />
          <Text
            variant="headlineSmall"
            style={[styles.notFoundText, { color: theme.colors.error }]}
          >
            Technique Not Found
          </Text>
          <Text
            style={[
              styles.notFoundSubText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            The technique you're looking for doesn't exist or couldn't be
            loaded.
          </Text>
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={{ marginTop: 24 }}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  const isFlagged = flagged.includes(tech.Name);

  const openBeltList = () => {
    const list = techniques.filter(
      (t) => t.Belt === tech.Belt && t.Adults !== "true", // Exclude adult duplicates if any
    );
    setCurrentList(list);
    router.push("/technique"); // Navigate to the list view
  };

  const handleCreatePlaylistAndAdd = () => {
    const trimmedName = newPlaylistName.trim();
    if (!trimmedName) return;
    createPlaylist(trimmedName);
    toggleInPlaylist(trimmedName, tech.Name); // Add current technique to new playlist
    setNewPlaylistName("");
    setDialogVisible(false);
  };

  const DetailItem = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | undefined;
    icon: string;
  }) => (
    <List.Item
      title={label}
      description={value || "N/A"}
      left={(props) => <List.Icon {...props} icon={icon} />}
      titleStyle={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}
      descriptionStyle={{
        color: theme.colors.onSurface,
        fontSize: 16,
        fontWeight: "500",
      }}
      style={styles.detailListItem}
    />
  );

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
          title={tech.Name}
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flex: 1 }} // Ensure title takes available space
        />
        <Appbar.Action
          icon={isFlagged ? "flag" : "flag-outline"}
          onPress={() => toggleFlag(tech.Name)}
          color={
            isFlagged ? theme.colors.primary : theme.colors.onSurfaceVariant
          }
          size={24}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Chip
          icon="tag-outline"
          style={[
            styles.beltChip,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
          textStyle={{ color: theme.colors.onSurfaceVariant }}
          onPress={openBeltList} // Make the chip clickable to see other belt techniques
        >
          {tech.Belt} Belt — #{tech.Number}
        </Chip>

        {/* 
        // Future Detailed Description Section
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Description
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              This is where a detailed, multi-paragraph description of the technique 
              would go. It could explain the nuances, common mistakes, key principles,
              and historical context if available. 
              For example, it might start with an overview: "{tech.Name} is a fundamental
              technique from the {tech.Belt} curriculum, focusing on..." 
              and then delve into specifics.
            </Text>
          </Card.Content>
        </Card>
        */}

        <Card style={styles.card}>
          <Card.Content>
            <Text
              variant="titleMedium"
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
            >
              Key Details
            </Text>
            <DetailItem label="Attack" value={tech.Attack} icon="sword-cross" />
            <Divider style={styles.detailDivider} />
            <DetailItem
              label="Block"
              value={tech.Block}
              icon="shield-outline"
            />
            <Divider style={styles.detailDivider} />
            <DetailItem
              label="First Strike"
              value={tech.Strike}
              icon="weather-lightning"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Add to Playlists"
            titleStyle={[
              styles.cardTitle,
              { color: theme.colors.onSurface, marginBottom: 0 },
            ]}
            right={(props) => (
              <Button
                {...props}
                icon="playlist-plus"
                onPress={() => setDialogVisible(true)}
                compact
                style={{ marginRight: 8 }}
              >
                New
              </Button>
            )}
          />
          <Card.Content>
            {playlists.length > 0 ? (
              <View style={styles.playlistChipsContainer}>
                {playlists.map((pl) => {
                  const inPlaylist = pl.ids.includes(tech.Name);
                  return (
                    <Chip
                      key={pl.name}
                      selected={inPlaylist}
                      mode={inPlaylist ? "flat" : "outlined"} // Flat for selected, outlined otherwise
                      icon={inPlaylist ? "check-circle" : "plus-circle-outline"}
                      onPress={() => toggleInPlaylist(pl.name, tech.Name)}
                      style={[
                        styles.playlistChip,
                        inPlaylist && {
                          backgroundColor: theme.colors.primaryContainer,
                        },
                      ]}
                      textStyle={
                        inPlaylist
                          ? { color: theme.colors.onPrimaryContainer }
                          : { color: theme.colors.onSurfaceVariant }
                      }
                    >
                      {pl.name}
                    </Chip>
                  );
                })}
              </View>
            ) : (
              <Text
                style={[
                  styles.emptyPlaylistText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                No playlists created yet. Click "+ New" to create one.
              </Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Create New Playlist
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Playlist Name"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              mode="outlined"
              autoFocus
              style={{ backgroundColor: theme.colors.surfaceVariant }}
              activeOutlineColor={theme.colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setDialogVisible(false)}
              textColor={theme.colors.secondary}
            >
              Cancel
            </Button>
            <Button
              onPress={handleCreatePlaylistAndAdd}
              disabled={!newPlaylistName.trim()}
              textColor={theme.colors.primary}
            >
              Create & Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24, // Ensure space for last card
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
  beltChip: {
    alignSelf: "flex-start",
    marginBottom: 16,
    paddingHorizontal: 8, // Add some horizontal padding
  },
  card: {
    marginBottom: 16,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 8, // Add margin for standalone titles
  },
  detailListItem: {
    paddingHorizontal: 0, // Remove default List.Item padding if Card.Content handles it
    paddingVertical: 6,
  },
  detailDivider: {
    marginVertical: 4,
    backgroundColor: "rgba(0,0,0,0.08)", // Softer divider
  },
  playlistChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8, // Add some space after the title/button
  },
  playlistChip: {
    // Styles for individual playlist chips
  },
  emptyPlaylistText: {
    marginTop: 12,
    textAlign: "center",
    opacity: 0.7,
  },
});
