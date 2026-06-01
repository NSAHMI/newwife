import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { CONFIG } from '../constants/config';

const BUCKET_NAME = 'journal-media';

export async function uploadImage(
  userId: string,
  entryId: string,
  imageUri: string
): Promise<{ publicUrl: string; storagePath: string }> {
  const filename = imageUri.split('/').pop() || `image_${Date.now()}.jpg`;
  const storagePath = `${userId}/${entryId}/${filename}`;

  const fileContent = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binaryString = atob(fileContent);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: urlData, error: urlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, CONFIG.SIGNED_URL_EXPIRY_SECONDS);

  if (urlError) throw urlError;

  return {
    publicUrl: urlData.signedUrl,
    storagePath,
  };
}

export async function deleteImage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) throw error;
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, CONFIG.SIGNED_URL_EXPIRY_SECONDS);

  if (error) throw error;
  return data.signedUrl;
}
