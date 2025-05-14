import React, { useMemo, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Checkbox, Button, Text, useTheme } from "react-native-paper";
import { useTechniques } from "@/context/TechniquesProvider";
import { useRouter } from "expo-router";

export default function RandomScreen() {
  const { techniques, setCurrentList } = useTechniques();
  const router = useRouter();
  const theme = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const beltsWithMeta = useMemo(() => {
    const map: Record<string, { beltNumber: number; hasKids: boolean }> = {};
    techniques.forEach((t) => {
      if (!map[t.Belt]) {
        map[t.Belt] = { beltNumber: t.beltNumber, hasKids: false };
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
    return target.every((b) => selected.has(`${b.name}_${group}`));
  };

  const toggleGroupSelection = (group: "kid" | "adult") => {
    const allKeys = (group === "kid" ? kidBelts : adultBelts).map(
      (b) => `${b.name}_${group}`,
    );

    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = allKeys.every((k) => next.has(k));
      if (allSelected) {
        allKeys.forEach((k) => next.delete(k));
      } else {
        allKeys.forEach((k) => next.add(k));
      }
      return next;
    });
  };

  const start = () => {
    const selectedBelts = Array.from(selected).map((key) => {
      const [name, role] = key.split("_");
      return { name, role: role as "kid" | "adult" };
    });

    const list = techniques.filter((t) =>
      selectedBelts.some((s) => {
        if (s.name !== t.Belt) return false;
        if (s.role === "kid") return t.Kids;
        if (s.role === "adult") return t.Adults !== "true";
        return false;
      }),
    );

    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setCurrentList(shuffled);
    router.push("/technique");
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text variant="headlineSmall" style={styles.header}>
        Random Practice
      </Text>

      <View style={styles.columns}>
        {/* Kids Belts */}
        <View style={styles.column}>
          <Text variant="titleMedium" style={styles.title}>
            Kids Belts
          </Text>
          {kidBelts.map((b) => {
            const key = `${b.name}_kid`;
            return (
              <Checkbox.Item
                key={key}
                label={b.name}
                status={selected.has(key) ? "checked" : "unchecked"}
                onPress={() => toggle(key)}
              />
            );
          })}
          <Button
            mode="outlined"
            onPress={() => toggleGroupSelection("kid")}
            style={styles.toggleBtn}
          >
            {isGroupSelected("kid") ? "Deselect All" : "Select All"}
          </Button>
        </View>

        {/* Adult Belts */}
        <View style={styles.column}>
          <Text variant="titleMedium" style={styles.title}>
            Adult Belts
          </Text>
          {adultBelts.map((b) => {
            const key = `${b.name}_adult`;
            return (
              <Checkbox.Item
                key={key}
                label={b.name}
                status={selected.has(key) ? "checked" : "unchecked"}
                onPress={() => toggle(key)}
              />
            );
          })}
          <Button
            mode="outlined"
            onPress={() => toggleGroupSelection("adult")}
            style={styles.toggleBtn}
          >
            {isGroupSelected("adult") ? "Deselect All" : "Select All"}
          </Button>
        </View>
      </View>

      <View style={styles.actions}>
        <Button mode="contained" onPress={start} disabled={selected.size === 0}>
          Start Practice
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    gap: 20,
    flexGrow: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: 4,
  },
  columns: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  column: {
    flex: 1,
  },
  title: {
    marginBottom: 8,
  },
  toggleBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  actions: {
    gap: 12,
    marginTop: 24,
    alignItems: "center",
  },
});
