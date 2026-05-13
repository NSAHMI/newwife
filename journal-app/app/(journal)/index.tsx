/**
 * Home Screen
 * Main journal feed showing all entries grouped by month
 * Uses SectionList for efficient rendering with real-time Firestore data
 * Enhanced with search, mood insights, and improved UI
 */

import { useState, useCallback, useMemo, useRef } from 'react';
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
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';
import { useJournal } from '../../context/JournalContext';
import { Entry, EntrySection, Mood } from '../../types/entry';
import { EntryCard } from '../../components/entry/EntryCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { MoodInsights } from '../../components/entry/MoodInsights';
import { getGreeting } from '../../utils/dateUtils';

/**
 * Home screen component
 */
export default function HomeScreen() {
  const { entries, sections, isLoading, error, removeEntry } = useJournal();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  /**
   * Filter entries based on search query
   */
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.body.toLowerCase().includes(query) ||
        entry.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [entries, searchQuery]);

  /**
   * Create sections from filtered entries
   */
  const filteredSections = useMemo((): EntrySection[] => {
    if (!searchQuery.trim()) return sections;

    // Group filtered entries by month
    const grouped: Record<string, { title: string; monthKey: string; data: Entry[] }> = {};
    filteredEntries.forEach((entry) => {
      const date = entry.createdAt instanceof Date ? entry.createdAt : entry.createdAt.toDate();
      const title = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = { title, monthKey, data: [] };
      }
      grouped[monthKey].data.push(entry);
    });

    return Object.values(grouped).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filteredEntries, sections, searchQuery]);

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
  const greeting = getGreeting();

  /**
   * Toggle search visibility
   */
  const toggleSearch = useCallback(() => {
    setIsSearchVisible((prev) => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery('');
      }
      return !prev;
    });
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
        {/* Search Bar (when visible) */}
        {isSearchVisible && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={18} color={COLORS.textTertiary} />
              <TextInput
                ref={searchInputRef}
                style={styles.searchInput}
                placeholder="Search entries..."
                placeholderTextColor={COLORS.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={toggleSearch} style={styles.cancelSearch}>
              <Text style={styles.cancelSearchText}>Cancel</Text>
            </Pressable>
          </View>
        )}

        {/* Search results count */}
        {searchQuery.length > 0 && (
          <View style={styles.searchResultsHeader}>
            <Text style={styles.searchResultsText}>
              {filteredEntries.length} {filteredEntries.length === 1 ? 'result' : 'results'} for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Welcome Card (hidden when searching) */}
        {!searchQuery && (
          <LinearGradient
            colors={[COLORS.primary, COLORS.gradientMiddle, COLORS.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}
          >
            <View style={styles.welcomeHeader}>
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeGreeting}>{greeting}</Text>
                <Text style={styles.welcomeSubtitle}>
                  You have {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                </Text>
              </View>
              {/* Search toggle */}
              {!isSearchVisible && (
                <Pressable
                  onPress={toggleSearch}
                  style={styles.searchToggle}
                  accessibilityLabel="Search entries"
                  accessibilityRole="button"
                >
                  <Ionicons name="search" size={20} color={COLORS.surface} />
                </Pressable>
              )}
            </View>
            {dominantMood && (
              <View style={styles.moodBadge}>
                <Text style={styles.moodEmoji}>{MOOD_CONFIG[dominantMood].emoji}</Text>
                <Text style={styles.moodLabel}>Mostly {MOOD_CONFIG[dominantMood].label.toLowerCase()}</Text>
              </View>
            )}
          </LinearGradient>
        )}

        {/* Mood Insights Component */}
        {!searchQuery && (
          <MoodInsights
            entries={entries}
            expanded={showInsights}
            onToggleExpand={() => setShowInsights(!showInsights)}
          />
        )}
      </View>
    );
  }, [entries, dominantMood, greeting, isSearchVisible, searchQuery, filteredEntries.length, toggleSearch, showInsights]);

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
        sections={filteredSections}
        keyExtractor={keyExtractor}
        renderItem={renderEntry}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent,
          filteredSections.length === 0 && styles.emptyListContent,
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
        accessibilityLabel="Create new entry"
        accessibilityRole="button"
      >
        <LinearGradient
          colors={[COLORS.accent, COLORS.accentDark]}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color={COLORS.surface} />
        </LinearGradient>
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
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  cancelSearch: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  cancelSearchText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: '500',
  },
  searchResultsHeader: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.md,
  },
  searchResultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Welcome card styles
  welcomeCard: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeContent: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  welcomeGreeting: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.surface,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
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
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.95 }],
  },
});
