import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useJournal } from '../../context/JournalContext';
import { useImageUpload } from '../../hooks/useImageUpload';
import { useAuth } from '../../context/AuthContext';
import { MoodSelector } from '../../components/entry/MoodSelector';
import { EntryEditor } from '../../components/entry/EntryEditor';
import { ImageAttachment } from '../../components/entry/ImageAttachment';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Mood, Entry } from '../../types/entry';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CONFIG } from '../../constants/config';

export default function EditEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const { getEntry, editEntry, removeEntry } = useJournal();
  const {
    imageUri,
    imageUrl,
    imagePath,
    isUploading,
    uploadProgress,
    pickImage,
    upload,
    clearImage,
  } = useImageUpload();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood>('calm');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnsaved, setShowUnsaved] = useState(false);
  const [originalEntry, setOriginalEntry] = useState<Entry | null>(null);

  useEffect(() => {
    loadEntry();
  }, [id]);

  const loadEntry = async () => {
    if (!id) return;
    const found = await getEntry(id);
    if (found) {
      setOriginalEntry(found);
      setTitle(found.title);
      setBody(found.body);
      setMood(found.mood);
      setTags([...found.tags]);
      if (found.imageUrl) {
        // Set the existing image URL as the imageUri for display
        setImageUri(found.imageUrl);
      }
    }
    setIsLoading(false);
  };

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

      // If user picked a new image and hasn't uploaded it yet
      if (imageUri && !imageUrl && userId && id) {
        await upload(userId, id, imageUri);
        finalImageUrl = imageUrl;
        finalImagePath = imagePath;
      }

      // If user removed the image
      if (!imageUri && originalEntry?.imagePath) {
        await clearImage();
        finalImageUrl = null;
        finalImagePath = null;
      }

      if (id) {
        await editEntry(id, {
          title: title.trim(),
          body: body.trim(),
          mood,
          imageUrl: finalImageUrl,
          imagePath: finalImagePath,
          tags,
        });
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    setShowUnsaved(true);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LoadingOverlay message="Loading entry..." />
      </View>
    );
  }

  if (!originalEntry) {
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
        <Text style={styles.headerTitle}>Edit Entry</Text>
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
        <MoodSelector selected={mood} onSelect={setMood} />

        <EntryEditor
          initialTitle={title}
          initialBody={body}
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
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to discard them?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: FONTS.md,
    color: COLORS.textSecondary,
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
