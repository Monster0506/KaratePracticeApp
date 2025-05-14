import React, { useRef, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, useTheme } from "react-native-paper";
import { Share } from "react-native";
import ViewShot from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import { ShareCard } from "@/utils/shareCard";
import { ACHIEVEMENTS, getAchievements } from "@/utils/achievement";
import { getPracticeHistory } from "@/utils/practiceLogger";
import { getTechniqueViews } from "@/utils/viewLogger";
import { useTechniques } from "@/context/TechniquesProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";

export default function ShareScreen() {
  const viewRef = useRef<View>(null);
  const theme = useTheme();
  const { playlists } = useTechniques();
  const { u, s, t, e } = useLocalSearchParams<{
    u?: string;
    s?: string;
    t?: string;
    e?: string;
  }>();

  const [username, setUsername] = useState("Karateka");
  const [data, setData] = useState({
    sessions: 0,
    techniques: 0,
    earned: [] as string[],
  });

  // If query params are present, load them
  useEffect(() => {
    if (u && s && t && e !== undefined) {
      setUsername(decodeURIComponent(u));
      setData({
        sessions: parseInt(s, 10),
        techniques: parseInt(t, 10),
        earned: decodeURIComponent(e).split(",").filter(Boolean),
      });
    } else {
      // Otherwise, load local data
      (async () => {
        const stored = await AsyncStorage.getItem("username");
        if (stored) setUsername(stored);

        const hist = await getPracticeHistory();
        const views = await getTechniqueViews();

        const stat = {
          sessions: hist.length,
          techniques: hist.flatMap((h) => h.techniques).length,
          views: views.length,
          playlists: playlists.length,
          longestStreak: await import("@/utils/achievement").then((m) =>
            m.computeStreak(hist),
          ),
        };

        setData({
          sessions: stat.sessions,
          techniques: stat.techniques,
          earned: getAchievements(stat),
        });
      })();
    }
  }, [u, s, t, e]);

  const doShare = async () => {
    if (!viewRef.current) return;
    const uri = await ViewShot.captureRef(viewRef, {
      format: "png",
      quality: 0.9,
    });
    await Share.share({ url: uri });
    FileSystem.deleteAsync(uri, { idempotent: true });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ShareCard
        ref={viewRef}
        username={username}
        sessions={data.sessions}
        techniques={data.techniques}
        earned={data.earned}
      />
      <Button mode="contained" style={{ marginTop: 20 }} onPress={doShare}>
        Share My Progress
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
});
