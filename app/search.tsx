import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import {
  TextInput,
  List,
  Text,
  Button,
  Divider,
  Checkbox,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useTechniques } from "@/context/TechniquesProvider";
import Fuse from "fuse.js";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export default function SearchScreen() {
  const { techniques } = useTechniques();
  const router = useRouter();
  const theme = useTheme();

  const [query, setQuery] = useState("");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    (keyof typeof filters)[]
  >([]);

  const getAvailableCount = (key: keyof typeof filters) => {
    const valueSet = new Set(techniques.map((t) => t[key]));
    return valueSet.size;
  };
  const [filters, setFilters] = useState<{
    Belt: string[];
    Attack: string[];
    Block: string[];
    Strike: string[];
  }>({
    Belt: [],
    Attack: [],
    Block: [],
    Strike: [],
  });

  const fuse = useMemo(
    () =>
      new Fuse(techniques, {
        keys: ["Name"],
        threshold: 0.35,
      }),
    [techniques],
  );

  const filtered = useMemo(() => {
    const base = query ? fuse.search(query).map((r) => r.item) : techniques;

    return base
      .filter((t) => {
        if (t.Adults === "true") return false; // hide the duplicate
        const match = (field: keyof typeof filters) =>
          filters[field].length === 0 || filters[field].includes(t[field]);
        return (
          match("Belt") && match("Attack") && match("Block") && match("Strike")
        );
      })
      .sort((a, b) => a.Name.localeCompare(b.Name));
  }, [query, techniques, filters]);

  const toggleFilter = (field: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const set = new Set(prev[field]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  const uniqueValues = (key: keyof typeof filters) =>
    Array.from(new Set(techniques.map((t) => t[key]))).sort();

  const toggleExpand = (key: keyof typeof filters) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const clearAll = () =>
    setFilters({ Belt: [], Attack: [], Block: [], Strike: [] });

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background, flexGrow: 1 },
      ]}
      style={{ flex: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchRow}>
        <TextInput
          mode="outlined"
          placeholder="Search techniques"
          value={query}
          onChangeText={setQuery}
          style={styles.input}
        />
        <Text style={styles.countText}>{filtered.length}</Text>
      </View>

      <Button
        mode="outlined"
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setFiltersVisible(!filtersVisible);
        }}
        style={styles.filterToggle}
      >
        {filtersVisible ? "Hide Filters" : "Show Filters"}
      </Button>

      {filtersVisible && (
        <View style={styles.filterPanel}>
          {(["Belt", "Attack", "Block", "Strike"] as const).map((field) => (
            <View key={field} style={styles.filterGroup}>
              <View style={styles.filterHeader}>
                <Text variant="titleSmall">
                  {field} ({getAvailableCount(field)})
                </Text>
                <IconButton
                  icon={
                    expandedSections.includes(field)
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  onPress={() => toggleExpand(field)}
                />
              </View>
              {expandedSections.includes(field) &&
                uniqueValues(field).map((value) => (
                  <Checkbox.Item
                    key={value}
                    label={value}
                    status={
                      filters[field].includes(value) ? "checked" : "unchecked"
                    }
                    onPress={() => toggleFilter(field, value)}
                  />
                ))}
              <Divider />
            </View>
          ))}

          <Button onPress={clearAll} style={styles.clearButton}>
            Clear Filters
          </Button>
        </View>
      )}

      {filtered.map((item) => (
        <List.Item
          key={item.Name}
          title={item.Name}
          description={`${item.Belt}`}
          onPress={() =>
            router.push(`/technique/${encodeURIComponent(item.Name)}`)
          }
          style={styles.item}
        />
      ))}

      {filtered.length === 0 && (
        <Text style={styles.emptyText}>No matching techniques found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  input: {
    flex: 1,
    marginBottom: 12,
  },
  filterToggle: {
    marginBottom: 12,
  },
  filterPanel: {
    marginBottom: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#444",
    padding: 12,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  clearButton: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  item: {
    paddingVertical: 4,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.6,
    marginTop: 24,
    fontSize: 16,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  countText: {
    fontSize: 16,
    opacity: 0.6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#333", // or theme.colors.elevation.level2
    color: "#ccc",
  },
});
