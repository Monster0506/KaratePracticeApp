import { useTechniques } from "@/context/TechniquesProvider";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
    Appbar,
    Button,
    Checkbox,
    Divider,
    Text,
    useTheme,
} from "react-native-paper";

const beltColorMap: Record<string, string> = {
  Black: "#e2e2e2", // Dark text for Black belt (assuming light bg)
  Yellow: "#FBC02D", // Darker Yellow for better contrast on light bg
  Orange: "#F57C00", // Darker Orange
  Purple: "#8E24AA", // Darker Purple
  Blue: "#1976D2", // Darker Blue
  Green: "#388E3C", // Darker Green
  Brown: "#6D4C41", // Brown
  Red: "#D32F2F", // Darker Red
  White: "#212121", // Dark text for White belt
};

function getBeltColor(belt: string): string {
  const clean = belt.split(" ")[0];
  return beltColorMap[clean] ?? "#BDBDBD";
}

export default function RandomScreen() {
  const { techniques, setCurrentList } = useTechniques();
  const router = useRouter();
  const theme = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const beltsWithMeta = useMemo(() => {
    if (!techniques || techniques.length === 0) return [];
    const map: Record<
      string,
      { beltNumber: number; hasKids: boolean; originalName: string }
    > = {};
    techniques.forEach((t) => {
      if (!map[t.Belt]) {
        map[t.Belt] = {
          beltNumber: t.beltNumber,
          hasKids: false,
          originalName: t.Belt,
        };
      }
      if (t.Kids) map[t.Belt].hasKids = true;
    });

    return Object.entries(map)
      .sort(([, a], [, b]) => a.beltNumber - b.beltNumber)
      .map(([name, info]) => ({ name, ...info }));
  }, [techniques]);

  const kidBelts = beltsWithMeta.filter((b) => b.hasKids);
  const adultBelts = beltsWithMeta;

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isGroupSelected = (group: "kid" | "adult") => {
    const target = group === "kid" ? kidBelts : adultBelts;
    if (target.length === 0) return false;
    return target.every((b) => selected.has(`${b.name}_${group}`));
  };

  const toggleGroupSelection = (group: "kid" | "adult") => {
    const targetBelts = group === "kid" ? kidBelts : adultBelts;
    if (targetBelts.length === 0) return;

    const allKeys = targetBelts.map((b) => `${b.name}_${group}`);
    setSelected((prev) => {
      const next = new Set(prev);
      const currentlyAllSelected = allKeys.every((k) => next.has(k));
      if (currentlyAllSelected) {
        allKeys.forEach((k) => next.delete(k));
      } else {
        allKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const startPractice = () => {
    const selectedFilters = Array.from(selected).map((key) => {
      const [beltName, role] = key.split("_");
      return { beltName, role: role as "kid" | "adult" };
    });

    const list = techniques.filter((t) =>
      selectedFilters.some((s) => {
        if (s.beltName !== t.Belt) return false;
        if (s.role === "kid") return !!t.Kids;
        if (s.role === "adult") return t.Adults !== "true";
        return false;
      }),
    );

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setCurrentList(shuffled);
    router.push("/technique");
  };

  // Define BeltCheckboxItem inside the component to access `theme` and `selected`, `toggle`
  const BeltCheckboxItem = ({
    beltName,
    group,
  }: {
    beltName: string;
    group: "kid" | "adult";
  }) => {
    const key = `${beltName}_${group}`;
    const color = getBeltColor(beltName); // Get the specific color for the belt text

    return (
      <Checkbox.Item
        key={key}
        label={beltName} // Pass the belt name string directly to the label prop
        status={selected.has(key) ? "checked" : "unchecked"}
        onPress={() => toggle(key)}
        position="leading" // Checkbox appears before the label
        style={styles.checkboxItem}
        color={theme.colors.primary} // Color of the checkbox itself when checked
        uncheckedColor={theme.colors.onSurfaceDisabled} // Color of the checkbox when unchecked
        labelStyle={{
          // Apply styles to the label text
          color: color, // Apply the dynamic belt color
          marginLeft: 8, // Add some space between checkbox and text
          fontSize: 16, // Consistent font size for labels
        }}
      />
    );
  };

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
          title="Random Practice Setup"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContentContainer}>
        <Text
          variant="titleMedium"
          style={[
            styles.instructions,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          Select belts to include in your random practice session.
        </Text>

        <View style={styles.columnsContainer}>
          <View style={styles.column}>
            <Text
              variant="titleLarge"
              style={[styles.columnTitle, { color: theme.colors.onSurface }]}
            >
              Kids Belts
            </Text>
            <Divider style={styles.divider} />
            {kidBelts.length > 0 ? (
              kidBelts.map((b) => (
                <BeltCheckboxItem
                  key={`${b.name}_kid_item`} // Ensure unique key for the component instance
                  beltName={b.name}
                  group="kid"
                />
              ))
            ) : (
              <Text style={styles.emptyColumnText}>No kids belts found.</Text>
            )}
            {kidBelts.length > 0 && (
              <Button
                mode="outlined"
                onPress={() => toggleGroupSelection("kid")}
                style={styles.toggleAllButton}
                labelStyle={{ fontSize: 13 }}
                compact
                textColor={theme.colors.primary}
              >
                {isGroupSelected("kid") ? "Deselect All" : "Select All"}
              </Button>
            )}
          </View>

          <View style={styles.column}>
            <Text
              variant="titleLarge"
              style={[styles.columnTitle, { color: theme.colors.onSurface }]}
            >
              Adult Belts
            </Text>
            <Divider style={styles.divider} />
            {adultBelts.length > 0 ? (
              adultBelts.map((b) => (
                <BeltCheckboxItem
                  key={`${b.name}_adult_item`} // Ensure unique key
                  beltName={b.name}
                  group="adult"
                />
              ))
            ) : (
              <Text style={styles.emptyColumnText}>No adult belts found.</Text>
            )}
            {adultBelts.length > 0 && (
              <Button
                mode="outlined"
                onPress={() => toggleGroupSelection("adult")}
                style={styles.toggleAllButton}
                labelStyle={{ fontSize: 13 }}
                compact
                textColor={theme.colors.primary}
              >
                {isGroupSelected("adult") ? "Deselect All" : "Select All"}
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.actionsContainer,
          {
            borderTopColor: theme.colors.outlineVariant,
            backgroundColor: theme.colors.surfaceVariant, // Added subtle bg
          },
        ]}
      >
        <Button
          mode="contained"
          onPress={startPractice}
          disabled={selected.size === 0}
          style={styles.startButton}
          labelStyle={{ fontWeight: "bold", fontSize: 16 }}
          icon="play-circle-outline"
          contentStyle={{ paddingVertical: 4 }} // Make button taller
        >
          Start Practice ({selected.size})
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  instructions: {
    marginBottom: 20, // Increased margin
    textAlign: "center",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  columnsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  column: {
    flex: 1,
    // backgroundColor: theme.colors.surfaceContainerLow, // Example for subtle card-like bg
    // borderRadius: 8,
    // padding: 8, // If adding bg, add padding
  },
  columnTitle: {
    marginBottom: 10, // Increased margin
    textAlign: "center",
    fontWeight: "600", // Slightly bolder
  },
  divider: {
    marginBottom: 8,
    height: 1, // Make divider more visible if needed
  },
  checkboxItem: {
    paddingVertical: 2, // Adjusted padding
    paddingHorizontal: 0, // Let labelStyle handle horizontal spacing from checkbox
    minHeight: 44, // Good touch target size
    // backgroundColor: 'transparent', // Ensure no unexpected background
  },
  toggleAllButton: {
    marginTop: 12,
    alignSelf: "center",
  },
  emptyColumnText: {
    textAlign: "center",
    opacity: 0.6,
    paddingVertical: 16,
    fontStyle: "italic",
  },
  actionsContainer: {
    padding: 16,
    paddingBottom: 24, // More padding for home bar area
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  startButton: {
    // paddingVertical: 6, // Use contentStyle for inner padding
  },
});
