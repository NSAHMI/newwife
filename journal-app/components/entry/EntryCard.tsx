/**
 * EntryCard Component
 * Summary card for displaying journal entries in lists
 * Features mood indicator, body preview, and image thumbnail
 */

import React, { useRef, useEffect } from 'react';
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
import { Entry } from '../../types/entry';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../constants/theme';
import { formatShortDate } from '../../utils/dateUtils';

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
      >
        {/* Mood color strip with gradient effect */}
        <View style={[styles.moodStrip, { backgroundColor: moodConfig.color }]}>
          <View style={[styles.moodStripHighlight, { backgroundColor: moodConfig.color }]} />
        </View>

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
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>

          {/* Body preview */}
          <Text style={styles.bodyPreview} numberOfLines={2}>
            {getBodyPreview()}
          </Text>

          {/* Footer with metadata */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <View style={styles.metaItem}>
                <Ionicons name="text-outline" size={12} color={COLORS.textSecondary} />
                <Text style={styles.metaText}>{entry.wordCount} words</Text>
              </View>

              {/* Tags indicator */}
              {entry.tags && entry.tags.length > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons name="pricetag-outline" size={12} color={COLORS.textSecondary} />
                  <Text style={styles.metaText}>{entry.tags.length}</Text>
                </View>
              )}

              {/* Image indicator */}
              {entry.imageUrl && (
                <View style={styles.metaItem}>
                  <Ionicons name="image-outline" size={12} color={COLORS.textSecondary} />
                </View>
              )}
            </View>

            {/* Arrow indicator */}
            <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
          </View>

          {/* Image thumbnail if exists */}
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
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  moodStrip: {
    width: 5,
    position: 'relative',
  },
  moodStripHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '50%',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moodBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  date: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  bodyPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
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
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  thumbnailContainer: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 48,
    height: 48,
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
