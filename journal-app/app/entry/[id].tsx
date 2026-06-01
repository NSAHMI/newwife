import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournal } from '../../context/JournalContext';
import { useAuth } from '../../context/AuthContext';
import { getSignedUrl } from '../../services/mediaService';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Entry, MOOD_COLORS } from '../../types/entry';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate, getReadTime } from '../../utils/dateUtils';

export default function EntryDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry, removeEntry } = useJournal();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    if (!id) return;
    const found = await getEntry(id);
    if (found) {
      setEntry(found);
      if (found.imagePath) {
        try {
          const url = await getSignedUrl(found.imagePath);
          setImageUrl(url);
        } catch {
          setImageUrl(null);
        }
      }
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (entry) {
      await removeEntry(entry.id);
      setShowDelete(false);
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
        </View>
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Entry not found.</Text>
        </View>
      </View>
    );
  }

  const moodConfig = MOOD_COLORS[entry.mood];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.push(`/entry/edit/${entry.id}`)}
          >
            <Ionicons name="create-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowDelete(true)}
          >
            <Ionicons name="trash-outline" size={22} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} />
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
          <Text style={styles.statText}>{entry.wordCount} words</Text>
          <Text style={styles.statDot}>·</Text>
          <Text style={styles.statText}>{getReadTime(entry.wordCount)}</Text>
        </View>

        <Text style={styles.body}>{entry.body}</Text>

        {entry.tags.length > 0 && (
          <View style={styles.tags}>
            {entry.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Delete Entry"
        message={`Are you sure you want to delete "${entry.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        destructive
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
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  date: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodLabel: {
    fontSize: FONTS.xs,
    fontWeight: FONTS.semibold,
  },
  title: {
    fontSize: FONTS.xxl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  statText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  statDot: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  body: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    lineHeight: 26,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  tagText: {
    fontSize: FONTS.xs,
    color: COLORS.accent,
    fontWeight: FONTS.medium,
  },
});
