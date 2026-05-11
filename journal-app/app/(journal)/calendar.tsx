/**
 * Calendar Screen
 * Month calendar view with entry markers
 * Tap a date to see entries for that day
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';
import { useJournal } from '../../context/JournalContext';
import { Entry, Mood } from '../../types/entry';

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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /**
   * Entrance animation
   */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  /**
   * Get entries for the selected date
   */
  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return entries.filter((entry) => entry.dateKey === selectedDate);
  }, [selectedDate, entries]);

  /**
   * Calculate current streak
   */
  const currentStreak = useMemo(() => {
    const sortedDates = Object.keys(markedDates).sort().reverse();
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (markedDates[dateKey]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today doesn't have an entry yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [markedDates]);

  /**
   * Calculate mood distribution for the month
   */
  const moodDistribution = useMemo(() => {
    const distribution: Record<Mood, number> = {
      happy: 0,
      calm: 0,
      sad: 0,
      angry: 0,
      anxious: 0,
      grateful: 0,
    };
    entries.forEach((entry) => {
      distribution[entry.mood]++;
    });
    return distribution;
  }, [entries]);

  /**
   * Get the dominant mood
   */
  const dominantMood = useMemo(() => {
    let maxCount = 0;
    let dominant: Mood = 'calm';
    (Object.keys(moodDistribution) as Mood[]).forEach((mood) => {
      if (moodDistribution[mood] > maxCount) {
        maxCount = moodDistribution[mood];
        dominant = mood;
      }
    });
    return maxCount > 0 ? dominant : null;
  }, [moodDistribution]);

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
    const date = new Date(selectedDate + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

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
      <Animated.ScrollView
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statsHeader}
        >
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame" size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="document-text" size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{entries.length}</Text>
              <Text style={styles.statLabel}>Total Entries</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                {dominantMood ? (
                  <Text style={styles.moodStatEmoji}>{MOOD_CONFIG[dominantMood].emoji}</Text>
                ) : (
                  <Ionicons name="happy" size={24} color={COLORS.success} />
                )}
              </View>
              <Text style={styles.statValue}>
                {dominantMood ? MOOD_CONFIG[dominantMood].label : '-'}
              </Text>
              <Text style={styles.statLabel}>Top Mood</Text>
            </View>
          </View>
        </LinearGradient>

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
              textMonthFontWeight: '700',
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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={40} color={COLORS.accent} />
              </View>
              <Text style={styles.emptyTitle}>Select a Date</Text>
              <Text style={styles.emptyText}>
                Tap on any date to view entries written that day
              </Text>
            </View>
          ) : entriesForSelectedDate.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="create-outline" size={40} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Entries</Text>
              <Text style={styles.emptyText}>{formattedSelectedDate}</Text>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
                onPress={handleNewEntry}
              >
                <Ionicons name="add" size={20} color={COLORS.surface} />
                <Text style={styles.addButtonText}>Write an Entry</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.entriesHeader}>
                <Text style={styles.entriesTitle}>{formattedSelectedDate}</Text>
                <View style={styles.entriesCount}>
                  <Text style={styles.entriesCountText}>
                    {entriesForSelectedDate.length} {entriesForSelectedDate.length === 1 ? 'entry' : 'entries'}
                  </Text>
                </View>
              </View>
              {entriesForSelectedDate.map((entry: Entry, index: number) => {
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
                    <View style={[styles.entryMoodStrip, { backgroundColor: moodConfig.color }]} />
                    <View style={[styles.moodIndicator, { backgroundColor: `${moodConfig.color}15` }]}>
                      <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                    </View>
                    <View style={styles.entryContent}>
                      <Text style={styles.entryTitle} numberOfLines={1}>
                        {entry.title}
                      </Text>
                      <Text style={styles.entryPreview} numberOfLines={1}>
                        {entry.body}
                      </Text>
                      <View style={styles.entryMeta}>
                        <Text style={styles.entryWordCount}>{entry.wordCount} words</Text>
                        {entry.imageUrl && (
                          <Ionicons name="image-outline" size={12} color={COLORS.textSecondary} />
                        )}
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
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
  statsHeader: {
    margin: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moodStatEmoji: {
    fontSize: FONT_SIZES.xl,
  },
  statValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.surface,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  calendarContainer: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  calendar: {
    borderRadius: BORDER_RADIUS.lg,
    paddingBottom: SPACING.md,
  },
  entriesContainer: {
    padding: SPACING.lg,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  entriesTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  entriesCount: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    ...SHADOWS.sm,
  },
  entriesCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  entryCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  entryMoodStrip: {
    width: 4,
    alignSelf: 'stretch',
  },
  moodIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.md,
    marginRight: SPACING.sm,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.md,
  },
  entryContent: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  entryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  entryPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  entryWordCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxxxl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
    ...SHADOWS.sm,
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
