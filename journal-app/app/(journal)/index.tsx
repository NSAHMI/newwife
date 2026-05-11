/**
 * Home Screen
 * Main journal feed showing all entries grouped by month
 * Uses SectionList for efficient rendering
 */

import { View, Text, StyleSheet, SectionList, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

/**
 * Placeholder entry data for Phase 1
 * Will be replaced with Firestore data in Phase 3
 */
const PLACEHOLDER_SECTIONS = [
  {
    title: 'May 2026',
    monthKey: '2026-05',
    data: [
      {
        id: '1',
        title: 'A Beautiful Morning',
        body: 'Today started with the most incredible sunrise. The colors painted across the sky reminded me of why I love early mornings...',
        mood: 'happy' as const,
        dateKey: '2026-05-11',
        wordCount: 150,
      },
      {
        id: '2',
        title: 'Reflections on Growth',
        body: 'Looking back at the past few months, I can see how much I have changed. It is amazing how small steps lead to big transformations...',
        mood: 'grateful' as const,
        dateKey: '2026-05-10',
        wordCount: 200,
      },
    ],
  },
];

/**
 * Mood emoji mapping
 */
const MOOD_EMOJI: Record<string, string> = {
  happy: '😊',
  calm: '😌',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  grateful: '🙏',
};

/**
 * Home screen component
 */
export default function HomeScreen() {
  /**
   * Navigate to new entry screen
   */
  const handleNewEntry = () => {
    router.push('/(journal)/new-entry');
  };

  /**
   * Navigate to entry detail
   */
  const handleEntryPress = (id: string) => {
    router.push(`/(journal)/entry/${id}`);
  };

  /**
   * Render individual entry card
   */
  const renderEntry = ({ item }: { item: typeof PLACEHOLDER_SECTIONS[0]['data'][0] }) => (
    <Pressable
      style={({ pressed }) => [styles.entryCard, pressed && styles.entryCardPressed]}
      onPress={() => handleEntryPress(item.id)}
    >
      <View style={styles.entryMoodStrip} />
      <View style={styles.entryContent}>
        <View style={styles.entryHeader}>
          <Text style={styles.moodEmoji}>{MOOD_EMOJI[item.mood]}</Text>
          <Text style={styles.entryTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.entryBody} numberOfLines={2}>
          {item.body}
        </Text>
        <View style={styles.entryFooter}>
          <Text style={styles.entryDate}>{item.dateKey}</Text>
          <Text style={styles.entryWordCount}>{item.wordCount} words</Text>
        </View>
      </View>
    </Pressable>
  );

  /**
   * Render section header (month)
   */
  const renderSectionHeader = ({ section }: { section: typeof PLACEHOLDER_SECTIONS[0] }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  );

  /**
   * Render empty state when no entries exist
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={80} color={COLORS.border} />
      <Text style={styles.emptyTitle}>Your journal is empty</Text>
      <Text style={styles.emptySubtitle}>
        Start writing your first entry to capture your thoughts and memories.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
        onPress={handleNewEntry}
      >
        <Text style={styles.emptyButtonText}>Write Today's Entry</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={PLACEHOLDER_SECTIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        renderSectionHeader={renderSectionHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleNewEntry}
      >
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 100, // Space for FAB
  },
  sectionHeader: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  entryCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  entryCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  entryMoodStrip: {
    width: 4,
    backgroundColor: COLORS.accent,
  },
  entryContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.sm,
  },
  entryTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  entryBody: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  entryWordCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxxl,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyButtonPressed: {
    opacity: 0.9,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xxl,
    right: SPACING.xxl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
