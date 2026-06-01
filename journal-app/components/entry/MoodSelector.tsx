import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Mood, MOOD_COLORS } from '../../types/entry';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

interface MoodSelectorProps {
  selected: Mood | null;
  onSelect: (mood: Mood) => void;
}

const MOODS: Mood[] = ['happy', 'calm', 'sad', 'angry', 'anxious', 'grateful'];

export function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {MOODS.map((mood) => {
          const config = MOOD_COLORS[mood];
          const isSelected = selected === mood;
          return (
            <TouchableOpacity
              key={mood}
              style={[
                styles.pill,
                isSelected && { backgroundColor: config.color, borderColor: config.color },
              ]}
              onPress={() => onSelect(mood)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{config.emoji}</Text>
              <Text
                style={[styles.pillText, isSelected && styles.pillTextSelected]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  scroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    gap: SPACING.xs,
  },
  emoji: {
    fontSize: 18,
  },
  pillText: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    color: COLORS.textPrimary,
  },
  pillTextSelected: {
    color: COLORS.surface,
  },
});
