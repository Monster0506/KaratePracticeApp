import React, { useRef, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import PagerView from "react-native-pager-view";
import { useRouter } from "expo-router";
import {
  Button,
  Text,
  Chip,
  useTheme,
  SegmentedButtons,
  Surface,
  Divider,
} from "react-native-paper";
import { useTechniques } from "@/context/TechniquesProvider";

const beltColorMap: Record<string, string> = {
  Black: "#E0E0E0",
  Yellow: "#FDD835",
  Orange: "#FB8C00",
  Purple: "#AB47BC",
  Blue: "#42A5F5",
  Green: "#66BB6A",
  Brown: "#8D6E63",
  Red: "#EF5350",
  White: "#212121",
};

function getBeltColor(belt: string): string {
  const clean = belt.split(" ")[0];
  return beltColorMap[clean] ?? "#BDBDBD";
}

export default function Home() {
  const theme = useTheme();
  const router = useRouter();
  const pagerRef = useRef<PagerView>(null);
  const [tab, setTab] = useState("practice");

  const { techniques, setCurrentList, flagged } = useTechniques();

  const sortedBelts = (list: string[]) => {
    const beltOrder: Record<string, number> = {};
    techniques.forEach((t) => (beltOrder[t.Belt] = t.beltNumber));
    return [...new Set(list)].sort((a, b) => beltOrder[a] - beltOrder[b]);
  };

  const kidBelts = sortedBelts(
    techniques.filter((t) => t.Kids).map((t) => t.Belt),
  );

  const adultBelts = sortedBelts(
    techniques.filter((t) => t.Adults !== "true").map((t) => t.Belt),
  );

  const showBelt = (belt: string, isKid: boolean) => {
    const list = techniques
      .filter((t) => t.Belt === belt && (isKid ? t.Kids : t.Adults !== "true"))
      .sort((a, b) => a.Number - b.Number);
    setCurrentList(list);
    router.push("/technique");
  };

  const onTabChange = (value: string) => {
    setTab(value);
    pagerRef.current?.setPage(["practice", "tools", "progress"].indexOf(value));
  };

  const onPageSelected = (e: any) => {
    const page = e.nativeEvent.position;
    const value = ["practice", "tools", "progress"][page];
    setTab(value);
  };

  return (
    <View
      style={[styles.wrapper, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Karate Trainer
      </Text>

      <SegmentedButtons
        value={tab}
        onValueChange={onTabChange}
        buttons={[
          { label: "Practice", value: "practice" },
          { label: "Tools", value: "tools" },
          { label: "Progress", value: "progress" },
        ]}
        style={styles.segmented}
      />

      <PagerView
        style={styles.pager}
        initialPage={0}
        ref={pagerRef}
        onPageSelected={onPageSelected}
      >
        {/* Practice Tab */}
        <ScrollView contentContainerStyle={styles.page} key="practice">
          <Surface mode="flat" style={styles.card}>
            <Text variant="titleMedium">Belt Index</Text>
            <Divider style={styles.divider} />
            <View style={styles.columns}>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Kids</Text>
                {kidBelts.map((belt) => (
                  <Chip
                    key={`kid-${belt}`}
                    style={[
                      styles.chip,
                      { borderColor: getBeltColor(belt), borderWidth: 1 },
                    ]}
                    textStyle={{ color: getBeltColor(belt) }}
                    onPress={() => showBelt(belt, true)}
                  >
                    {belt}
                  </Chip>
                ))}
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Adults</Text>
                {adultBelts.map((belt) => (
                  <Chip
                    key={`adult-${belt}`}
                    style={[
                      styles.chip,
                      { borderColor: getBeltColor(belt), borderWidth: 1 },
                    ]}
                    textStyle={{ color: getBeltColor(belt) }}
                    onPress={() => showBelt(belt, false)}
                  >
                    {belt}
                  </Chip>
                ))}
              </View>
            </View>
          </Surface>

          <Surface mode="flat" style={styles.card}>
            <Button mode="contained" onPress={() => router.push("/random")}>
              Random Practice
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                const list = techniques.filter((t) => flagged.includes(t.Name));
                setCurrentList(list);
                router.push("/technique");
              }}
            >
              Flagged Techniques
            </Button>
          </Surface>
        </ScrollView>

        {/* Tools Tab */}
        <ScrollView contentContainerStyle={styles.page} key="tools">
          <Surface mode="flat" style={styles.card}>
            <Button mode="contained" onPress={() => router.push("/search")}>
              Search Techniques
            </Button>
            <Button mode="contained" onPress={() => router.push("/playlists")}>
              Playlists
            </Button>
            <Button mode="outlined" onPress={() => router.push("/settings")}>
              Settings
            </Button>
          </Surface>
        </ScrollView>

        {/* Progress Tab */}
        <ScrollView contentContainerStyle={styles.page} key="progress">
          <Surface mode="flat" style={styles.card}>
            <Button mode="outlined" onPress={() => router.push("/practice")}>
              Practice History
            </Button>
            <Button mode="outlined" onPress={() => router.push("/stats")}>
              Practice Stats
            </Button>
            <Button mode="outlined" onPress={() => router.push("/share")}>
              Share My Stats
            </Button>

            <Button
              mode="outlined"
              onPress={() => router.push("/scan")}
              icon="qrcode-scan"
            >
              Scan Stats QR Code
            </Button>
          </Surface>
        </ScrollView>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  segmented: {
    marginBottom: 12,
  },
  pager: {
    flex: 1,
  },
  page: {
    gap: 20,
    paddingBottom: 32,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    gap: 12,
  },
  divider: {
    opacity: 0.2,
    marginBottom: 12,
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  column: {
    flex: 1,
    gap: 6,
  },
  columnTitle: {
    fontWeight: "600",
    marginBottom: 4,
    opacity: 0.8,
  },
  chip: {
    marginVertical: 2,
  },
});
