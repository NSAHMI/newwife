import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournal } from '../../context/JournalContext';
import { useImageUpload } from '../../hooks/useImageUpload';
import { MoodSelector } from '../../components/entry/MoodSelector';
import { EntryEditor } from '../../components/entry/EntryEditor';
import { ImageAttachment } from '../../components/entry/ImageAttachment';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useAuth } from '../../context/AuthContext';
import { Mood } from '../../types/entry';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONFIG } from '../../constants/config';

export default function NewEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useAuth();
  const { addEntry } = useJournal();
  const {
    imageUri,
    imageUrl,
    imagePath,
    isUploading,
    uploadProgress,
    pickImage,
    uploadToSupabase,
    clearImage,
  } = useImageUpload();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood>('calm');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsaved, setShowUnsaved] = useState(false);

  const hasContent = title.length > 0 || body.length > 0;

  const handleAddTag = (text: string) => {
    if ((text.includes(',') || text.includes('\n')) && tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase();
      if (newTag && !tags.includes(newTag) && tags.length < CONFIG.MAX_TAGS) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else {
      setTagInput(text);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your entry.');
      return;
    }
    if (body.trim().length < 10) {
      Alert.alert('Content Too Short', 'Please write at least 10 characters.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = imageUrl;
      let finalImagePath = imagePath;

      if (imageUri && !imageUrl && userId) {
        const entryId = `temp_${Date.now()}`;
        await uploadToSupabase(userId, entryId);
        finalImageUrl = imageUrl;
        finalImagePath = imagePath;
      }

      await addEntry({
        title: title.trim(),
        body: body.trim(),
        mood,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
        tags,
      });

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (hasContent) {
      setShowUnsaved(true);
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Entry</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>{isSaving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>

        <MoodSelector selected={mood} onSelect={setMood} />

        <EntryEditor
          onTitleChange={setTitle}
          onBodyChange={setBody}
          placeholder="Write your entry..."
        />

        <ImageAttachment
          imageUri={imageUri}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onPickImage={pickImage}
          onRemoveImage={clearImage}
        />

        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>Tags</Text>
          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
                <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
            {tags.length < CONFIG.MAX_TAGS && (
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={handleAddTag}
                placeholder="Add tag..."
                placeholderTextColor={COLORS.textMuted}
                returnKeyType="done"
              />
            )}
          </View>
          <Text style={styles.tagHint}>Separate tags with commas</Text>
        </View>
      </ScrollView>

      {isSaving && <LoadingOverlay message="Saving entry..." />}

      <ConfirmModal
        visible={showUnsaved}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Writing"
        onConfirm={() => {
          setShowUnsaved(false);
          router.back();
        }}
        onCancel={() => setShowUnsaved(false)}
        destructive
      />
    </KeyboardAvoidingView>
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
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    color: COLORS.surface,
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  dateText: {
    fontSize: FONTS.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  tagsSection: {
    marginTop: SPACING.lg,
  },
  tagsLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: FONTS.xs,
    color: COLORS.accent,
    fontWeight: FONTS.medium,
  },
  tagInput: {
    fontSize: FONTS.sm,
    color: COLORS.textPrimary,
    minWidth: 80,
    paddingVertical: SPACING.xs,
  },
  tagHint: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
});
