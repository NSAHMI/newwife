/**
 * Media Service
 * Handles all Supabase Storage operations for media uploads
 */

import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { supabase, getJournalMediaBucket } from './supabase';
import { CONFIG } from '../constants/config';

/**
 * Result of an image upload operation
 */
export interface UploadResult {
  /** Public or signed URL for the uploaded image */
  publicUrl: string;
  /** Storage path for deletion */
  storagePath: string;
}

/**
 * Upload an image to Supabase Storage
 * @param userId - The user's Firebase UID
 * @param entryId - The entry ID (for organizing files)
 * @param imageUri - Local file URI of the image
 * @returns Upload result with URLs
 */
export async function uploadImage(
  userId: string,
  entryId: string,
  imageUri: string
): Promise<UploadResult> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = getFileExtension(imageUri);
    const filename = `${timestamp}.${fileExtension}`;
    const storagePath = `${userId}/${entryId}/${filename}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Convert base64 to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Get content type
    const contentType = getContentType(fileExtension);

    // Upload to Supabase
    const bucket = getJournalMediaBucket();
    const { error: uploadError } = await bucket.upload(storagePath, arrayBuffer, {
      contentType,
      upsert: true,
    });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get signed URL (since bucket is private)
    const signedUrl = await getSignedUrl(storagePath);

    console.log('Image uploaded successfully:', storagePath);

    return {
      publicUrl: signedUrl,
      storagePath,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Delete an image from Supabase Storage
 * @param storagePath - Storage path of the image to delete
 */
export async function deleteImage(storagePath: string): Promise<void> {
  try {
    const bucket = getJournalMediaBucket();
    const { error } = await bucket.remove([storagePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    console.log('Image deleted successfully:', storagePath);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

/**
 * Get a signed URL for a private image
 * @param storagePath - Storage path of the image
 * @returns Signed URL with expiry
 */
export async function getSignedUrl(storagePath: string): Promise<string> {
  try {
    const bucket = getJournalMediaBucket();
    const { data, error } = await bucket.createSignedUrl(
      storagePath,
      CONFIG.SIGNED_URL_EXPIRY_SECONDS
    );

    if (error) {
      console.error('Supabase signed URL error:', error);
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

/**
 * Replace an existing image with a new one
 * Deletes the old image and uploads the new one
 * @param userId - The user's Firebase UID
 * @param entryId - The entry ID
 * @param newImageUri - Local file URI of the new image
 * @param oldStoragePath - Storage path of the old image to delete
 * @returns Upload result with URLs
 */
export async function replaceImage(
  userId: string,
  entryId: string,
  newImageUri: string,
  oldStoragePath: string | null
): Promise<UploadResult> {
  // Upload new image first
  const uploadResult = await uploadImage(userId, entryId, newImageUri);

  // Delete old image if exists
  if (oldStoragePath) {
    try {
      await deleteImage(oldStoragePath);
    } catch (error) {
      console.warn('Failed to delete old image, continuing:', error);
      // Don't throw - new image is already uploaded
    }
  }

  return uploadResult;
}

/**
 * Check if an image exists in storage
 * @param storagePath - Storage path to check
 * @returns True if image exists
 */
export async function imageExists(storagePath: string): Promise<boolean> {
  try {
    const bucket = getJournalMediaBucket();
    const { data, error } = await bucket.list(
      storagePath.substring(0, storagePath.lastIndexOf('/'))
    );

    if (error) {
      return false;
    }

    const filename = storagePath.substring(storagePath.lastIndexOf('/') + 1);
    return data.some((file) => file.name === filename);
  } catch {
    return false;
  }
}

/**
 * Get file extension from URI or filename
 * @param uri - File URI or filename
 * @returns File extension (e.g., 'jpg', 'png')
 */
function getFileExtension(uri: string): string {
  const match = uri.match(/\.(\w+)(?:\?|$)/);
  if (match) {
    return match[1].toLowerCase();
  }

  // Default to jpg if no extension found
  return 'jpg';
}

/**
 * Get content type for file extension
 * @param extension - File extension
 * @returns MIME content type
 */
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    heic: 'image/heic',
    heif: 'image/heif',
  };

  return contentTypes[extension.toLowerCase()] || 'image/jpeg';
}

/**
 * Validate image file size
 * @param imageUri - Local file URI
 * @returns True if file size is within limits
 */
export async function validateImageSize(imageUri: string): Promise<boolean> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);

    if (!fileInfo.exists) {
      return false;
    }

    // Check if size property exists (it should for existing files)
    if ('size' in fileInfo && typeof fileInfo.size === 'number') {
      const maxSizeBytes = CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024;
      return fileInfo.size <= maxSizeBytes;
    }

    return true; // Allow if we can't determine size
  } catch {
    return false;
  }
}
