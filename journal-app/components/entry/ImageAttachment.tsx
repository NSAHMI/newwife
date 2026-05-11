/**
 * ImageAttachment Component
 * Photo picker with thumbnail display and upload progress
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

/**
 * ImageAttachment props
 */
interface ImageAttachmentProps {
  /** Local URI of the selected image */
  localUri: string | null;
  /** Remote URL of an already-uploaded image */
  remoteUrl: string | null;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Upload progress (0-100) */
  uploadProgress: number;
  /** Callback to pick an image */
  onPickImage: () => void;
  /** Callback to take a photo */
  onTakePhoto: () => void;
  /** Callback to remove the image */
  onRemoveImage: () => void;
  /** Label text (optional) */
  label?: string;
}

/**
 * ImageAttachment component
 * Shows a dashed "Add Photo" box when no image selected,
 * or a thumbnail preview with remove button when image is selected
 */
export function ImageAttachment({
  localUri,
  remoteUrl,
  isUploading,
  uploadProgress,
  onPickImage,
  onTakePhoto,
  onRemoveImage,
  label = 'Photo (optional)',
}: ImageAttachmentProps) {
  const imageUri = localUri || remoteUrl;
  const hasImage = !!imageUri;

  /**
   * Handle add photo press - show options
   */
  const handleAddPress = () => {
    // For simplicity, just pick from library
    // Could show ActionSheet with options for camera/library
    onPickImage();
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {!hasImage ? (
        // Empty state - show add photo button
        <View style={styles.addPhotoRow}>
          <Pressable
            style={({ pressed }) => [
              styles.addPhotoButton,
              pressed && styles.addPhotoButtonPressed,
            ]}
            onPress={onPickImage}
          >
            <Ionicons name="images-outline" size={24} color={COLORS.textSecondary} />
            <Text style={styles.addPhotoText}>Choose Photo</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.addPhotoButton,
              pressed && styles.addPhotoButtonPressed,
            ]}
            onPress={onTakePhoto}
          >
            <Ionicons name="camera-outline" size={24} color={COLORS.textSecondary} />
            <Text style={styles.addPhotoText}>Take Photo</Text>
          </Pressable>
        </View>
      ) : (
        // Image preview
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />

          {/* Upload progress overlay */}
          {isUploading && (
            <View style={styles.uploadOverlay}>
              <ActivityIndicator size="large" color={COLORS.surface} />
              <Text style={styles.uploadText}>{Math.round(uploadProgress)}%</Text>
            </View>
          )}

          {/* Remove button */}
          {!isUploading && (
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.removeButtonPressed,
              ]}
              onPress={onRemoveImage}
            >
              <Ionicons name="close" size={20} color={COLORS.surface} />
            </Pressable>
          )}

          {/* Change photo button */}
          {!isUploading && (
            <Pressable
              style={({ pressed }) => [
                styles.changeButton,
                pressed && styles.changeButtonPressed,
              ]}
              onPress={onPickImage}
            >
              <Ionicons name="camera" size={16} color={COLORS.surface} />
              <Text style={styles.changeButtonText}>Change</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addPhotoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  addPhotoButton: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addPhotoButtonPressed: {
    opacity: 0.7,
    backgroundColor: COLORS.background,
  },
  addPhotoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  previewContainer: {
    position: 'relative',
    height: 200,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.surface,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonPressed: {
    opacity: 0.8,
  },
  changeButton: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    gap: SPACING.xs,
  },
  changeButtonPressed: {
    opacity: 0.8,
  },
  changeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.surface,
  },
});

export default ImageAttachment;
