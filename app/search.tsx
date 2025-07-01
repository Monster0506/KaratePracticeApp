import { ModernButton } from "@/components/ui/ModernButton";
import { ModernCard } from "@/components/ui/ModernCard";
import { ModernHeader } from "@/components/ui/ModernHeader";
import { BeltColors, BeltTextColors, getBeltColor } from '@/constants/Colors';
import { useTechniques } from "@/context/TechniquesProvider";
import { useRouter } from "expo-router";
import Fuse from "fuse.js";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  StyleSheet,
  UIManager,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Chip,
  IconButton,
  List,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";
import { useDebounce } from "use-debounce";

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
        let values = Array.from(
          new Set(techniques.map((t) => t[field]).filter(Boolean)),
        );
        if (field === 'Belt') {
          // Sort belts by beltNumber
          const beltOrder: Record<string, number> = {};
          techniques.forEach((t) => (beltOrder[t.Belt] = t.beltNumber));
          values = values.sort((a, b) => (beltOrder[a] ?? 0) - (beltOrder[b] ?? 0));
        } else {
          values = values.sort();
        }
        allValues[field] = values;
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
      <ModernCard
        variant="elevated"
        padding="medium"
        style={styles.resultItemCard}
      >
        <List.Item
          title={item.Name}
          description={`${item.Belt} ${item.Attack ? `| ${item.Attack}` : ""}`}
          titleStyle={[styles.itemTitle, { color: theme.colors.onSurface }]}
          descriptionStyle={[styles.itemDescription, { color: theme.colors.onSurfaceVariant }]}
          left={(props) => (
            <List.Icon
              {...props}
              icon="karate"
              color={theme.colors.primary}
            />
          )}
          right={(props) => (
            <IconButton
              {...props}
              icon="chevron-right"
              size={20}
              iconColor={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() =>
            router.push(`/technique/${encodeURIComponent(item.Name)}`)
          }
        />
      </ModernCard>
    ),
    [router, theme],
  );

  const renderEmptyComponent = () => {
    if (isProcessing) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            Searching...
          </Text>
        </View>
      );
    }

    if (debouncedQuery.trim() || totalActiveFilters > 0) {
      return (
        <View style={styles.emptyContainer}>
          <IconButton
            icon="magnify-close"
            size={48}
            iconColor={theme.colors.outline}
          />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No techniques found
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
            Try adjusting your search or filters
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <IconButton
          icon="magnify"
          size={48}
          iconColor={theme.colors.outline}
        />
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          Search for techniques
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
          Enter a technique name or use filters
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ModernHeader
        title="Search Techniques"
        subtitle={`${filteredTechniques.length} results`}
        showBack
        rightAction={{
          icon: filtersVisible ? "filter-off" : "filter-variant",
          onPress: toggleFiltersVisibility,
        }}
      />

      <View style={styles.content}>
        <ModernCard variant="elevated" padding="medium" style={styles.searchCard}>
          <TextInput
            mode="outlined"
            placeholder="Search techniques..."
            value={query}
            onChangeText={setQuery}
            left={<TextInput.Icon icon="magnify" />}
            right={
              query.length > 0 ? (
                <TextInput.Icon icon="close" onPress={() => setQuery("")} />
              ) : undefined
            }
            style={styles.searchInput}
          />
        </ModernCard>

        {filtersVisible && (
          <ModernCard variant="elevated" padding="large" style={styles.filtersCard}>
            <View style={styles.filtersHeader}>
              <Text variant="titleMedium" style={styles.filtersTitle}>
                Filters
              </Text>
              {totalActiveFilters > 0 && (
                <ModernButton
                  mode="text"
                  onPress={clearAllFilters}
                  compact
                  style={styles.clearButton}
                >
                  Clear All
                </ModernButton>
              )}
            </View>

            {FILTER_FIELDS.map((field) => (
              <View key={field} style={styles.filterSection}>
                <List.Accordion
                  title={field}
                  description={`${filters[field].length}/${uniqueFilterValues[field].length}`}
                  left={(props) => <List.Icon {...props} icon="filter-variant" />}
                  expanded={expandedAccordions.includes(field)}
                  onPress={() => toggleAccordion(field)}
                  style={styles.accordion}
                >
                  <View style={styles.filterOptions}>
                    {uniqueFilterValues[field].map((value) => {
                      if (field === 'Belt') {
                        const beltKey = getBeltColor(value);
                        const beltColor = BeltColors[beltKey]?.light || '#eee';
                        const textColor = BeltTextColors[beltKey] || '#000';
                        return (
                          <Chip
                            key={value}
                            selected={filters[field].includes(value)}
                            onPress={() => toggleFilterOption(field, value)}
                            style={[styles.filterChip, { backgroundColor: beltColor }]}
                            textStyle={[styles.filterChipText, { color: textColor }]}
                          >
                            {value}
                          </Chip>
                        );
                      }
                      return (
                        <Chip
                          key={value}
                          selected={filters[field].includes(value)}
                          onPress={() => toggleFilterOption(field, value)}
                          style={styles.filterChip}
                          textStyle={styles.filterChipText}
                        >
                          {value}
                        </Chip>
                      );
                    })}
                  </View>
                </List.Accordion>
              </View>
            ))}
          </ModernCard>
        )}

        <FlatList
          data={filteredTechniques}
          renderItem={renderTechniqueItem}
          keyExtractor={(item) => item.Name}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 16,
  },
  searchCard: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: 'transparent',
  },
  filtersCard: {
    marginBottom: 8,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontWeight: '600',
  },
  clearButton: {
    marginLeft: 8,
  },
  filterSection: {
    marginBottom: 8,
  },
  accordion: {
    backgroundColor: 'transparent',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterChip: {
    marginBottom: 4,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContainer: {
    gap: 12,
  },
  resultItemCard: {
    marginBottom: 8,
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  itemDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
});
