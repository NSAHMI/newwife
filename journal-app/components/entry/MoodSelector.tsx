/**
 * MoodSelector Component
 * Horizontal scrollable row of mood options
 * Enhanced with animations and improved visual design
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from 'react-native';
import { Mood, MOODS } from '../../types/entry';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, ANIMATION } from '../../constants/theme';
import { MOOD_CONFIG } from '../../constants/theme';

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
  /** Size variant: 'default' | 'compact' */
  size?: 'default' | 'compact';
}

/**
 * Individual mood option with animation
 */
function MoodOption({
  mood,
  isSelected,
  onSelect,
  index,
  size,
}: {
  mood: Mood;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  size: 'default' | 'compact';
}) {
  const config = MOOD_CONFIG[mood];
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  // Entrance animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
      delay: index * 50,
    }).start();
  }, [scaleAnim, index]);

  // Selection bounce animation
  useEffect(() => {
    if (isSelected) {
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.15,
          duration: ANIMATION.fast,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    }
  }, [isSelected, bounceAnim]);

  const handlePress = () => {
    onSelect();
  };

  const isCompact = size === 'compact';

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }, { scale: isSelected ? bounceAnim : 1 }],
      }}
    >
      <Pressable
        style={({ pressed }) => [
          isCompact ? styles.moodPillCompact : styles.moodPill,
          isSelected && {
            backgroundColor: config.color,
            borderColor: config.color,
          },
          pressed && !isSelected && styles.moodPillPressed,
        ]}
        onPress={handlePress}
        accessibilityLabel={`${config.label} mood`}
        accessibilityState={{ selected: isSelected }}
        accessibilityRole="button"
      >
        <Text style={[
          isCompact ? styles.moodEmojiCompact : styles.moodEmoji,
          isSelected && styles.moodEmojiSelected,
        ]}>
          {config.emoji}
        </Text>
        <Text
          style={[
            isCompact ? styles.moodLabelCompact : styles.moodLabel,
            isSelected && styles.moodLabelSelected,
          ]}
        >
          {config.label}
        </Text>
        {isSelected && (
          <View style={styles.checkmarkContainer}>
            <View style={styles.checkmark} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/**
 * MoodSelector component
 * Displays a horizontal scrollable list of mood options with emoji and labels
 */
export function MoodSelector({
  selectedMood,
  onMoodSelect,
  label = 'How are you feeling?',
  size = 'default',
}: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.selectedMoodPreview}>
            <Text style={styles.selectedMoodEmoji}>
              {MOOD_CONFIG[selectedMood].emoji}
            </Text>
            <Text style={styles.selectedMoodText}>
              {MOOD_CONFIG[selectedMood].label}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={size === 'compact' ? 90 : 110}
      >
        {MOODS.map((mood, index) => (
          <MoodOption
            key={mood}
            mood={mood}
            isSelected={selectedMood === mood}
            onSelect={() => onMoodSelect(mood)}
            index={index}
            size={size}
          />
        ))}
      </ScrollView>

      {/* Mood selection hint */}
      <Text style={styles.hint}>
        Swipe to see all moods
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedMoodPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  selectedMoodEmoji: {
    fontSize: FONT_SIZES.sm,
  },
  selectedMoodText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    minWidth: 100,
    ...SHADOWS.sm,
  },
  moodPillCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    minWidth: 80,
  },
  moodPillPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
    backgroundColor: COLORS.backgroundSecondary,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.xxl,
  },
  moodEmojiCompact: {
    fontSize: FONT_SIZES.lg,
  },
  moodEmojiSelected: {
    transform: [{ scale: 1.1 }],
  },
  moodLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  moodLabelCompact: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  moodLabelSelected: {
    color: COLORS.surface,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  checkmark: {
    width: 6,
    height: 10,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.success,
    transform: [{ rotate: '45deg' }, { translateY: -1 }],
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

export default MoodSelector;
