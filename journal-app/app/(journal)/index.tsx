/**
 * Home Screen
 * Main journal feed showing all entries grouped by month
 * Uses SectionList for efficient rendering with real-time Firestore data
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';
import { useJournal } from '../../context/JournalContext';
import { Entry, EntrySection, Mood } from '../../types/entry';
import { EntryCard } from '../../components/entry/EntryCard';
import { EmptyState } from '../../components/ui/EmptyState';

/**
 * Home screen component
 */
export default function HomeScreen() {
  const { entries, sections, isLoading, error, removeEntry } = useJournal();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Calculate mood distribution for stats
   */
  const moodStats = useMemo(() => {
    const stats: Record<Mood, number> = {
      happy: 0,
      calm: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      grateful: 0,
    };
    entries.forEach((entry) => {
      stats[entry.mood] = (stats[entry.mood] || 0) + 1;
    });
    return stats;
  }, [entries]);

  /**
   * Get the most common mood
   */
  const dominantMood = useMemo(() => {
    let maxCount = 0;
    let dominant: Mood = 'calm';
    (Object.keys(moodStats) as Mood[]).forEach((mood) => {
      if (moodStats[mood] > maxCount) {
        maxCount = moodStats[mood];
        dominant = mood;
      }
    });
    return maxCount > 0 ? dominant : null;
  }, [moodStats]);

  /**
   * Get greeting based on time of day
   */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  /**
   * Navigate to new entry screen
   */
  const handleNewEntry = () => {
    router.push('/(journal)/new-entry');
  };

  /**
   * Handle entry deletion
   */
  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      try {
        await removeEntry(entryId);
      } catch (err) {
        console.error('Failed to delete entry:', err);
      }
    },
    [removeEntry]
  );

  /**
   * Handle pull-to-refresh
   * The JournalContext auto-refreshes via Firestore listener,
   * but this provides visual feedback to the user
   */
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate a brief refresh delay for UX
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  /**
   * Render individual entry card
   */
  const renderEntry = useCallback(
    ({ item }: { item: Entry }) => (
      <EntryCard entry={item} onDelete={handleDeleteEntry} />
    ),
    [handleDeleteEntry]
  );

  /**
   * Render section header (month)
   */
  const renderSectionHeader = useCallback(
    ({ section }: { section: EntrySection }) => (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionCount}>
          {section.data.length} {section.data.length === 1 ? 'entry' : 'entries'}
        </Text>
      </View>
    ),
    []
  );

  /**
   * Render header component with stats
   */
  const renderHeader = useCallback(() => {
    if (entries.length === 0) return null;

    return (
      <View style={styles.headerContainer}>
        {/* Welcome Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeGreeting}>{greeting}</Text>
            <Text style={styles.welcomeSubtitle}>
              You have {entries.length} {entries.length === 1 ? 'entry' : 'entries'} in your journal
            </Text>
          </View>
          {dominantMood && (
            <View style={styles.moodBadge}>
              <Text style={styles.moodEmoji}>{MOOD_CONFIG[dominantMood].emoji}</Text>
              <Text style={styles.moodLabel}>Mostly {MOOD_CONFIG[dominantMood].label.toLowerCase()}</Text>
            </View>
          )}
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {(Object.keys(moodStats) as Mood[])
            .filter((mood) => moodStats[mood] > 0)
            .slice(0, 4)
            .map((mood) => (
              <View key={mood} style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: `${MOOD_CONFIG[mood].color}20` }]}>
                  <Text style={styles.statEmoji}>{MOOD_CONFIG[mood].emoji}</Text>
                </View>
                <Text style={styles.statCount}>{moodStats[mood]}</Text>
              </View>
            ))}
        </View>
      </View>
    );
  }, [entries.length, dominantMood, moodStats, greeting]);

  /**
   * Render empty state when no entries exist
   */
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading your journal...</Text>
        </View>
      );
    }

    return (
      <EmptyState
        icon="book-outline"
        title="Your journal is empty"
        subtitle="Start writing your first entry to capture your thoughts and memories."
        buttonText="Write Today's Entry"
        onButtonPress={handleNewEntry}
      />
    );
  }, [isLoading, handleNewEntry]);

  /**
   * Key extractor for SectionList
   */
  const keyExtractor = useCallback((item: Entry) => item.id, []);

  // Show error state if there's an error
  if (error && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          icon="alert-circle-outline"
          title="Something went wrong"
          subtitle={error}
          buttonText="Try Again"
          onButtonPress={handleRefresh}
          iconColor={COLORS.error}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderEntry}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 && styles.emptyListContent,
        ]}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
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
  emptyListContent: {
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: SPACING.md,
  },
  welcomeCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  welcomeContent: {
    marginBottom: SPACING.md,
  },
  welcomeGreeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  moodLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.surface,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statEmoji: {
    fontSize: FONT_SIZES.md,
  },
  statCount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxxxl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
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
