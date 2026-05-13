/**
 * EntryCard Component
 * Summary card for displaying journal entries in lists
 * Features mood indicator, body preview, and image thumbnail
 * Enhanced with improved visual hierarchy and animations
 */

import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Entry } from '../../types/entry';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG, ANIMATION } from '../../constants/theme';
import { formatShortDate, formatRelativeDate } from '../../utils/dateUtils';

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
  /** Index for staggered animation */
  index?: number;
}

/**
 * EntryCard component
 * Displays a summary of a journal entry with mood, title, body preview, and metadata
 */
export function EntryCard({ entry, onDelete, showDeleteOption = true, index = 0 }: EntryCardProps) {
  const moodConfig = MOOD_CONFIG[entry.mood];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Calculate reading time estimate
   */
  const readingTime = useMemo(() => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(entry.wordCount / wordsPerMinute);
    return minutes < 1 ? 'Quick read' : `${minutes} min read`;
  }, [entry.wordCount]);

  /**
   * Entrance animation with stagger based on index
   */
  useEffect(() => {
    const delay = Math.min(index * 50, 300);
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [fadeAnim, slideAnim, index]);

  /**
   * Handle card press - navigate to entry detail
   */
  const handlePress = () => {
    router.push(`/(journal)/entry/${entry.id}`);
  };

  /**
   * Handle press in - scale down
   */
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  /**
   * Handle press out - scale back
   */
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
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

  /**
   * Get relative date display
   */
  const relativeDate = useMemo(() => {
    return formatRelativeDate(entry.createdAt);
  }, [entry.createdAt]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={500}
        accessibilityLabel={`Journal entry: ${entry.title}`}
        accessibilityHint="Double tap to view entry details"
        accessibilityRole="button"
      >
        {/* Mood color strip with gradient effect */}
        <LinearGradient
          colors={[moodConfig.color, `${moodConfig.color}CC`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.moodStrip}
        />

        {/* Card content */}
        <View style={styles.content}>
          {/* Header with mood badge and title */}
          <View style={styles.header}>
            <View style={[styles.moodBadge, { backgroundColor: `${moodConfig.color}15` }]}>
              <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title} numberOfLines={1}>
                {entry.title}
              </Text>
              <View style={styles.dateRow}>
                <Text style={styles.date}>{formattedDate}</Text>
                <View style={styles.dateSeparator} />
                <Text style={styles.relativeDate}>{relativeDate}</Text>
              </View>
            </View>
            {/* Image thumbnail positioned in header */}
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

          {/* Body preview */}
          <Text style={styles.bodyPreview} numberOfLines={2}>
            {getBodyPreview()}
          </Text>

          {/* Footer with metadata */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {/* Reading time badge */}
              <View style={styles.readTimeBadge}>
                <Ionicons name="time-outline" size={11} color={COLORS.accent} />
                <Text style={styles.readTimeText}>{readingTime}</Text>
              </View>

              {/* Word count */}
              <View style={styles.metaItem}>
                <Text style={styles.metaText}>{entry.wordCount} words</Text>
              </View>

              {/* Tags indicator */}
              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.tagBadge}>
                  <Ionicons name="pricetag" size={10} color={COLORS.textSecondary} />
                  <Text style={styles.tagCount}>{entry.tags.length}</Text>
                </View>
              )}

              {/* Image indicator */}
              {entry.imageUrl && (
                <View style={styles.metaItem}>
                  <Ionicons name="image" size={12} color={COLORS.textTertiary} />
                </View>
              )}
            </View>

            {/* Arrow indicator with circle */}
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  moodStrip: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  moodBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.xl,
  },
  headerText: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 22,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  dateSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textTertiary,
    marginHorizontal: SPACING.sm,
  },
  relativeDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  bodyPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
    letterSpacing: 0.1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  readTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent}10`,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  readTimeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    fontWeight: '600',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.backgroundSecondary,
    paddingVertical: 3,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  tagCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.accent}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
});

export default EntryCard;
