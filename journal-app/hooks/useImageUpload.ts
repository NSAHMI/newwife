import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage, deleteImage as deleteImageService } from '../services/mediaService';
import { CONFIG } from '../constants/config';

export function useImageUpload() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickImage = useCallback(async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (result.canceled) return null;

    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      throw new Error(`Image must be less than ${CONFIG.MAX_IMAGE_SIZE_MB}MB`);
    }

    setImageUri(asset.uri);
    return asset.uri;
  }, []);

  const upload = useCallback(
    async (userId: string, entryId: string, uri: string): Promise<void> => {
      setIsUploading(true);
      setUploadProgress(0);

      try {
        setUploadProgress(30);
        const { publicUrl, storagePath } = await uploadImage(userId, entryId, uri);
        setUploadProgress(100);
        setImageUrl(publicUrl);
        setImagePath(storagePath);
      } catch (err) {
        setIsUploading(false);
        throw err;
      }
    },
    []
  );

  const clearImage = useCallback(async (): Promise<void> => {
    if (imagePath) {
      try {
        await deleteImageService(imagePath);
      } catch (err) {
        console.error('Failed to delete image from storage:', err);
      }
    }
    setImageUri(null);
    setImageUrl(null);
    setImagePath(null);
    setIsUploading(false);
    setUploadProgress(0);
  }, [imagePath]);

  return {
    imageUri,
    imageUrl,
    imagePath,
    isUploading,
    uploadProgress,
    pickImage,
    upload,
    clearImage,
  };
}
