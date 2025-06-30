import { TechniquesProvider } from "@/context/TechniquesProvider";
import { useAnonymousAuth } from "@/hooks/useAnonAuth";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import { MD3DarkTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const { initializing, error } = useAnonymousAuth();
  if (error) {
    console.error("Error signing in anonymously:", error);
  }
  if (initializing) return null;
  return (
    <SafeAreaProvider>
      <PaperProvider theme={MD3DarkTheme}>
        <TechniquesProvider>
          <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <StatusBar style="light" />
            <View style={styles.container}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade_from_bottom",
                }}
              />
            </View>
          </SafeAreaView>
        </TechniquesProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: MD3DarkTheme.colors.background,
    paddingTop: 24,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
  },
});
