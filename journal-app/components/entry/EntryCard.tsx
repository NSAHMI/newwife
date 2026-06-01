import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Entry } from '../../types/entry';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, MOOD_COLORS } from '../../constants/theme';
import { formatShortDate } from '../../utils/dateUtils';

interface EntryCardProps {
  entry: Entry;
  onDelete?: (entry: Entry) => void;
}

export function EntryCard({ entry, onDelete }: EntryCardProps) {
  const router = useRouter();
  const moodConfig = MOOD_COLORS[entry.mood];
  const truncatedBody =
    entry.body.length > 100 ? entry.body.substring(0, 100) + '...' : entry.body;

  const handlePress = () => {
    router.push(`/entry/${entry.id}`);
  };

  const handleLongPress = () => {
    if (onDelete) onDelete(entry);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.moodStrip, { backgroundColor: moodConfig.color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.moodBadge}>
            <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
            <Text style={styles.moodLabel}>{moodConfig.label}</Text>
          </View>
          <Text style={styles.date}>{formatShortDate(entry.createdAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {entry.title}
        </Text>
        <Text style={styles.body} numberOfLines={2}>
          {truncatedBody}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.wordCount}>{entry.wordCount} words</Text>
          {entry.imageUrl && (
            <View style={styles.imageIcon}>
              <Ionicons name="image-outline" size={14} color={COLORS.textMuted} />
            </View>
          )}
          {entry.tags.length > 0 && (
            <View style={styles.tags}>
              {entry.tags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {entry.tags.length > 2 && (
                <Text style={styles.moreTag}>+{entry.tags.length - 2}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.sm,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodLabel: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
  },
  date: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  title: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  body: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  wordCount: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  imageIcon: {
    marginLeft: SPACING.xs,
  },
  tags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginLeft: 'auto',
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: FONTS.xs,
    color: COLORS.textSecondary,
  },
  moreTag: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
});
