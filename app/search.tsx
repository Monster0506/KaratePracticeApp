import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  Keyboard,
  FlatList,
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
  ActivityIndicator,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { useTechniques } from "@/context/TechniquesProvider";
import Fuse from "fuse.js";
import { useDebounce } from "use-debounce";
import { ScrollView } from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type FilterField = "Belt" | "Attack" | "Block" | "Strike";
const FILTER_FIELDS: FilterField[] = ["Belt", "Attack", "Block", "Strike"];

interface TechniqueItem {
  Name: string;
  Belt: string;
  Attack: string;
  Block: string;
  Strike: string;
  Adults?: string;
  [key: string]: any;
}

export default function SearchScreen() {
  const { techniques } = useTechniques() as { techniques: TechniqueItem[] };
  const router = useRouter();
  const theme = useTheme();

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 500);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expandedAccordions, setExpandedAccordions] = useState<FilterField[]>(
    [],
  );
  const [isProcessing, setIsProcessing] = useState(false);

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
      return new Fuse([], { keys: ["Name"] });
    }
    return new Fuse(techniques, {
      keys: ["Name"],
      threshold: 0.35,
    });
  }, [techniques]);

  const totalActiveFilters = useMemo(() => {
    return FILTER_FIELDS.reduce((sum, field) => sum + filters[field].length, 0);
  }, [filters]);

  const filteredTechniques = useMemo(() => {
    setIsProcessing(true);

    if (!techniques || techniques.length === 0) {
      setIsProcessing(false);
      return [];
    }

    // If no query and no filters, return all techniques.
    // The loading state should handle the initial load time.
    if (!debouncedQuery.trim() && totalActiveFilters === 0) {
      setIsProcessing(false);
      return techniques; // Display all initially if data loaded
    }

    let base: TechniqueItem[];
    if (debouncedQuery.trim()) {
      base = fuse.search(debouncedQuery.trim()).map((r) => r.item);
    } else {
      base = techniques;
    }

    const results = base
      .filter((t) => {
        // Filter out "Adults" if that's a requirement
        if (t.Adults === "true") return false;
        // Apply other filters
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
          styles.resultItemCard,
          { backgroundColor: theme.colors.surface },
        ]}
        onPress={() =>
          router.push(`/technique/${encodeURIComponent(item.Name)}`)
        }
        elevation={1} // Use a subtle elevation
      >
        <Card.Content style={styles.resultItemContent}>
          <View style={styles.itemLeft}>
            <List.Icon icon="karate" color={theme.colors.primary} />
          </View>
          <View style={styles.itemRight}>
            <Text style={[styles.itemTitle, { color: theme.colors.onSurface }]}>
              {item.Name}
            </Text>
            <Text
              style={[
                styles.itemDescription,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {item.Belt} {item.Attack ? `| ${item.Attack}` : ""}
            </Text>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            color={theme.colors.onSurfaceVariant}
          />
        </Card.Content>
      </Card>
    ),
    [theme, router],
  );

  // Add a state to track if initial load is complete
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  useEffect(() => {
    if (techniques && techniques.length > 0) {
      setInitialLoadComplete(true);
    }
  }, [techniques]);

  const renderEmptyComponent = () => {
    // Show "Loading..." only on initial load
    if (!initialLoadComplete) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading techniques...
          </Text>
        </View>
      );
    }

    // Show specific empty states based on query/filters
    if (debouncedQuery.trim() || totalActiveFilters > 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconButton
            icon="magnify-close"
            size={48}
            iconColor={theme.colors.outline}
          />
          <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
            No matching techniques found.
          </Text>
          <Text style={[styles.emptySubText, { color: theme.colors.outline }]}>
            Try adjusting your search or filters.
          </Text>
        </View>
      );
    }

    // Initial state when no search or filters are active
    return (
      <View style={styles.emptyContainer}>
        <IconButton
          icon="text-search"
          size={48}
          iconColor={theme.colors.outline}
        />
        <Text style={[styles.emptyText, { color: theme.colors.outline }]}>
          Enter a search term or apply filters to find techniques.
        </Text>
      </View>
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

      {/* Fixed Controls Container */}
      <View style={styles.controlsContainer}>
        <Card
          style={[styles.searchCard, { backgroundColor: theme.colors.surface }]}
          elevation={2}
        >
          <Card.Content style={styles.searchCardContent}>
            <TextInput
              mode="outlined"
              placeholder="Search by name..."
              value={query}
              onChangeText={setQuery}
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
              contentStyle={{ paddingVertical: 0 }} // Adjust vertical padding
              dense // Use dense for smaller input
            />
            {/* Show count only when not processing and data is loaded and search/filters are active */}
            {!isProcessing &&
              initialLoadComplete &&
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
          mode={filtersVisible ? "contained" : "outlined"} // Use 'contained' for active filter button
          onPress={toggleFiltersVisibility}
          style={styles.filterToggleButton}
          icon={filtersVisible ? "filter-variant-remove" : "filter-variant"}
          textColor={
            filtersVisible
              ? theme.colors.onPrimary
              : theme.colors.onSurfaceVariant
          }
          buttonColor={filtersVisible ? theme.colors.primary : undefined}
        >
          {filtersVisible
            ? "Hide Filters"
            : `Show Filters ${totalActiveFilters > 0 ? `(${totalActiveFilters})` : ""}`}
        </Button>
      </View>

      {filtersVisible && (
        <ScrollView
          style={styles.filterScrollContainer}
          keyboardShouldPersistTaps="handled" // Keep keyboard open/closed as needed
        >
          <Card
            style={[
              styles.filterPanelCard,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
            elevation={2} // Subtle elevation for the filter panel
          >
            <Card.Content>
              <Text
                variant="titleMedium"
                style={[
                  styles.filterTitle,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Filter by:
              </Text>
              <Divider style={styles.divider} />
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
                  right={(props) => (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {/* Optional: Show active filter count badge here */}
                      {filters[field].length > 0 && (
                        <View
                          style={[
                            styles.filterAccordionBadge,
                            { backgroundColor: theme.colors.primary },
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterAccordionBadgeText,
                              { color: theme.colors.onPrimary },
                            ]}
                          >
                            {filters[field].length}
                          </Text>
                        </View>
                      )}
                      <List.Icon
                        {...props}
                        icon={
                          expandedAccordions.includes(field)
                            ? "minus-circle-outline"
                            : "plus-circle-outline"
                        }
                        color={theme.colors.onSurfaceVariant}
                      />
                    </View>
                  )}
                >
                  <Divider style={styles.divider} />
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
                      position="leading" // Place checkbox on the left
                    />
                  ))}
                </List.Accordion>
              ))}
              <Button
                onPress={clearAllFilters}
                style={styles.clearButton}
                mode="outlined" // Use outlined for clear button
                icon="filter-off-outline"
                disabled={totalActiveFilters === 0}
                textColor={theme.colors.error}
                buttonColor={theme.colors.errorContainer} // Subtle background for error button
              >
                Clear All Filters
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      )}

      {/* Results List */}
      {!filtersVisible && (
        <FlatList
          data={filteredTechniques}
          renderItem={renderTechniqueItem}
          keyExtractor={(item) => item.Name}
          contentContainerStyle={styles.listContentContainer}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={renderEmptyComponent()} // Use the centralized empty component renderer
          // Performance Props for FlatList
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterScrollContainer: {
    paddingHorizontal: 16,
    maxHeight: "50%", // Increased max height for filters
    marginBottom: 16, // Add space below filters
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
  },
  card: {
    marginBottom: 12, // Slightly reduced card margin
    borderRadius: 8, // Added border radius
  },
  searchCard: {
    marginBottom: 8,
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
    height: 40, // Fixed height for dense input
  },
  countBadge: {
    marginLeft: 12,
    paddingHorizontal: 8, // Reduced horizontal padding
    paddingVertical: 6, // Reduced vertical padding
    borderRadius: 16,
    minWidth: 30, // Reduced min width
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 12, // Reduced font size
    fontWeight: "bold",
  },
  filterToggleButton: {
    marginBottom: 8,
    paddingVertical: 4,
    borderRadius: 8, // Added border radius
  },
  filterPanelCard: {
    marginBottom: 0, // No bottom margin inside scrollview
  },
  filterTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 8,
  },
  accordion: {
    marginBottom: 6, // Reduced accordion margin
    borderRadius: 6, // Added border radius
    borderWidth: StyleSheet.hairlineWidth, // Subtle border
    borderColor: "rgba(0,0,0,0.08)", // Light border color
  },
  filterAccordionBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterAccordionBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  checkboxItem: {
    paddingVertical: 2, // Reduced vertical padding
    paddingHorizontal: 4, // Reduced horizontal padding
  },
  clearButton: {
    marginTop: 16,
    alignSelf: "stretch", // Make clear button full width
    borderRadius: 8,
  },
  resultItemCard: {
    marginBottom: 8, // Reduced margin between result items
    borderRadius: 8,
  },
  resultItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8, // Adjusted padding
    paddingHorizontal: 12,
  },
  itemLeft: {
    marginRight: 12,
  },
  itemRight: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 16, // Slightly reduced font size
    fontWeight: "600", // Slightly bolder
  },
  itemDescription: {
    fontSize: 12, // Slightly reduced font size
    opacity: 0.9, // Slightly less opacity
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 20,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  emptySubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    color: "rgba(0,0,0,0.6)", // Subtle color
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
});
