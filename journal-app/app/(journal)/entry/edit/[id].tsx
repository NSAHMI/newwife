import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJournal } from '../../../../context/JournalContext';
import { useAuth } from '../../../../context/AuthContext';
import { useImageUpload } from '../../../../hooks/useImageUpload';
import { MoodSelector } from '../../../../components/entry/MoodSelector';
import { ImageAttachment } from '../../../../components/entry/ImageAttachment';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { COLORS, FONTS, SPACING, RADIUS } from '../../../../constants/theme';
import { Mood } from '../../../../types/entry';
import { CONFIG } from '../../../../constants/config';

export default function EditEntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { entries, editEntry, removeEntry } = useJournal();
  const { userId } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const entry = entries.find((e) => e.id === id);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [mood, setMood] = useState<Mood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const {
    imageUri,
    imageUrl,
    isUploading,
    uploadProgress,
    pickImage,
    uploadToSupabase,
    clearImage,
    setImageUri,
    setImageUrl,
    setImagePath,
  } = useImageUpload();

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setBody(entry.body);
      setMood(entry.mood);
      setTags(entry.tags || []);
      if (entry.imageUrl) {
        setImageUrl(entry.imageUrl);
      }
      if (entry.imagePath) {
        setImagePath(entry.imagePath);
      }
    }
  }, [entry]);

  const handleAddTag = (text: string) => {
    if (text.endsWith(',') || text.endsWith('\n')) {
      const newTag = text.replace(/[, \n]/g, '').trim();
      if (newTag && tags.length < CONFIG.MAX_TAGS && !tags.includes(newTag)) {
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
    if (!entry) return;
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please add a title to your entry.');
      return;
    }
    if (body.trim().length < 10) {
      Alert.alert('Too Short', 'Please write at least 10 characters in your entry.');
      return;
    }
    if (!mood) {
      Alert.alert('Select Mood', 'Please select how you are feeling.');
      return;
    }

    setIsSaving(true);
    try {
      let finalImageUrl = imageUrl;
      let finalImagePath = imageUrl;

      if (imageUri && imageUri !== entry.imageUrl && userId) {
        if (entry.imagePath) {
          await clearImage();
        }
        const tempEntryId = entry.id;
        const uploadResult = await uploadToSupabase(userId, tempEntryId);
        if (uploadResult) {
          finalImageUrl = uploadResult.imageUrl;
          finalImagePath = uploadResult.imagePath;
        }
      }

      await editEntry(entry.id, {
        title: title.trim(),
        body: body.trim(),
        mood,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
        tags,
      });

      router.back();
    } catch (err) {
      console.error('Save failed:', err);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
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
          <Text style={styles.notFoundText}>Entry not found</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LoadingOverlay visible={isSaving} message="Saving changes..." />

      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Entry</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <MoodSelector selected={mood} onSelect={setMood} />

        <TextInput
          style={styles.titleInput}
          placeholder="What's on your mind?"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={CONFIG.MAX_TITLE_LENGTH}
          returnKeyType="next"
        />

        <TextInput
          style={styles.bodyInput}
          placeholder="Write your entry..."
          placeholderTextColor={COLORS.textMuted}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
          returnKeyType="next"
        />

        <View style={styles.wordCount}>
          <Text style={styles.wordCountText}>
            {body.trim() ? body.trim().split(/\s+/).length : 0} words
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Photo</Text>
          <ImageAttachment
            imageUri={imageUri || imageUrl}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onPickImage={pickImage}
            onRemoveImage={() => {
              clearImage();
              setImageUri(null);
              setImageUrl(null);
            }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Tags</Text>
          <TextInput
            style={styles.tagInput}
            placeholder="Add tags (comma separated)"
            placeholderTextColor={COLORS.textMuted}
            value={tagInput}
            onChangeText={handleAddTag}
          />
          {tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.tag}
                  onPress={() => handleRemoveTag(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                  <Ionicons name="close-circle" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONTS.lg,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: FONTS.md,
    fontWeight: FONTS.semibold,
    color: COLORS.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  titleInput: {
    fontSize: FONTS.xl,
    fontWeight: FONTS.bold,
    color: COLORS.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bodyInput: {
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    minHeight: 200,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  wordCount: {
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
  },
  wordCountText: {
    fontSize: FONTS.xs,
    color: COLORS.textMuted,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONTS.sm,
    fontWeight: FONTS.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  tagInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  tagText: {
    fontSize: FONTS.sm,
    color: COLORS.accent,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: FONTS.lg,
    color: COLORS.textSecondary,
  },
});
