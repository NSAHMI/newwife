/**
 * Supabase Service Initialization
 * Initializes Supabase client for media storage operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CONFIG } from '../constants/config';

/**
 * Supabase configuration
 * All values are loaded from environment variables with EXPO_PUBLIC_ prefix
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Supabase client instance
 * Configured with auto-refresh tokens and persistent sessions
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Check if Supabase is properly configured
 * @returns boolean indicating if Supabase has valid configuration
 */
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

/**
 * Get the current Supabase configuration status
 * Useful for debugging and displaying setup status
 */
export function getSupabaseStatus(): {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  bucketName: string;
} {
  return {
    isConfigured: isSupabaseConfigured(),
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    bucketName: CONFIG.SUPABASE_BUCKET,
  };
}

/**
 * Get the storage bucket reference for journal media
 * @returns Supabase storage bucket instance
 */
export function getJournalMediaBucket() {
  return supabase.storage.from(CONFIG.SUPABASE_BUCKET);
}

// Log initialization status
if (isSupabaseConfigured()) {
  console.log('Supabase client initialized successfully');
} else {
  console.warn(
    'Supabase configuration is incomplete. Please check your environment variables.'
  );
}
