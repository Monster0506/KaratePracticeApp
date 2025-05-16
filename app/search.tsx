import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
  FlatList, // Import FlatList
} from "react-native";
import {
  TextInput,
  List,
  Text,
  Button,
  Checkbox,
  useTheme,
  IconButton,
  Appbar,
  Card,
  Divider,
  ActivityIndicator, // For loading states
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useTechniques } from "@/context/TechniquesProvider";
import Fuse from "fuse.js";
import { useDebounce } from "use-debounce"; // A common hook for debouncing

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type FilterField = "Belt" | "Attack" | "Block" | "Strike";
const FILTER_FIELDS: FilterField[] = ["Belt", "Attack", "Block", "Strike"];

// Define the structure of your technique item more explicitly if possible
interface TechniqueItem {
  Name: string;
  Belt: string;
  Attack: string;
  Block: string;
  Strike: string;
  Adults?: string; // Assuming Adults is optional or might not exist on all items
  [key: string]: any; // For other potential fields
}

export default function SearchScreen() {
  const { techniques } = useTechniques() as { techniques: TechniqueItem[] }; // Cast for better type safety
  const router = useRouter();
  const theme = useTheme();

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500); // Debounce query by 500ms

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<FilterField[]>(
    [],
  );
  const [isProcessing, setIsProcessing] = useState(false); // Loading indicator

  const [filters, setFilters] = useState<Record<FilterField, string[]>>({
    Belt: [],
    Attack: [],
    Block: [],
    Strike: [],
  });

  const uniqueFilterValues = useMemo(() => {
    const allValues: Record<FilterField, string[]> = {
      Belt: [],
      Attack: [],
      Block: [],
      Strike: [],
    };
    if (techniques && techniques.length > 0) {
      FILTER_FIELDS.forEach((field) => {
        allValues[field] = Array.from(
          new Set(techniques.map((t) => t[field]).filter(Boolean)),
        ).sort();
      });
    }
    return allValues;
  }, [techniques]);

  const getAvailableCount = (key: FilterField) => {
    return uniqueFilterValues[key]?.length || 0;
  };

  const fuse = useMemo(() => {
    if (!techniques || techniques.length === 0) {
      // Return a dummy fuse instance or null if techniques are not ready
      return new Fuse([], { keys: ["Name"] });
    }
    return new Fuse(techniques, {
      keys: ["Name"],
      threshold: 0.35, // Consider making this stricter for large datasets
      // includeScore: true, // Useful for sorting by relevance
      // minMatchCharLength: 2, // Don't search for very short strings
    });
  }, [techniques]);

  const totalActiveFilters = useMemo(() => {
    return FILTER_FIELDS.reduce((sum, field) => sum + filters[field].length, 0);
  }, [filters]);

  const filteredTechniques = useMemo(() => {
    setIsProcessing(true);
    // IMPORTANT: For 2M records, this logic is still client-side.
    // Server-side search is the true fix.

    if (!techniques || techniques.length === 0) {
      setIsProcessing(false);
      return [];
    }

    // If no query and no filters, show nothing to avoid processing 2M records
    if (!debouncedQuery.trim() && totalActiveFilters === 0) {
      setIsProcessing(false);
      return techniques;
    }

    let base: TechniqueItem[];
    if (debouncedQuery.trim()) {
      base = fuse.search(debouncedQuery.trim()).map((r) => r.item);
    } else {
      // No query, but filters are active. This will iterate all techniques.
      // This is still a bottleneck for 2M records without a query.
      base = techniques;
    }

    const results = base
      .filter((t) => {
        if (t.Adults === "true") return false;
        return FILTER_FIELDS.every((field) => {
          const activeFiltersForField = filters[field];
          if (activeFiltersForField.length === 0) return true;
          return activeFiltersForField.includes(t[field]);
        });
      })
      .sort((a, b) => a.Name.localeCompare(b.Name));

    setIsProcessing(false);
    return results;
  }, [debouncedQuery, techniques, filters, fuse, totalActiveFilters]);

  const toggleFilterOption = (field: FilterField, value: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters((prev) => {
      const currentValues = new Set(prev[field]);
      currentValues.has(value)
        ? currentValues.delete(value)
        : currentValues.add(value);
      return { ...prev, [field]: Array.from(currentValues) };
    });
  };

  const toggleAccordion = (key: FilterField) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedAccordions((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const clearAllFilters = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({ Belt: [], Attack: [], Block: [], Strike: [] });
  };

  const toggleFiltersVisibility = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFiltersVisible(!filtersVisible);
    if (filtersVisible) Keyboard.dismiss();
  };

  const renderTechniqueItem = useCallback(
    ({ item }: { item: TechniqueItem }) => (
      <Card
        style={[
          styles.card,
          styles.resultItemCard,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() =>
          router.push(`/technique/${encodeURIComponent(item.Name)}`)
        }
      >
        <List.Item
          title={item.Name}
          description={`${item.Belt} ${item.Attack ? `| ${item.Attack}` : ""}`}
          titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
          descriptionStyle={[
            styles.itemDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
          left={(props) => (
            <List.Icon {...props} icon="karate" color={theme.colors.primary} />
          )}
        />
      </Card>
    ),
    [theme, router], // Dependencies for useCallback
  );

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
          title="Search Techniques"
          titleStyle={{ color: theme.colors.onSurface, fontWeight: "bold" }}
        />
        {isProcessing && (
          <ActivityIndicator
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
        )}
      </Appbar.Header>

      {/* Moved search and filter toggle outside ScrollView/FlatList for fixed positioning */}
      <View style={styles.controlsContainer}>
        <Card
          style={[
            styles.card,
            styles.searchCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Card.Content style={styles.searchCardContent}>
            <TextInput
              mode="outlined"
              placeholder="Search by name..."
              value={query}
              onChangeText={setQuery} // Use direct query for input, debouncedQuery for search logic
              style={styles.input}
              left={<TextInput.Icon icon="magnify" />}
              right={
                query ? (
                  <TextInput.Icon
                    icon="close-circle"
                    onPress={() => setQuery("")}
                  />
                ) : null
              }
              outlineColor={theme.colors.outlineVariant}
              activeOutlineColor={theme.colors.primary}
            />
            {/* Show count only when not processing and there's a query or filters */}
            {!isProcessing &&
              (debouncedQuery.trim() || totalActiveFilters > 0) && (
                <View
                  style={[
                    styles.countBadge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      { color: theme.colors.onPrimaryContainer },
                    ]}
                  >
                    {filteredTechniques.length}
                  </Text>
                </View>
              )}
          </Card.Content>
        </Card>

        <Button
          mode={filtersVisible ? "contained-tonal" : "outlined"}
          onPress={toggleFiltersVisibility}
          style={styles.filterToggleButton}
          icon={filtersVisible ? "filter-variant-remove" : "filter-variant"}
        >
          {filtersVisible
            ? "Hide Filters"
            : `Show Filters ${totalActiveFilters > 0 ? `(${totalActiveFilters})` : ""}`}
        </Button>
      </View>

      {filtersVisible && (
        <ScrollView style={styles.filterScrollContainer}>
          <Card
            style={[
              styles.card,
              styles.filterPanelCard,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          >
            <Card.Content>
              {FILTER_FIELDS.map((field) => (
                <List.Accordion
                  key={field}
                  title={`${field} (${filters[field].length > 0 ? `${filters[field].length}/` : ""}${getAvailableCount(field)})`}
                  expanded={expandedAccordions.includes(field)}
                  onPress={() => toggleAccordion(field)}
                  style={[
                    styles.accordion,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  titleStyle={{ color: theme.colors.onSurface }}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={
                        expandedAccordions.includes(field)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                >
                  {uniqueFilterValues[field].map((value) => (
                    <Checkbox.Item
                      key={value}
                      label={value}
                      status={
                        filters[field].includes(value) ? "checked" : "unchecked"
                      }
                      onPress={() => toggleFilterOption(field, value)}
                      style={styles.checkboxItem}
                      labelStyle={{ color: theme.colors.onSurfaceVariant }}
                      color={theme.colors.primary}
                      uncheckedColor={theme.colors.onSurfaceDisabled}
                    />
                  ))}
                </List.Accordion>
              ))}
              <Button
                onPress={clearAllFilters}
                style={styles.clearButton}
                mode="elevated"
                icon="filter-off-outline"
                disabled={totalActiveFilters === 0}
                textColor={theme.colors.error}
              >
                Clear All Filters
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {!filtersVisible && (
        <FlatList
          data={filteredTechniques}
          renderItem={renderTechniqueItem}
          keyExtractor={(item) => item.Name} // Ensure Name is unique or use a more robust key
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            !isProcessing &&
            (debouncedQuery.trim() || totalActiveFilters > 0) ? ( // Only show if a search/filter was attempted
              <View style={styles.emptyContainer}>
                <IconButton
                  icon="magnify-close"
                  size={48}
                  iconColor={theme.colors.outline}
                />
                <Text
                  style={[styles.emptyText, { color: theme.colors.outline }]}
                >
                  No matching techniques found.
                </Text>
                <Text
                  style={[styles.emptySubText, { color: theme.colors.outline }]}
                >
                  Try adjusting your search or filters.
                </Text>
              </View>
            ) : !isProcessing ? ( // Initial state or cleared search
              <View style={styles.emptyContainer}>
                <IconButton
                  icon="text-search"
                  size={48}
                  iconColor={theme.colors.outline}
                />
                <Text
                  style={[styles.emptyText, { color: theme.colors.outline }]}
                >
                  Enter a search term or apply filters.
                </Text>
              </View>
            ) : null // Don't show empty component while processing
          }
          // Performance Props for FlatList (optional, tune as needed)
          // initialNumToRender={10}
          // maxToRenderPerBatch={10}
          // windowSize={21}
          // removeClippedSubviews={true} // Can have bugs on Android
          // updateCellsBatchingPeriod={50}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  controlsContainer: {
    // Container for search bar and filter toggle button
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterScrollContainer: {
    // Allows filters to scroll independently if they become too long
    paddingHorizontal: 16,
    maxHeight: "40%", // Example max height, adjust as needed
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16, // Add padding at the bottom
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  searchCard: {
    marginBottom: 8, // Reduced margin as filter button is separate
  },
  searchCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
  },
  countBadge: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  filterToggleButton: {
    marginBottom: 8, // Add some margin below the toggle button
    paddingVertical: 4,
  },
  filterPanelCard: {
    // elevation: 1,
  },
  accordion: {
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  checkboxItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearButton: {
    marginTop: 16,
    alignSelf: "flex-end",
  },
  resultItemCard: {
    // elevation: 1
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: "500",
  },
  itemDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 20, // Give some space from controls
  },
  emptyText: {
    fontSize: 18,
    marginTop: 12,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
