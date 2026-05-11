/**
 * Edit Entry Screen
 * Edit an existing journal entry
 */

import { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../../../constants/theme';
import { CONFIG } from '../../../../constants/config';
import { Mood, Entry } from '../../../../types/entry';
import { useJournal } from '../../../../context/JournalContext';
import { useImageUpload } from '../../../../hooks/useImageUpload';
import { MoodSelector } from '../../../../components/entry/MoodSelector';
import { ImageAttachment } from '../../../../components/entry/ImageAttachment';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { countWords } from '../../../../utils/dateUtils';

/**
 * Edit entry screen component
 */
export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry, editEntry, isLoading: contextLoading } = useJournal();
  const {
    imageState,
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    clearImage,
    upload,
    setExistingImage,
  } = useImageUpload();

  const [originalEntry, setOriginalEntry] = useState<Entry | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('calm');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  /**
   * Load original entry data
   */
  useEffect(() => {
    const loadEntry = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        const fetchedEntry = await getEntry(id);
        if (fetchedEntry) {
          setOriginalEntry(fetchedEntry);
          setTitle(fetchedEntry.title);
          setBody(fetchedEntry.body);
          setSelectedMood(fetchedEntry.mood);
          setTags(fetchedEntry.tags || []);

          // Set existing image if present
          if (fetchedEntry.imageUrl || fetchedEntry.imagePath) {
            setExistingImage(fetchedEntry.imageUrl, fetchedEntry.imagePath);
          }
        }
      } catch (error) {
        console.error('Error loading entry:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEntry();
  }, [id, getEntry, setExistingImage]);

  /**
   * Track changes
   */
  useEffect(() => {
    if (originalEntry) {
      const titleChanged = title !== originalEntry.title;
      const bodyChanged = body !== originalEntry.body;
      const moodChanged = selectedMood !== originalEntry.mood;
      const tagsChanged = JSON.stringify(tags) !== JSON.stringify(originalEntry.tags || []);
      const imageChanged =
        imageState.localUri !== null ||
        (imageState.remoteUrl !== originalEntry.imageUrl);

      setHasChanges(titleChanged || bodyChanged || moodChanged || tagsChanged || imageChanged);
    }
  }, [title, body, selectedMood, tags, imageState, originalEntry]);

  /**
   * Calculate word count from body text
   */
  const wordCount = countWords(body);

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
    if (!validateEntry() || !originalEntry) return;

    setIsSaving(true);
    try {
      // Prepare update data
      const updateData: {
        title: string;
        body: string;
        mood: Mood;
        tags: string[];
        imageUrl?: string | null;
        imagePath?: string | null;
      } = {
        title: title.trim(),
        body: body.trim(),
        mood: selectedMood,
        tags,
      };

      // Handle image upload if there's a new local image
      if (imageState.localUri) {
        try {
          const uploadResult = await upload(originalEntry.userId, originalEntry.id);
          if (uploadResult) {
            updateData.imageUrl = uploadResult.publicUrl;
            updateData.imagePath = uploadResult.storagePath;
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          Alert.alert(
            'Image Upload Failed',
            'Your entry will be saved without the new image. You can try adding the image again later.'
          );
        }
      } else if (!imageState.hasImage && originalEntry.imageUrl) {
        // Image was removed
        updateData.imageUrl = null;
        updateData.imagePath = null;
      }

      await editEntry(originalEntry.id, updateData);
      router.back();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle canceling the edit
   */
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: async () => {
              // Clear any newly selected image
              if (imageState.localUri) {
                await clearImage();
              }
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [hasChanges, imageState.localUri, clearImage]);

  /**
   * Handle removing the image
   */
  const handleRemoveImage = async () => {
    Alert.alert(
      'Remove Photo?',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await clearImage();
          },
        },
      ]
    );
  };

  /**
   * Show loading state
   */
  if (isLoading || contextLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Show not found state
   */
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
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
          />

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

          {/* Image Attachment */}
          <ImageAttachment
            localUri={imageState.localUri}
            remoteUrl={imageState.remoteUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onPickImage={pickImage}
            onTakePhoto={takePhoto}
            onRemoveImage={handleRemoveImage}
          />
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
            onPress={handleCancel}
            disabled={isSaving}
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

      {/* Loading Overlay */}
      <LoadingOverlay visible={isSaving} message="Saving changes..." />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
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
