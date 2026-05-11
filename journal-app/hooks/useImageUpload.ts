/**
 * useImageUpload Hook
 * Handles image picking and uploading to Supabase Storage
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { CONFIG } from '../constants/config';
import {
  uploadImage,
  deleteImage,
  validateImageSize,
  UploadResult,
} from '../services/mediaService';

/**
 * Image state interface
 */
interface ImageState {
  /** Local URI of the selected image */
  localUri: string | null;
  /** Remote URL after upload (signed URL) */
  remoteUrl: string | null;
  /** Storage path for deletion */
  storagePath: string | null;
  /** Whether an image is selected */
  hasImage: boolean;
}

/**
 * useImageUpload hook return type
 */
interface UseImageUploadReturn {
  /** Current image state */
  imageState: ImageState;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Upload progress (0-100) */
  uploadProgress: number;
  /** Pick an image from the library */
  pickImage: () => Promise<boolean>;
  /** Take a photo with the camera */
  takePhoto: () => Promise<boolean>;
  /** Upload the selected image to Supabase */
  upload: (userId: string, entryId: string) => Promise<UploadResult | null>;
  /** Clear the selected image */
  clearImage: () => Promise<void>;
  /** Set image from existing entry (for editing) */
  setExistingImage: (url: string | null, path: string | null) => void;
}

/**
 * Hook for managing image selection and upload
 * @returns Image upload state and functions
 */
export function useImageUpload(): UseImageUploadReturn {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Request media library permissions
   */
  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to attach images to your journal entries.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  /**
   * Request camera permissions
   */
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow camera access to take photos for your journal entries.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  /**
   * Pick an image from the media library
   */
  const pickImage = useCallback(async (): Promise<boolean> => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return false;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: CONFIG.IMAGE_QUALITY,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return false;
      }

      const asset = result.assets[0];

      // Validate image size
      const isValidSize = await validateImageSize(asset.uri);
      if (!isValidSize) {
        Alert.alert(
          'Image Too Large',
          `Please select an image smaller than ${CONFIG.MAX_IMAGE_SIZE_MB}MB.`
        );
        return false;
      }

      // Clear any existing remote image
      if (storagePath) {
        try {
          await deleteImage(storagePath);
        } catch {
          console.warn('Failed to delete old image');
        }
      }

      setLocalUri(asset.uri);
      setRemoteUrl(null);
      setStoragePath(null);

      return true;
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return false;
    }
  }, [storagePath]);

  /**
   * Take a photo with the camera
   */
  const takePhoto = useCallback(async (): Promise<boolean> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return false;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: CONFIG.IMAGE_QUALITY,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return false;
      }

      const asset = result.assets[0];

      // Validate image size
      const isValidSize = await validateImageSize(asset.uri);
      if (!isValidSize) {
        Alert.alert(
          'Image Too Large',
          `Please take a smaller photo (max ${CONFIG.MAX_IMAGE_SIZE_MB}MB).`
        );
        return false;
      }

      // Clear any existing remote image
      if (storagePath) {
        try {
          await deleteImage(storagePath);
        } catch {
          console.warn('Failed to delete old image');
        }
      }

      setLocalUri(asset.uri);
      setRemoteUrl(null);
      setStoragePath(null);

      return true;
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return false;
    }
  }, [storagePath]);

  /**
   * Upload the selected image to Supabase
   */
  const upload = useCallback(
    async (userId: string, entryId: string): Promise<UploadResult | null> => {
      if (!localUri) {
        console.log('No image to upload');
        return null;
      }

      // If already uploaded, return existing data
      if (remoteUrl && storagePath) {
        return { publicUrl: remoteUrl, storagePath };
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        // Simulate progress updates (actual progress isn't available from Supabase)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);

        const result = await uploadImage(userId, entryId, localUri);

        clearInterval(progressInterval);
        setUploadProgress(100);

        setRemoteUrl(result.publicUrl);
        setStoragePath(result.storagePath);

        return result;
      } catch (error) {
        console.error('Error uploading image:', error);
        setUploadProgress(0);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [localUri, remoteUrl, storagePath]
  );

  /**
   * Clear the selected image
   */
  const clearImage = useCallback(async (): Promise<void> => {
    // Delete from Supabase if uploaded
    if (storagePath) {
      try {
        await deleteImage(storagePath);
      } catch (error) {
        console.warn('Failed to delete image from storage:', error);
      }
    }

    setLocalUri(null);
    setRemoteUrl(null);
    setStoragePath(null);
    setUploadProgress(0);
  }, [storagePath]);

  /**
   * Set image from existing entry (for editing)
   */
  const setExistingImage = useCallback(
    (url: string | null, path: string | null): void => {
      setRemoteUrl(url);
      setStoragePath(path);
      setLocalUri(null); // No local URI for existing images
    },
    []
  );

  /**
   * Current image state
   */
  const imageState: ImageState = {
    localUri,
    remoteUrl,
    storagePath,
    hasImage: !!(localUri || remoteUrl),
  };

  return {
    imageState,
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    upload,
    clearImage,
    setExistingImage,
  };
}

export default useImageUpload;
