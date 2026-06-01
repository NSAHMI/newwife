import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJournal } from '../../../context/JournalContext';
import { useAuth } from '../../../context/AuthContext';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { LoadingOverlay } from '../../../components/ui/LoadingOverlay';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS, MOOD_COLORS } from '../../../constants/theme';
import { formatDate, getReadTime } from '../../../utils/dateUtils';
import { getSignedUrl } from '../../../services/mediaService';

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, removeEntry } = useJournal();
  const { userId } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  const entry = entries.find((e) => e.id === id);

  useEffect(() => {
    if (entry?.imagePath) {
      loadSignedUrl();
    }
  }, [entry?.imagePath]);

  async function loadSignedUrl() {
    if (!entry?.imagePath) return;
    try {
      const url = await getSignedUrl(entry.imagePath);
      setSignedImageUrl(url);
    } catch (err) {
      console.error('Failed to load signed URL:', err);
    }
  }

  const handleDelete = async () => {
    if (!entry) return;
    setIsDeleting(true);
    try {
      if (entry.imagePath) {
        const { deleteImage } = await import('../../../services/mediaService');
        await deleteImage(entry.imagePath);
      }
      await removeEntry(entry.id);
      setShowDeleteModal(false);
      router.back();
    } catch (err) {
      console.error('Delete failed:', err);
      Alert.alert('Error', 'Failed to delete entry.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Ionicons name="document-text-outline" size={64} color={COLORS.border} />
          <Text style={styles.notFoundText}>Entry not found</Text>
        </View>
      </View>
    );
  }

  const moodConfig = MOOD_COLORS[entry.mood];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LoadingOverlay visible={isDeleting} message="Deleting..." />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push(`/(journal)/entry/edit/${entry.id}`)}
            style={styles.actionButton}
          >
            <Ionicons name="pencil-outline" size={20} color={COLORS.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            style={styles.actionButton}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {(signedImageUrl || entry.imageUrl) && (
          <Image
            source={{ uri: signedImageUrl || entry.imageUrl || '' }}
            style={styles.heroImage}
          />
        )}

        <View style={styles.meta}>
          <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
          <View style={[styles.moodBadge, { backgroundColor: moodConfig.color + '20' }]}>
            <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
            <Text style={[styles.moodLabel, { color: moodConfig.color }]}>
              {moodConfig.label}
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{entry.title}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="text-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{entry.wordCount} words</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.statText}>{getReadTime(entry.wordCount)}</Text>
          </View>
        </View>

        <Text style={styles.body}>{entry.body}</Text>

        {entry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.borderLight,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  date: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  moodEmoji: {
    fontSize: FONTS.md,
  },
  moodLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.border,
  },
  body: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  tagText: {
    fontSize: FONTS.sm,
    color: COLORS.accent,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  notFoundText: {
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
  },
});
