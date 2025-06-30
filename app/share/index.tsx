import React, { useEffect, useRef, useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";
// import Share from "react-native-share"; // Ensure react-native is used for Share
import { useTechniques } from "@/context/TechniquesProvider";
import { getAchievements } from "@/utils/achievement";
import { getPracticeHistory } from "@/utils/practiceLogger";
import { ShareCard } from "@/utils/shareCard";
import { getTechniqueViews } from "@/utils/viewLogger";
import { Alert } from "react-native";
import ViewShot from "react-native-view-shot"; // Default import for component and its type

import { useAnonymousAuth } from "@/hooks/useAnonAuth";
import { getApp } from "@react-native-firebase/app";
import { doc, getDoc, getFirestore } from "@react-native-firebase/firestore";
import { useLocalSearchParams } from "expo-router";

// Assuming ShareContent and ShareOptions interfaces are available
// from the type definition file where you provided them.
// You might need to import them if they are not in the same file.
// import { ShareContent, ShareOptions, ShareAction } from './your-types-file';

export default function ShareScreen() {
  const viewShotRef = useRef<ViewShot>(null);
  const theme = useTheme();
  const { playlists } = useTechniques();
  const { u } = useLocalSearchParams<{
    u?: string;
  }>();

  const [username, setUsername] = useState("Karateka");
  const { user } = useAnonymousAuth();
  const [data, setData] = useState({
    sessions: 0,
    techniques: 0,
    earned: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      if (u !== undefined) {
        setUsername(decodeURIComponent(u));
        // If 'u' is present, we might want to fetch specific data for that user
        // or display a generic card if data fetching for external 'u' is not implemented.
        // For now, if 'u' is present, we are only setting the username.
        // We might need to decide if we should clear or fetch specific 'data' here.
        // For simplicity, let's assume if 'u' is present, we show a card with that username
        // and potentially zeroed or default stats if not fetching specific data for 'u'.
        setData({ sessions: 0, techniques: 0, earned: [] }); // Reset data if 'u' is for a different user display
      } else {
        if (user?.uid) {
          const app = getApp();
          const db = getFirestore(app);
          const userRef = doc(db, "users", user.uid);
          const snapshot = await getDoc(userRef);
          const userData = snapshot.data();
          if (userData?.username) setUsername(userData.username);
        }

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
      }
    };

    fetchData();
  }, [u, user?.uid, playlists.length]);

  const doShare = async () => {
    try {
      const shareUrl = `Check out my Karate Progress:\n\nhttps://karateapp.monster0506.dev?u=${user?.uid || "default"}`;

      const shareContent = {
        message: shareUrl,
        title: "Check out my Karate Progress!",
        subject: "Check out this Karate App!",
      };

      const shareOptions = {
        title: "Check out my Karate Progress!",
        subject: "Check out this Karate App!",
        dialogTitle: "Share this Karate App link",
      };


      const shareResponse = await Share.share(shareContent, shareOptions);
    } catch (error: any) {
      console.error("Error during sharing process:", error);
      if (
        error.message &&
        (error.message.includes("User dismissed") ||
          error.message.includes("User did not share"))
      ) {
      } else {
        Alert.alert(
          "Share Error",
          "Could not share the link. Please try again.",
        );
      }
    } finally {
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* We still render the ShareCard visually, even if not sharing the image */}
      <ViewShot
        ref={viewShotRef}
        options={{ format: "png", quality: 0.9 }}
        style={{ backgroundColor: theme.colors.background }}
      >
        <ShareCard
          uid={user?.uid || "default"}
          username={username}
          sessions={data.sessions}
          techniques={data.techniques}
          earned={data.earned}
        />
      </ViewShot>
      <Button mode="contained" style={{ marginTop: 20 }} onPress={doShare}>
        Share My Karate App Link
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
