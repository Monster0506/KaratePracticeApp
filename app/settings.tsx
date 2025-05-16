import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Button,
  Text,
  ActivityIndicator,
  Dialog,
  TextInput,
  Portal,
  useTheme,
  Menu,
  Appbar, // Added
  Card, // Added
  List, // Added
  Divider, // Added
  Snackbar, // For feedback
} from "react-native-paper";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "@react-native-firebase/firestore"; // Removed unused 'collection'
import { getApp } from "@react-native-firebase/app"; // Ensure app is initialized
import { useTechniques } from "@/context/TechniquesProvider";
import { useAnonymousAuth } from "@/hooks/useAnonAuth";

export default function SettingsScreen() {
  const { refreshData, loading: techniquesLoading } = useTechniques();
  const router = useRouter();
  const theme = useTheme();
  const { user, initializing: authInitializing } = useAnonymousAuth();

  const [reminderDialogVisible, setReminderDialogVisible] = useState(false);
  const [reminderHour, setReminderHour] = useState("18");
  const [reminderMinute, setReminderMinute] = useState("00");
  const [isReminderSet, setIsReminderSet] = useState(false); // To show current reminder status

  const [username, setUsername] = useState(""); // Initialize empty, load from Firestore
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [delayMs, setDelayMs] = useState("4000");

  const [hourMenuVisible, setHourMenuVisible] = useState(false);
  const [minuteMenuVisible, setMinuteMenuVisible] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Load all settings
  useEffect(() => {
    const loadAllSettings = async () => {
      // Load delay
      const storedDelay = await AsyncStorage.getItem("delayBetweenTechniques");
      if (storedDelay) setDelayMs(storedDelay);

      // Load reminder time
      const storedReminderHour = await AsyncStorage.getItem("reminderHour");
      const storedReminderMinute = await AsyncStorage.getItem("reminderMinute");
      if (storedReminderHour) setReminderHour(storedReminderHour);
      if (storedReminderMinute) setReminderMinute(storedReminderMinute);
      if (storedReminderHour && storedReminderMinute) setIsReminderSet(true);

      // Load username if user is available
      if (user?.uid) {
        setUsernameLoading(true);
        try {
          const app = getApp(); // Ensure Firebase app is initialized
          const db = getFirestore(app);
          const userRef = doc(db, "users", user.uid);
          const snapshot = await getDoc(userRef);
          const data = snapshot.data();
          if (data?.username) {
            setUsername(data.username);
          } else {
            setUsername("Karateka"); // Default if not set
          }
        } catch (error) {
          console.error("Error loading username:", error);
          setUsername("Karateka"); // Default on error
          showSnackbar("Could not load username.");
        } finally {
          setUsernameLoading(false);
        }
      } else if (!authInitializing) {
        // If auth is done and no user, set default
        setUsername("Karateka");
      }
    };
    loadAllSettings();
  }, [user, authInitializing]); // Rerun if user or auth state changes

  const handleUsernameChange = (text: string) => {
    setUsername(text);
  };

  const commitUsernameToFirestore = async () => {
    if (!user?.uid) {
      showSnackbar("You need to be signed in to save a username.");
      return;
    }
    const cleanUsername = username.trim() || "Karateka";
    if (username !== cleanUsername) setUsername(cleanUsername); // Update UI if trimmed

    setUsernameLoading(true);
    try {
      const app = getApp();
      const db = getFirestore(app);
      const userDocRef = doc(db, "users", user.uid); // Corrected path
      await setDoc(userDocRef, { username: cleanUsername }, { merge: true });
      showSnackbar("Username updated!");
    } catch (err) {
      console.error("Firestore error saving username:", err);
      showSnackbar("Failed to update username.");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleDelayChange = async (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, ""); // Allow only numbers
    setDelayMs(numericValue);
    if (numericValue) {
      await AsyncStorage.setItem("delayBetweenTechniques", numericValue);
    } else {
      // Handle empty string case, maybe remove from storage or set a default
      await AsyncStorage.removeItem("delayBetweenTechniques");
    }
  };
  const commitDelay = async () => {
    if (!delayMs.trim()) {
      setDelayMs("4000"); // Reset to default if empty
      await AsyncStorage.setItem("delayBetweenTechniques", "4000");
    }
    showSnackbar("Delay saved.");
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0"),
  );

  const scheduleReminder = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } =
        await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") {
        showSnackbar("Notification permission is required.");
        return;
      }
    }

    await AsyncStorage.setItem("reminderHour", reminderHour);
    await AsyncStorage.setItem("reminderMinute", reminderMinute);
    setIsReminderSet(true);

    await Notifications.cancelAllScheduledNotificationsAsync(); // Cancel previous
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🥋 Karate Practice Time!",
          body: "Ready to train? Let's go!",
          sound: "default", // Add sound
        },
        trigger: {
          hour: parseInt(reminderHour, 10),
          minute: parseInt(reminderMinute, 10),
          repeats: true, // Daily
        },
      });
      showSnackbar(`Reminder set for ${reminderHour}:${reminderMinute} daily.`);
    } catch (e) {
      console.error("Failed to schedule notification", e);
      showSnackbar("Failed to set reminder.");
      setIsReminderSet(false); // Revert state if failed
    }
    setReminderDialogVisible(false);
  };

  const cancelReminders = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.removeItem("reminderHour");
    await AsyncStorage.removeItem("reminderMinute");
    setIsReminderSet(false);
    showSnackbar("All reminders cancelled.");
  };

  if (authInitializing) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator animating={true} size="large" />
        <Text style={{ marginTop: 10, color: theme.colors.onSurface }}>
          Authenticating...
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
          title="Settings"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Title
            title="User Profile"
            left={(props) => (
              <List.Icon {...props} icon="account-circle-outline" />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Card.Content>
            <TextInput
              label="Display Name"
              value={username}
              onChangeText={handleUsernameChange}
              onBlur={commitUsernameToFirestore}
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="account-edit" />}
              disabled={usernameLoading || !user}
              right={
                usernameLoading ? (
                  <TextInput.Affix text={<ActivityIndicator size="small" />} />
                ) : null
              }
            />
            {!user && (
              <Text style={styles.authNote}>Sign in to set a username.</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Practice Settings"
            left={(props) => <List.Icon {...props} icon="cog-outline" />}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Card.Content>
            <List.Item
              title="Daily Practice Reminder"
              description={
                isReminderSet
                  ? `Set for ${reminderHour}:${reminderMinute} daily`
                  : "Not set"
              }
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={isReminderSet ? "bell-ring" : "bell-outline"}
                />
              )}
              onPress={() => setReminderDialogVisible(true)}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              style={styles.listItem}
              titleStyle={{ color: theme.colors.onSurfaceVariant }}
              descriptionStyle={{
                color: theme.colors.onSurfaceVariant,
                opacity: 0.7,
              }}
            />
            {isReminderSet && (
              <Button
                mode="text"
                onPress={cancelReminders}
                textColor={theme.colors.error}
                style={{ alignSelf: "flex-start", marginLeft: 8 }}
              >
                Cancel Reminder
              </Button>
            )}
            <Divider style={styles.divider} />
            <TextInput
              label="Delay Between Techniques (ms)"
              value={delayMs}
              onChangeText={handleDelayChange}
              onBlur={commitDelay}
              mode="outlined"
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Icon icon="timer-sand" />}
              placeholder="e.g., 4000"
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Title
            title="Data Management"
            left={(props) => (
              <List.Icon {...props} icon="database-cog-outline" />
            )}
            titleStyle={{ color: theme.colors.onSurface }}
          />
          <Card.Content>
            <Text
              style={[
                styles.descriptionText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Force a refresh of the local technique data from the source. This
              may take a moment.
            </Text>
            <Button
              mode="contained"
              onPress={refreshData}
              loading={techniquesLoading}
              disabled={techniquesLoading}
              icon="database-refresh"
              style={styles.actionButton}
              labelStyle={{ fontWeight: "bold" }}
            >
              Refresh Database
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Portal>
        <Dialog
          visible={reminderDialogVisible}
          onDismiss={() => setReminderDialogVisible(false)}
          style={{ backgroundColor: theme.colors.elevation.level3 }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            Select Reminder Time
          </Dialog.Title>
          <Dialog.Content>
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text
                  variant="labelLarge"
                  style={[
                    styles.pickerLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Hour
                </Text>
                <Menu
                  visible={hourMenuVisible}
                  onDismiss={() => setHourMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setHourMenuVisible(true)}
                      style={styles.pickerButton}
                      contentStyle={styles.pickerButtonContent}
                    >
                      {reminderHour}
                    </Button>
                  }
                  style={{ maxHeight: 200 }} // Allow menu to scroll
                >
                  {hourOptions.map((hour) => (
                    <Menu.Item
                      key={hour}
                      title={hour}
                      onPress={() => {
                        setReminderHour(hour);
                        setHourMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.pickerColumn}>
                <Text
                  variant="labelLarge"
                  style={[
                    styles.pickerLabel,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  Minute
                </Text>
                <Menu
                  visible={minuteMenuVisible}
                  onDismiss={() => setMinuteMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMinuteMenuVisible(true)}
                      style={styles.pickerButton}
                      contentStyle={styles.pickerButtonContent}
                    >
                      {reminderMinute}
                    </Button>
                  }
                  style={{ maxHeight: 200 }} // Allow menu to scroll
                >
                  {minuteOptions.map((min) => (
                    <Menu.Item
                      key={min}
                      title={min}
                      onPress={() => {
                        setReminderMinute(min);
                        setMinuteMenuVisible(false);
                      }}
                    />
                  ))}
                </Menu>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => setReminderDialogVisible(false)}
              textColor={theme.colors.secondary}
            >
              Cancel
            </Button>
            <Button onPress={scheduleReminder} textColor={theme.colors.primary}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        style={{ backgroundColor: theme.colors.inverseSurface }}
        action={{
          label: "Dismiss",
          textColor: theme.colors.inversePrimary,
          onPress: () => setSnackbarVisible(false),
        }}
      >
        <Text style={{ color: theme.colors.inverseOnSurface }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
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
    elevation: 1,
  },
  input: {
    marginTop: 8, // Add some space if it's not the first element in Card.Content
    // backgroundColor: theme.colors.surfaceVariant, // Optional: if you want distinct input bg
  },
  authNote: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: "center",
  },
  listItem: {
    paddingHorizontal: 0, // Remove default padding if Card.Content handles it
  },
  divider: {
    marginVertical: 12,
  },
  descriptionText: {
    marginBottom: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // Center the pickers
    marginTop: 12,
    marginBottom: 12,
  },
  pickerColumn: {
    alignItems: "center", // Center label and button
    marginHorizontal: 10,
  },
  pickerLabel: {
    marginBottom: 6,
  },
  pickerButton: {
    minWidth: 80, // Ensure button has some width
    justifyContent: "center",
  },
  pickerButtonContent: {
    paddingVertical: 6, // Make button taller
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 5,
    alignSelf: "center",
    paddingTop: 20, // Align with buttons
  },
});
