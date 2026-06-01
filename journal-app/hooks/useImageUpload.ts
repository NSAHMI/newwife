import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { uploadImage, deleteImage } from '../services/mediaService';
import { CONFIG } from '../constants/config';

interface UseImageUploadReturn {
  imageUri: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  isUploading: boolean;
  uploadProgress: number;
  pickImage: () => Promise<string | null>;
  uploadToSupabase: (userId: string, entryId: string) => Promise<{ imageUrl: string; imagePath: string } | null>;
  clearImage: () => Promise<void>;
  setImageUri: (uri: string | null) => void;
  setImageUrl: (url: string | null) => void;
  setImagePath: (path: string | null) => void;
}

export function useImageUpload(): UseImageUploadReturn {
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

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);

      if (fileInfo.exists && fileInfo.size > CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        throw new Error(`Image exceeds ${CONFIG.MAX_IMAGE_SIZE_MB}MB limit`);
      }

      setImageUri(asset.uri);
      return asset.uri;
    }
    return null;
  }, []);

  const uploadToSupabase = useCallback(
    async (userId: string, entryId: string) => {
      if (!imageUri) return null;

      setIsUploading(true);
      setUploadProgress(0);

      try {
        setUploadProgress(30);
        const result = await uploadImage(userId, entryId, imageUri);
        setUploadProgress(100);
        setImageUrl(result.publicUrl);
        setImagePath(result.storagePath);
        return { imageUrl: result.publicUrl, imagePath: result.storagePath };
      } catch (err) {
        console.error('Upload failed:', err);
        throw err;
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    },
    [imageUri]
  );

  const clearImage = useCallback(async () => {
    if (imagePath) {
      try {
        await deleteImage(imagePath);
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
    }
    setImageUri(null);
    setImageUrl(null);
    setImagePath(null);
  }, [imagePath]);

  return {
    imageUri,
    imageUrl,
    imagePath,
    isUploading,
    uploadProgress,
    pickImage,
    uploadToSupabase,
    clearImage,
    setImageUri,
    setImageUrl,
    setImagePath,
  };
}
