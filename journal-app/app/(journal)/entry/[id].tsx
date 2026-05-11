/**
 * Entry Detail Screen
 * View a full journal entry with all details
 */

import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../../constants/theme';
import { Mood } from '../../../types/entry';

/**
 * Placeholder entry data for Phase 1
 * Will be replaced with Firestore data in Phase 6
 */
const PLACEHOLDER_ENTRIES: Record<string, {
  id: string;
  title: string;
  body: string;
  mood: Mood;
  dateKey: string;
  wordCount: number;
  tags: string[];
  createdAt: string;
}> = {
  '1': {
    id: '1',
    title: 'A Beautiful Morning',
    body: `Today started with the most incredible sunrise. The colors painted across the sky reminded me of why I love early mornings.

I woke up before my alarm, which is rare for me. Instead of reaching for my phone, I decided to sit by the window and just watch the world wake up. The sky transformed from deep purple to orange to pale blue in what felt like minutes.

There's something magical about those quiet moments before the day truly begins. No notifications, no deadlines, just the simple beauty of nature doing its thing.

I want to make this a habit - starting my day with intention rather than reaction. Maybe I'll set my alarm 30 minutes earlier and use that time for reflection or journaling.

Today felt different because of how it started. I carried that sense of peace with me throughout the morning. Even when things got busy at work, I could recall that peaceful image and feel grounded again.`,
    mood: 'happy',
    dateKey: '2026-05-11',
    wordCount: 150,
    tags: ['morning', 'gratitude', 'mindfulness'],
    createdAt: 'May 11, 2026 at 6:30 AM',
  },
  '2': {
    id: '2',
    title: 'Reflections on Growth',
    body: `Looking back at the past few months, I can see how much I have changed. It's amazing how small steps lead to big transformations.

When I started this journey, I had no idea where it would take me. The goals I set seemed ambitious, maybe even impossible. But here I am, having accomplished more than I thought I could.

The key was consistency. Not perfection, not intensity - just showing up day after day, even when I didn't feel like it. Especially when I didn't feel like it.

I'm grateful for the challenges because they taught me resilience. I'm grateful for the setbacks because they taught me humility. And I'm grateful for the small wins because they taught me to celebrate progress, not just results.

What's next? I'm not entirely sure, but I know I'm ready for it.`,
    mood: 'grateful',
    dateKey: '2026-05-10',
    wordCount: 200,
    tags: ['reflection', 'growth', 'gratitude'],
    createdAt: 'May 10, 2026 at 9:15 PM',
  },
};

/**
 * Entry detail screen component
 */
export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  // Get entry data (placeholder for now)
  const entry = id ? PLACEHOLDER_ENTRIES[id] : null;

  if (!entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.border} />
          <Text style={styles.notFoundText}>Entry not found</Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const moodConfig = MOOD_CONFIG[entry.mood];
  const readTime = Math.max(1, Math.ceil(entry.wordCount / 200)); // Average reading speed

  /**
   * Handle edit action
   */
  const handleEdit = () => {
    router.push(`/(journal)/entry/edit/${entry.id}`);
  };

  /**
   * Handle delete action
   */
  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete in Phase 6
            Alert.alert('Deleted', 'Entry has been deleted.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton} onPress={handleEdit}>
            <Ionicons name="pencil" size={22} color={COLORS.accent} />
          </Pressable>
          <Pressable style={styles.headerButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date and Mood */}
        <View style={styles.metaContainer}>
          <Text style={styles.dateText}>{entry.createdAt}</Text>
          <View style={[styles.moodChip, { backgroundColor: `${moodConfig.color}20` }]}>
            <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
            <Text style={[styles.moodLabel, { color: moodConfig.color }]}>
              {moodConfig.label}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{entry.title}</Text>

        {/* Body */}
        <Text style={styles.body}>{entry.body}</Text>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="text-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{entry.wordCount} words</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{readTime} min read</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxxxl,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  moodEmoji: {
    fontSize: FONT_SIZES.md,
  },
  moodLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
    lineHeight: 34,
  },
  body: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: SPACING.xl,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  tag: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  notFoundText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  backButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.lg,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
