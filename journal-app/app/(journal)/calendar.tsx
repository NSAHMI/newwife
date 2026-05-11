/**
 * Calendar Screen
 * Month calendar view with entry markers
 * Tap a date to see entries for that day
 */

import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';

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
 * Placeholder marked dates for Phase 1
 * Will be replaced with actual data in Phase 7
 */
const PLACEHOLDER_MARKED_DATES: Record<string, MarkedDateInfo> = {
  '2026-05-11': { marked: true, dotColor: COLORS.accent },
  '2026-05-10': { marked: true, dotColor: COLORS.accent },
  '2026-05-08': { marked: true, dotColor: COLORS.accent },
  '2026-05-05': { marked: true, dotColor: COLORS.accent },
};

/**
 * Placeholder entries for Phase 1
 */
const PLACEHOLDER_ENTRIES = [
  {
    id: '1',
    title: 'A Beautiful Morning',
    mood: 'happy',
    dateKey: '2026-05-11',
  },
  {
    id: '2',
    title: 'Reflections on Growth',
    mood: 'grateful',
    dateKey: '2026-05-10',
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
 * Calendar screen component
 */
export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  /**
   * Get entries for the selected date
   */
  const getEntriesForDate = (dateKey: string) => {
    return PLACEHOLDER_ENTRIES.filter((entry) => entry.dateKey === dateKey);
  };

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
  const getMarkedDates = () => {
    const marked = { ...PLACEHOLDER_MARKED_DATES };
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: COLORS.accent,
      };
    }
    return marked;
  };

  const entriesForSelectedDate = selectedDate ? getEntriesForDate(selectedDate) : [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar Component */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            markedDates={getMarkedDates()}
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

        {/* Entries for Selected Date */}
        <View style={styles.entriesContainer}>
          {!selectedDate ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>Select a date to view entries</Text>
            </View>
          ) : entriesForSelectedDate.length === 0 ? (
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
                Entries for {selectedDate}
              </Text>
              {entriesForSelectedDate.map((entry) => (
                <Pressable
                  key={entry.id}
                  style={({ pressed }) => [
                    styles.entryCard,
                    pressed && styles.entryCardPressed,
                  ]}
                  onPress={() => handleEntryPress(entry.id)}
                >
                  <Text style={styles.moodEmoji}>{MOOD_EMOJI[entry.mood]}</Text>
                  <Text style={styles.entryTitle} numberOfLines={1}>
                    {entry.title}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </Pressable>
              ))}
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
  calendarContainer: {
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  calendar: {
    borderRadius: BORDER_RADIUS.lg,
  },
  entriesContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  entriesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  entryCardPressed: {
    opacity: 0.9,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.md,
  },
  entryTitle: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.textPrimary,
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
