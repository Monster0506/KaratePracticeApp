import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  Button,
  Text,
  ActivityIndicator,
  Dialog,
  TextInput,
  Portal,
  useTheme,
  Menu,
} from "react-native-paper";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
} from "@react-native-firebase/firestore";
import { getApp } from "@react-native-firebase/app";
import { useTechniques } from "@/context/TechniquesProvider";
import { useAnonymousAuth } from "@/hooks/useAnonAuth";

export default function SettingsScreen() {
  const { refreshData, loading } = useTechniques();
  const router = useRouter();
  const theme = useTheme();
  const { user, initializing } = useAnonymousAuth();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [reminderHour, setReminderHour] = useState("18");
  const [reminderMinute, setReminderMinute] = useState("00");
  const [username, setUsername] = useState("Karateka");
  const [delayMs, setDelayMs] = useState("4000");
  const [hourMenuVisible, setHourMenuVisible] = useState(false);
  const [minuteMenuVisible, setMinuteMenuVisible] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const storedDelay = await AsyncStorage.getItem("delayBetweenTechniques");
      if (storedDelay) setDelayMs(storedDelay);

      if (user?.uid) {
        const app = getApp();
        const db = getFirestore(app);
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);
        const data = snapshot.data();
        if (data?.username) setUsername(data.username);
      }
    };
    loadSettings();
  }, [user]);

  const commitUsername = async () => {
    const clean = username.trim() || "Karateka";
    setUsername(clean); // Optional: snap to clean value

    if (user?.uid) {
      try {
        const app = getApp();
        const db = getFirestore(app);

        const userDocRef = doc(collection(db, "users"), user.uid);
        await setDoc(userDocRef, { username: clean }, { merge: true });
      } catch (err) {
        console.error("Firestore error:", err);
      }
    }
  };

  const saveUsername = async (val: string) => {
    setUsername(val);
  };

  const saveDelay = async (value: string) => {
    setDelayMs(value);
    await AsyncStorage.setItem("delayBetweenTechniques", value);
  };

  const loadReminderTime = async () => {
    const hour = await AsyncStorage.getItem("reminderHour");
    const minute = await AsyncStorage.getItem("reminderMinute");
    if (hour) setReminderHour(hour);
    if (minute) setReminderMinute(minute);
  };

  useEffect(() => {
    loadReminderTime();
  }, []);

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
        alert("Notification permission is required to set a reminder.");
        return;
      }
    }

    await AsyncStorage.setItem("reminderHour", reminderHour);
    await AsyncStorage.setItem("reminderMinute", reminderMinute);

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Karate Practice",
        body: "Time for your practice session!",
      },
      trigger: {
        type: "daily",
        hour: parseInt(reminderHour, 10),
        minute: parseInt(reminderMinute, 10),
        repeats: true,
      },
    });

    setDialogVisible(false);
  };

  if (initializing) return <ActivityIndicator />;

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Settings
      </Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button mode="contained" onPress={refreshData}>
          Refresh Technique Database
        </Button>
      )}

      <Button
        mode="contained"
        onPress={() => setDialogVisible(true)}
        style={styles.button}
      >
        Set Practice Reminder
      </Button>

      <TextInput
        label="Delay Between Techniques (ms)"
        value={delayMs}
        onChangeText={(text) => {
          if (/^\d*$/.test(text)) saveDelay(text);
        }}
        mode="outlined"
        keyboardType="numeric"
      />

      <TextInput
        label="Username"
        value={username}
        onChangeText={saveUsername}
        onBlur={commitUsername}
        mode="outlined"
      />

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
          <Dialog.Title>Select Reminder Time</Dialog.Title>
          <Dialog.Content>
            <View style={styles.pickerRow}>
              <View style={styles.picker}>
                <Text variant="labelLarge">Hour</Text>
                <Menu
                  visible={hourMenuVisible}
                  onDismiss={() => setHourMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setHourMenuVisible(true)}
                      style={styles.selectButton}
                    >
                      {reminderHour}
                    </Button>
                  }
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

              <View style={styles.picker}>
                <Text variant="labelLarge">Minute</Text>
                <Menu
                  visible={minuteMenuVisible}
                  onDismiss={() => setMinuteMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setMinuteMenuVisible(true)}
                      style={styles.selectButton}
                    >
                      {reminderMinute}
                    </Button>
                  }
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
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={scheduleReminder}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 24,
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginTop: 12,
  },
  picker: {
    flex: 1,
  },
  selectButton: {
    marginTop: 8,
    width: "100%",
  },
});
