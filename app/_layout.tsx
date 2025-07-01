import { DarkTheme } from "@/constants/Theme";
import { TechniquesProvider } from "@/context/TechniquesProvider";
import { useAnonymousAuth } from "@/hooks/useAnonAuth";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Provider as PaperProvider } from "react-native-paper";
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
      <PaperProvider theme={DarkTheme}>
        <TechniquesProvider>
          <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <StatusBar style="light" />
            <View style={styles.container}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  animationDuration: 200,
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
    backgroundColor: DarkTheme.colors.background,
  },
  container: {
    flex: 1,
  },
});
