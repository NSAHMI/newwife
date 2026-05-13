/**
 * MoodInsights Component
 * Displays mood statistics and insights with visual analytics
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, MOOD_CONFIG } from '../../constants/theme';
import { Entry, Mood } from '../../types/entry';

/**
 * MoodInsights props
 */
interface MoodInsightsProps {
  /** Array of journal entries */
  entries: Entry[];
  /** Whether the component is expanded */
  expanded?: boolean;
  /** Toggle expanded state */
  onToggleExpand?: () => void;
}

/**
 * Individual mood bar in the distribution chart
 */
function MoodBar({
  mood,
  count,
  maxCount,
  index,
}: {
  mood: Mood;
  count: number;
  maxCount: number;
  index: number;
}) {
  const config = MOOD_CONFIG[mood];
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: percentage,
      duration: 800,
      delay: index * 100,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [percentage, widthAnim, index]);

  return (
    <View style={styles.moodBarContainer}>
      <View style={styles.moodBarLeft}>
        <Text style={styles.moodBarEmoji}>{config.emoji}</Text>
        <Text style={styles.moodBarLabel}>{config.label}</Text>
      </View>
      <View style={styles.moodBarTrack}>
        <Animated.View
          style={[
            styles.moodBarFill,
            {
              backgroundColor: config.color,
              width: widthAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <Text style={styles.moodBarCount}>{count}</Text>
    </View>
  );
}

/**
 * MoodInsights component
 * Shows mood distribution, streaks, and writing insights
 */
export function MoodInsights({ entries, expanded = false, onToggleExpand }: MoodInsightsProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  /**
   * Calculate mood distribution
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
      stats[entry.mood]++;
    });
    return stats;
  }, [entries]);

  /**
   * Get max mood count for bar scaling
   */
  const maxMoodCount = useMemo(() => {
    return Math.max(...Object.values(moodStats), 1);
  }, [moodStats]);

  /**
   * Get dominant mood
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
   * Calculate total words written
   */
  const totalWords = useMemo(() => {
    return entries.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
  }, [entries]);

  /**
   * Calculate average words per entry
   */
  const avgWords = useMemo(() => {
    return entries.length > 0 ? Math.round(totalWords / entries.length) : 0;
  }, [totalWords, entries.length]);

  /**
   * Calculate writing streak
   */
  const currentStreak = useMemo(() => {
    if (entries.length === 0) return 0;

    const dateKeys = new Set(entries.map((e) => e.dateKey));
    let streak = 0;
    const today = new Date();
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (dateKeys.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);

  /**
   * Get mood counts sorted by frequency
   */
  const sortedMoods = useMemo(() => {
    return (Object.keys(moodStats) as Mood[])
      .map((mood) => ({ mood, count: moodStats[mood] }))
      .sort((a, b) => b.count - a.count);
  }, [moodStats]);

  if (entries.length === 0) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable
        onPress={onToggleExpand}
        style={styles.headerPressable}
        accessibilityLabel="Toggle mood insights"
        accessibilityHint="Double tap to expand or collapse"
        accessibilityRole="button"
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="analytics-outline" size={18} color={COLORS.accent} />
            <Text style={styles.headerTitle}>Mood Insights</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.textSecondary}
          />
        </View>
      </Pressable>

      {/* Quick stats row - always visible */}
      <View style={styles.quickStats}>
        {/* Streak stat */}
        <View style={styles.quickStatItem}>
          <View style={[styles.quickStatIcon, { backgroundColor: `${COLORS.warning}15` }]}>
            <Ionicons name="flame" size={16} color={COLORS.warning} />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{currentStreak}</Text>
            <Text style={styles.quickStatLabel}>Day Streak</Text>
          </View>
        </View>

        {/* Total entries */}
        <View style={styles.quickStatItem}>
          <View style={[styles.quickStatIcon, { backgroundColor: `${COLORS.accent}15` }]}>
            <Ionicons name="document-text" size={16} color={COLORS.accent} />
          </View>
          <View>
            <Text style={styles.quickStatValue}>{entries.length}</Text>
            <Text style={styles.quickStatLabel}>Entries</Text>
          </View>
        </View>

        {/* Dominant mood */}
        {dominantMood && (
          <View style={styles.quickStatItem}>
            <View style={[styles.quickStatIcon, { backgroundColor: `${MOOD_CONFIG[dominantMood].color}15` }]}>
              <Text style={styles.quickStatEmoji}>{MOOD_CONFIG[dominantMood].emoji}</Text>
            </View>
            <View>
              <Text style={styles.quickStatValue}>{MOOD_CONFIG[dominantMood].label}</Text>
              <Text style={styles.quickStatLabel}>Top Mood</Text>
            </View>
          </View>
        )}
      </View>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Mood distribution chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>Mood Distribution</Text>
            <View style={styles.moodBars}>
              {sortedMoods.map((item, index) => (
                <MoodBar
                  key={item.mood}
                  mood={item.mood}
                  count={item.count}
                  maxCount={maxMoodCount}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* Writing stats */}
          <View style={styles.writingStats}>
            <Text style={styles.sectionTitle}>Writing Stats</Text>
            <View style={styles.writingStatsRow}>
              <View style={styles.writingStatItem}>
                <Text style={styles.writingStatValue}>{totalWords.toLocaleString()}</Text>
                <Text style={styles.writingStatLabel}>Total Words</Text>
              </View>
              <View style={styles.writingStatDivider} />
              <View style={styles.writingStatItem}>
                <Text style={styles.writingStatValue}>{avgWords}</Text>
                <Text style={styles.writingStatLabel}>Avg per Entry</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  headerPressable: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.md,
  },
  quickStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatEmoji: {
    fontSize: FONT_SIZES.md,
  },
  quickStatValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  expandedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: SPACING.lg,
  },
  chartSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  moodBars: {
    gap: SPACING.sm,
  },
  moodBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  moodBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: SPACING.xs,
  },
  moodBarEmoji: {
    fontSize: FONT_SIZES.sm,
  },
  moodBarLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  moodBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  moodBarCount: {
    width: 24,
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  writingStats: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  writingStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writingStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  writingStatValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  writingStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
  },
  writingStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
});

export default MoodInsights;
