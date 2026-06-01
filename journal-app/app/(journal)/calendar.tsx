import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useJournal } from '../../context/JournalContext';
import { EntryCard } from '../../components/entry/EntryCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toDateKey } from '../../utils/dateUtils';
import { getEntriesForDate } from '../../utils/sectionUtils';
import { Entry } from '../../types/entry';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { entries, markedDates } = useJournal();
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));

  const filteredEntries = getEntriesForDate(entries, selectedDate);

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            marked: markedDates[selectedDate]?.marked,
            selectedColor: COLORS.accent,
          },
        }}
        onDayPress={handleDayPress}
        theme={{
          backgroundColor: COLORS.surface,
          calendarBackground: COLORS.surface,
          textSectionTitleColor: COLORS.textSecondary,
          selectedDayBackgroundColor: COLORS.accent,
          selectedDayTextColor: COLORS.surface,
          todayTextColor: COLORS.accent,
          dayTextColor: COLORS.textPrimary,
          textDisabledColor: COLORS.textMuted,
          dotColor: COLORS.accent,
          selectedDotColor: COLORS.surface,
          arrowColor: COLORS.accent,
          monthTextColor: COLORS.textPrimary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />

      <View style={styles.content}>
        <Text style={styles.dateLabel}>
          {selectedDate === toDateKey(new Date())
            ? 'Today'
            : new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
        </Text>

        {filteredEntries.length > 0 ? (
          <FlatList
            data={filteredEntries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EntryCard entry={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="calendar-outline"
            title="No Entries"
            message={`No journal entries for this day.`}
            actionLabel="Write Entry"
            onAction={() => {}}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  content: {
    flex: 1,
  },
  dateLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  list: {
    paddingBottom: 100,
  },
});
