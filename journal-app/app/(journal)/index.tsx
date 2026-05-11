/**
 * Home Screen
 * Main journal feed showing all entries grouped by month
 * Uses SectionList for efficient rendering with real-time Firestore data
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  Pressable,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { useJournal } from '../../context/JournalContext';
import { Entry, EntrySection } from '../../types/entry';
import { EntryCard } from '../../components/entry/EntryCard';
import { EmptyState } from '../../components/ui/EmptyState';

/**
 * Home screen component
 */
export default function HomeScreen() {
  const { sections, isLoading, error, removeEntry } = useJournal();
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  /**
   * Get item layout for performance optimization
   * Approximate item height for better scrolling performance
   */
  const getItemLayout = useCallback(
    (_data: EntrySection[] | null, index: number) => ({
      length: 120, // Approximate height of EntryCard
      offset: 120 * index,
      index,
    }),
    []
  );

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
