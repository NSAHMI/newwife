import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

interface ImageAttachmentProps {
  imageUri: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onPickImage: () => void;
  onRemoveImage: () => void;
}

export function ImageAttachment({
  imageUri,
  isUploading,
  uploadProgress,
  onPickImage,
  onRemoveImage,
}: ImageAttachmentProps) {
  if (imageUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: imageUri }} style={styles.preview} />
        {isUploading && (
          <View style={styles.progressOverlay}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` }]}
              />
            </View>
            <Text style={styles.progressText}>Uploading...</Text>
          </View>
        )}
        {!isUploading && (
          <TouchableOpacity style={styles.removeButton} onPress={onRemoveImage}>
            <Ionicons name="close-circle" size={28} color={COLORS.error} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.addButton} onPress={onPickImage} activeOpacity={0.7}>
      <View style={styles.addContent}>
        <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
        <Text style={styles.addText}>Add Photo</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  addButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  addContent: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addText: {
    fontSize: FONTS.sm,
    color: COLORS.textMuted,
    fontWeight: FONTS.medium,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.surface,
    fontSize: FONTS.sm,
    fontWeight: FONTS.medium,
  },
  removeButton: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
});
