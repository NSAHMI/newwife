/**
 * EntryCard Component
 * Summary card for displaying journal entries in lists
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Entry } from '../../types/entry';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';
import { formatShortDate, normalizeDate } from '../../utils/dateUtils';

/**
 * EntryCard props
 */
interface EntryCardProps {
  /** Entry data to display */
  entry: Entry;
  /** Callback when delete is confirmed */
  onDelete?: (entryId: string) => void;
  /** Whether to show delete option on long press */
  showDeleteOption?: boolean;
}

/**
 * EntryCard component
 * Displays a summary of a journal entry with mood, title, body preview, and metadata
 */
export function EntryCard({ entry, onDelete, showDeleteOption = true }: EntryCardProps) {
  const moodConfig = MOOD_CONFIG[entry.mood];

  /**
   * Handle card press - navigate to entry detail
   */
  const handlePress = () => {
    router.push(`/(journal)/entry/${entry.id}`);
  };

  /**
   * Handle long press - show delete confirmation
   */
  const handleLongPress = () => {
    if (!showDeleteOption || !onDelete) return;

    Alert.alert(
      'Delete Entry',
      `Are you sure you want to delete "${entry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(entry.id),
        },
      ]
    );
  };

  /**
   * Get the first 100 characters of the body for preview
   */
  const getBodyPreview = (): string => {
    const plainText = entry.body.replace(/[#*_~`]/g, ''); // Remove markdown
    if (plainText.length <= 100) return plainText;
    return `${plainText.substring(0, 100).trim()}...`;
  };

  /**
   * Format the entry date
   */
  const formattedDate = formatShortDate(entry.createdAt);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      {/* Mood color strip */}
      <View style={[styles.moodStrip, { backgroundColor: moodConfig.color }]} />

      {/* Card content */}
      <View style={styles.content}>
        {/* Header with mood emoji and title */}
        <View style={styles.header}>
          <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {entry.title}
          </Text>
        </View>

        {/* Body preview */}
        <Text style={styles.bodyPreview} numberOfLines={2}>
          {getBodyPreview()}
        </Text>

        {/* Footer with date, word count, and image indicator */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.date}>{formattedDate}</Text>
            <View style={styles.dot} />
            <Text style={styles.wordCount}>{entry.wordCount} words</Text>
          </View>

          <View style={styles.footerRight}>
            {/* Image indicator */}
            {entry.imageUrl && (
              <View style={styles.imageIndicator}>
                <Ionicons name="image-outline" size={14} color={COLORS.textSecondary} />
              </View>
            )}

            {/* Tags indicator */}
            {entry.tags.length > 0 && (
              <View style={styles.tagsIndicator}>
                <Ionicons name="pricetag-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.tagsCount}>{entry.tags.length}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Small image thumbnail if exists */}
        {entry.imageUrl && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: entry.imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  moodStrip: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  bodyPreview: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  wordCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  imageIndicator: {
    opacity: 0.7,
  },
  tagsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    opacity: 0.7,
  },
  tagsCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  thumbnailContainer: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});

export default EntryCard;
