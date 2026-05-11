/**
 * Edit Entry Screen
 * Edit an existing journal entry
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS, MOOD_CONFIG } from '../../../../constants/theme';
import { CONFIG } from '../../../../constants/config';
import { Mood, MOODS } from '../../../../types/entry';

/**
 * Placeholder entry data for Phase 1
 * Will be replaced with Firestore data in Phase 6
 */
const PLACEHOLDER_ENTRIES: Record<string, {
  id: string;
  title: string;
  body: string;
  mood: Mood;
  tags: string[];
}> = {
  '1': {
    id: '1',
    title: 'A Beautiful Morning',
    body: `Today started with the most incredible sunrise. The colors painted across the sky reminded me of why I love early mornings.

I woke up before my alarm, which is rare for me. Instead of reaching for my phone, I decided to sit by the window and just watch the world wake up. The sky transformed from deep purple to orange to pale blue in what felt like minutes.

There's something magical about those quiet moments before the day truly begins. No notifications, no deadlines, just the simple beauty of nature doing its thing.`,
    mood: 'happy',
    tags: ['morning', 'gratitude', 'mindfulness'],
  },
  '2': {
    id: '2',
    title: 'Reflections on Growth',
    body: `Looking back at the past few months, I can see how much I have changed. It's amazing how small steps lead to big transformations.

When I started this journey, I had no idea where it would take me. The goals I set seemed ambitious, maybe even impossible. But here I am, having accomplished more than I thought I could.`,
    mood: 'grateful',
    tags: ['reflection', 'growth', 'gratitude'],
  },
};

/**
 * Edit entry screen component
 */
export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const originalEntry = id ? PLACEHOLDER_ENTRIES[id] : null;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('calm');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load original entry data
  useEffect(() => {
    if (originalEntry) {
      setTitle(originalEntry.title);
      setBody(originalEntry.body);
      setSelectedMood(originalEntry.mood);
      setTags(originalEntry.tags);
    }
  }, [id]);

  // Track changes
  useEffect(() => {
    if (originalEntry) {
      const changed =
        title !== originalEntry.title ||
        body !== originalEntry.body ||
        selectedMood !== originalEntry.mood ||
        JSON.stringify(tags) !== JSON.stringify(originalEntry.tags);
      setHasChanges(changed);
    }
  }, [title, body, selectedMood, tags, originalEntry]);

  if (!originalEntry) {
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

  /**
   * Calculate word count from body text
   */
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  /**
   * Handle adding a new tag
   */
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < CONFIG.MAX_TAGS) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  /**
   * Handle removing a tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  /**
   * Validate the entry before saving
   */
  const validateEntry = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your entry.');
      return false;
    }
    if (title.length > CONFIG.MAX_TITLE_LENGTH) {
      Alert.alert('Title Too Long', `Title must be ${CONFIG.MAX_TITLE_LENGTH} characters or less.`);
      return false;
    }
    if (!body.trim() || body.trim().length < CONFIG.MIN_BODY_LENGTH) {
      Alert.alert('Entry Too Short', `Please write at least ${CONFIG.MIN_BODY_LENGTH} characters.`);
      return false;
    }
    return true;
  };

  /**
   * Handle saving the entry
   */
  const handleSave = async () => {
    if (!validateEntry()) return;

    setIsSaving(true);
    try {
      // TODO: Implement actual save in Phase 6
      await new Promise((resolve) => setTimeout(resolve, 500));

      Alert.alert('Entry Updated', 'Your changes have been saved.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle canceling the edit
   */
  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Entry</Text>
        <View style={styles.headerButton} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.moodContainer}
            >
              {MOODS.map((mood) => {
                const config = MOOD_CONFIG[mood];
                const isSelected = selectedMood === mood;
                return (
                  <Pressable
                    key={mood}
                    style={[
                      styles.moodPill,
                      isSelected && { backgroundColor: config.color },
                    ]}
                    onPress={() => setSelectedMood(mood)}
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

          {/* Title Input */}
          <View style={styles.section}>
            <TextInput
              style={styles.titleInput}
              placeholder="What's on your mind?"
              placeholderTextColor={COLORS.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={CONFIG.MAX_TITLE_LENGTH}
            />
            <Text style={styles.charCount}>
              {title.length}/{CONFIG.MAX_TITLE_LENGTH}
            </Text>
          </View>

          {/* Body Input */}
          <View style={styles.section}>
            <TextInput
              style={styles.bodyInput}
              placeholder="Write your entry..."
              placeholderTextColor={COLORS.textSecondary}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.wordCount}>{wordCount} words</Text>
          </View>

          {/* Tags Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags (optional)</Text>
            <View style={styles.tagsInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag..."
                placeholderTextColor={COLORS.textSecondary}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <Pressable
                style={[
                  styles.addTagButton,
                  (!tagInput.trim() || tags.length >= CONFIG.MAX_TAGS) &&
                    styles.addTagButtonDisabled,
                ]}
                onPress={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= CONFIG.MAX_TAGS}
              >
                <Ionicons name="add" size={20} color={COLORS.surface} />
              </Pressable>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                    <Pressable onPress={() => handleRemoveTag(tag)}>
                      <Ionicons name="close" size={16} color={COLORS.textSecondary} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.buttonPressed,
              (isSaving || !hasChanges) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  moodContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
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
  titleInput: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 0,
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  bodyInput: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 200,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  wordCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tagInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm,
  },
  addTagButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  saveButton: {
    flex: 2,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  buttonPressed: {
    opacity: 0.9,
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
