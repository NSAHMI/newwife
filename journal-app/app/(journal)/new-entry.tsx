/**
 * New Entry Screen
 * Create a new journal entry with mood, text, and optional photo
 */

import { useState } from 'react';
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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants/theme';
import { CONFIG } from '../../constants/config';
import { Mood } from '../../types/entry';
import { useJournal } from '../../context/JournalContext';
import { useImageUpload } from '../../hooks/useImageUpload';
import { MoodSelector } from '../../components/entry/MoodSelector';
import { ImageAttachment } from '../../components/entry/ImageAttachment';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { formatDate } from '../../utils/dateUtils';

/**
 * New entry screen component
 */
export default function NewEntryScreen() {
  const { addEntry } = useJournal();
  const {
    imageState,
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    clearImage,
    upload,
  } = useImageUpload();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood>('calm');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Calculate word count from body text
   */
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  /**
   * Get today's date formatted
   */
  const today = formatDate(new Date());

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
      // Create entry data
      const entryData = {
        title: title.trim(),
        body: body.trim(),
        mood: selectedMood,
        tags,
        imageUrl: null as string | null,
        imagePath: null as string | null,
      };

      // Create the entry first to get an ID
      const createdEntry = await addEntry(entryData);

      // If there's an image selected, upload it
      if (imageState.localUri && createdEntry) {
        try {
          const uploadResult = await upload(createdEntry.userId, createdEntry.id);
          if (uploadResult) {
            // Note: The image URL will be updated in the entry via context
            // For now, the entry is created without the image
            // In a production app, you might want to update the entry with the image URL
            console.log('Image uploaded successfully:', uploadResult.publicUrl);
          }
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          // Entry is saved, but image upload failed
          Alert.alert(
            'Image Upload Failed',
            'Your entry was saved, but the image could not be uploaded. You can try adding the image again by editing the entry.'
          );
        }
      }

      // Navigate back to home
      router.back();
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle canceling the entry
   */
  const handleCancel = async () => {
    if (title.trim() || body.trim() || imageState.hasImage) {
      Alert.alert(
        'Discard Entry?',
        'You have unsaved changes. Are you sure you want to discard this entry?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: async () => {
              // Clear any selected image
              if (imageState.hasImage) {
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
  };

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

  return (
    <SafeAreaView style={styles.container}>
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
          {/* Date Header */}
          <Text style={styles.dateText}>{today}</Text>

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
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Entry'}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isSaving} message="Saving your entry..." />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  dateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
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
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});
