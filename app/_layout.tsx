import React from "react";
import { Stack } from "expo-router";
import { Provider as PaperProvider, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { TechniquesProvider } from "@/context/TechniquesProvider";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { useAnonymousAuth } from "@/hooks/useAnonAuth";

export default function RootLayout() {
  const { user, initializing, error } = useAnonymousAuth();
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
