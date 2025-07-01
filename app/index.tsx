import { ModernButton } from "@/components/ui/ModernButton";
import { ModernHeader } from "@/components/ui/ModernHeader";
import { getBeltColor } from "@/constants/Colors";
import { useTechniques } from "@/context/TechniquesProvider";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import PagerView from "react-native-pager-view";
import {
  IconButton,
  SegmentedButtons,
  Text,
  useTheme
} from "react-native-paper";

const { width } = Dimensions.get('window');

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

  const quickActions = [
    {
      title: "Random Practice",
      subtitle: "Practice random techniques",
      icon: "shuffle-variant",
      onPress: () => router.push("/random"),
      color: theme.colors.primary,
    },
    {
      title: "Flagged Techniques",
      subtitle: `${flagged.length} techniques flagged`,
      icon: "flag",
      onPress: () => {
        const list = techniques.filter((t) => flagged.includes(t.Name));
        setCurrentList(list);
        router.push("/technique");
      },
      color: theme.colors.secondary,
    },
  ];

  const toolsActions = [
    {
      title: "Search Techniques",
      subtitle: "Find specific techniques",
      icon: "magnify",
      onPress: () => router.push("/search"),
      color: theme.colors.primary,
    },
    {
      title: "Playlists",
      subtitle: "Create custom practice sets",
      icon: "playlist-edit",
      onPress: () => router.push("/playlists"),
      color: theme.colors.secondary,
    },
    {
      title: "Settings",
      subtitle: "App preferences & notifications",
      icon: "cog",
      onPress: () => router.push("/settings"),
      color: theme.colors.tertiary,
    },
  ];

  const progressActions = [
    {
      title: "Practice History",
      subtitle: "View your practice sessions",
      icon: "history",
      onPress: () => router.push("/practice"),
      color: theme.colors.primary,
    },
    {
      title: "Practice Stats",
      subtitle: "Track your progress",
      icon: "chart-line",
      onPress: () => router.push("/stats"),
      color: theme.colors.secondary,
    },
    {
      title: "Share Stats",
      subtitle: "Share your progress",
      icon: "share-variant",
      onPress: () => router.push("/share"),
      color: theme.colors.tertiary,
    },
    {
      title: "Scan QR Code",
      subtitle: "Import stats from others",
      icon: "qrcode-scan",
      onPress: () => router.push("/scan"),
      color: '#f59e0b',
    },
  ];

  const renderActionCard = (action: any) => (
    <TouchableOpacity
      key={action.title}
      onPress={action.onPress}
      activeOpacity={0.7}
      style={styles.actionCardWrapper}
    >
      <View style={styles.actionContent}>
        <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
          <IconButton
            icon={action.icon}
            size={24}
            iconColor={action.color}
            disabled
          />
        </View>
        <View style={styles.actionText}>
          <Text variant="titleMedium" style={styles.actionTitle}>
            {action.title}
          </Text>
          <Text variant="bodySmall" style={[styles.actionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {action.subtitle}
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={20}
          iconColor={theme.colors.onSurfaceVariant}
          disabled
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.wrapper, { backgroundColor: theme.colors.background }]}>
      <ModernHeader
        title="Karate Trainer"
        subtitle="Master your techniques"
        variant="large"
      />

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
        <ScrollView contentContainerStyle={styles.page} key="practice" showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Belt Index
            </Text>
            <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Select a belt to view techniques
            </Text>
            
            <View style={styles.beltContainer}>
              <View style={styles.beltColumn}>
                <Text variant="titleMedium" style={styles.columnTitle}>Kids</Text>
                <View style={styles.beltGrid}>
                  {kidBelts.map((belt) => (
                    <ModernButton
                      key={`kid-${belt}`}
                      mode="contained"
                      variant="belt"
                      beltColor={getBeltColor(belt)}
                      onPress={() => showBelt(belt, true)}
                      compact
                      style={styles.beltButton}
                    >
                      {belt}
                    </ModernButton>
                  ))}
                </View>
              </View>
              
              <View style={styles.beltColumn}>
                <Text variant="titleMedium" style={styles.columnTitle}>Adults</Text>
                <View style={styles.beltGrid}>
                  {adultBelts.map((belt) => (
                    <ModernButton
                      key={`adult-${belt}`}
                      mode="contained"
                      variant="belt"
                      beltColor={getBeltColor(belt)}
                      onPress={() => showBelt(belt, false)}
                      compact
                      style={styles.beltButton}
                    >
                      {belt}
                    </ModernButton>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Start practicing right away
            </Text>
            
            {quickActions.map(renderActionCard)}
          </View>
        </ScrollView>

        {/* Tools Tab */}
        <ScrollView contentContainerStyle={styles.page} key="tools" showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Tools & Utilities
            </Text>
            <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Everything you need to enhance your training
            </Text>
            
            {toolsActions.map(renderActionCard)}
          </View>
        </ScrollView>

        {/* Progress Tab */}
        <ScrollView contentContainerStyle={styles.page} key="progress" showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text variant="headlineSmall" style={styles.sectionTitle}>
              Progress & Analytics
            </Text>
            <Text variant="bodyMedium" style={[styles.sectionSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Track your journey and share your achievements
            </Text>
            
            {progressActions.map(renderActionCard)}
          </View>
        </ScrollView>
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  segmented: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  pager: {
    flex: 1,
  },
  page: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    marginBottom: 16,
    lineHeight: 20,
  },
  beltContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  beltColumn: {
    flex: 1,
  },
  columnTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  beltGrid: {
    gap: 6,
  },
  beltButton: {
    marginVertical: 0,
  },
  actionCardWrapper: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    borderRadius: 12,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  actionSubtitle: {
    lineHeight: 16,
  },
});
