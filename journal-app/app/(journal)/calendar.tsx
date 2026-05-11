/**
 * Calendar Screen
 * Month calendar view with entry markers
 * Tap a date to see entries for that day
 */

import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';
import { useJournal } from '../../context/JournalContext';
import { formatShortDate } from '../../utils/dateUtils';
import { Entry } from '../../types/entry';

/**
 * Marked date type for react-native-calendars
 */
interface MarkedDateInfo {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
  selectedColor?: string;
}

/**
 * Calendar screen component
 */
export default function CalendarScreen() {
  const { entries, markedDates, isLoading } = useJournal();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /**
   * Get entries for the selected date
   */
  const getEntriesForDate = useMemo(() => {
    if (!selectedDate) return [];
    return entries.filter((entry) => entry.dateKey === selectedDate);
  }, [selectedDate, entries]);

  /**
   * Handle date selection
   */
  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  /**
   * Navigate to entry detail
   */
  const handleEntryPress = (id: string) => {
    router.push(`/(journal)/entry/${id}`);
  };

  /**
   * Navigate to new entry for selected date
   */
  const handleNewEntry = () => {
    router.push('/(journal)/new-entry');
  };

  /**
   * Get marked dates with selected date highlight
   */
  const getMarkedDatesWithSelection = useMemo(() => {
    const marked: Record<string, MarkedDateInfo> = { ...markedDates };
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: COLORS.accent,
      };
    }
    return marked;
  }, [markedDates, selectedDate]);

  /**
   * Format the selected date for display
   */
  const formattedSelectedDate = useMemo(() => {
    if (!selectedDate) return '';
    const date = new Date(selectedDate + 'T12:00:00'); // Add time to avoid timezone issues
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  /**
   * Get count of entries for each date for display
   */
  const getEntryCount = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((entry) => {
      counts[entry.dateKey] = (counts[entry.dateKey] || 0) + 1;
    });
    return counts;
  }, [entries]);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={getMarkedDatesWithSelection}
            theme={{
              backgroundColor: COLORS.surface,
              calendarBackground: COLORS.surface,
              textSectionTitleColor: COLORS.textSecondary,
              selectedDayBackgroundColor: COLORS.accent,
              selectedDayTextColor: COLORS.surface,
              todayTextColor: COLORS.accent,
              dayTextColor: COLORS.textPrimary,
              textDisabledColor: COLORS.border,
              dotColor: COLORS.accent,
              selectedDotColor: COLORS.surface,
              arrowColor: COLORS.accent,
              monthTextColor: COLORS.textPrimary,
              textDayFontWeight: '400',
              textMonthFontWeight: '600',
              textDayHeaderFontWeight: '500',
              textDayFontSize: FONT_SIZES.md,
              textMonthFontSize: FONT_SIZES.lg,
              textDayHeaderFontSize: FONT_SIZES.sm,
            }}
            style={styles.calendar}
          />
        </View>

        {/* Stats Banner */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{entries.length}</Text>
            <Text style={styles.statLabel}>Total Entries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Object.keys(getEntryCount).length}</Text>
            <Text style={styles.statLabel}>Days with Entries</Text>
          </View>
        </View>

        {/* Entries for Selected Date */}
        <View style={styles.entriesContainer}>
          {!selectedDate ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>Select a date to view entries</Text>
            </View>
          ) : getEntriesForDate.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No entries for this day</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={handleNewEntry}
              >
                <Text style={styles.addButtonText}>Write an Entry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.entriesTitle}>
                {formattedSelectedDate}
              </Text>
              <Text style={styles.entriesSubtitle}>
                {getEntriesForDate.length} {getEntriesForDate.length === 1 ? 'entry' : 'entries'}
              </Text>
              {getEntriesForDate.map((entry: Entry) => {
                const moodConfig = MOOD_CONFIG[entry.mood];
                return (
                  <Pressable
                    key={entry.id}
                    style={({ pressed }) => [
                      styles.entryCard,
                      pressed && styles.entryCardPressed,
                    ]}
                    onPress={() => handleEntryPress(entry.id)}
                  >
                    <View style={[styles.moodIndicator, { backgroundColor: moodConfig.color }]}>
                      <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                    </View>
                    <View style={styles.entryContent}>
                      <Text style={styles.entryTitle} numberOfLines={1}>
                        {entry.title}
                      </Text>
                      <Text style={styles.entryPreview} numberOfLines={1}>
                        {entry.body}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  calendarContainer: {
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  calendar: {
    borderRadius: BORDER_RADIUS.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.accent,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  entriesContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  entriesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  entriesSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  entryCardPressed: {
    opacity: 0.9,
  },
  moodIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  entryContent: {
    flex: 1,
  },
  entryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  entryPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxxxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
  },
  addButton: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonPressed: {
    opacity: 0.9,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
