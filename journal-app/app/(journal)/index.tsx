import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournal } from '../../context/JournalContext';
import { EntryCard } from '../../components/entry/EntryCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Entry } from '../../types/entry';
import { COLORS, SPACING, FONTS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { sections, isLoading, removeEntry } = useJournal();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteEntry, setDeleteEntry] = useState<Entry | null>(null);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleDelete = async () => {
    if (deleteEntry) {
      await removeEntry(deleteEntry.id);
      setDeleteEntry(null);
    }
  };

  if (isLoading && !refreshing) {
    return <LoadingOverlay message="Loading entries..." />;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Ionicons name="book" size={24} color={COLORS.accent} />
        <Ionicons
          name="settings-outline"
          size={24}
          color={COLORS.textPrimary}
          onPress={() => router.push('/(journal)/settings')}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EntryCard entry={item} onDelete={setDeleteEntry} />
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionTitleContainer, { backgroundColor: COLORS.accent + '15' }]}>
              <Ionicons name="calendar" size={14} color={COLORS.accent} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            actionLabel="Write Today's Entry"
            onAction={() => router.push('/(journal)/new-entry')}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
          />
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={
          sections.length === 0 ? styles.emptyList : styles.list
        }
      />

      <TouchableOpacity
        style={[styles.fab, { bottom: 100 + insets.bottom }]}
        onPress={() => router.push('/(journal)/new-entry')}
        activeOpacity={0.8}
      >
        <Ionicons name="create" size={28} color={COLORS.surface} />
      </TouchableOpacity>

      <ConfirmModal
        visible={!!deleteEntry}
        title="Delete Entry"
        message={`Are you sure you want to delete "${deleteEntry?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteEntry(null)}
        destructive
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  list: {
    paddingTop: SPACING.lg,
    paddingBottom: 120,
  },
  emptyList: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
    color: COLORS.accent,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
