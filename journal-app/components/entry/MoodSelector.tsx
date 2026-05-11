/**
 * MoodSelector Component
 * Horizontal scrollable row of mood options
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Mood, MOODS } from '../../types/entry';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';

/**
 * MoodSelector props
 */
interface MoodSelectorProps {
  /** Currently selected mood */
  selectedMood: Mood;
  /** Callback when a mood is selected */
  onMoodSelect: (mood: Mood) => void;
  /** Label text above the selector (optional) */
  label?: string;
}

/**
 * MoodSelector component
 * Displays a horizontal scrollable list of mood options with emoji and labels
 */
export function MoodSelector({
  selectedMood,
  onMoodSelect,
  label = 'How are you feeling?',
}: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOODS.map((mood) => {
          const config = MOOD_CONFIG[mood];
          const isSelected = selectedMood === mood;

          return (
            <Pressable
              key={mood}
              style={({ pressed }) => [
                styles.moodPill,
                isSelected && { backgroundColor: config.color },
                pressed && !isSelected && styles.moodPillPressed,
              ]}
              onPress={() => onMoodSelect(mood)}
            >
              <Text style={styles.moodEmoji}>{config.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && styles.moodLabelSelected,
                ]}
              >
                {config.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  moodPillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  moodEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  moodLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  moodLabelSelected: {
    color: COLORS.surface,
  },
});

export default MoodSelector;
