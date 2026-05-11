/**
 * Application Configuration Constants
 * Contains all app-level configuration values
 */

export const CONFIG = {
  /**
   * Time in milliseconds before the app re-locks when in background
   * Default: 30 seconds
   */
  RE_LOCK_TIMEOUT_MS: 30000,

  /**
   * Maximum allowed image size for uploads in megabytes
   */
  MAX_IMAGE_SIZE_MB: 5,

  /**
   * Maximum character length for entry titles
   */
  MAX_TITLE_LENGTH: 80,

  /**
   * Maximum number of tags allowed per entry
   */
  MAX_TAGS: 5,

  /**
   * Expiry time for Supabase signed URLs in seconds
   * Default: 1 hour
   */
  SIGNED_URL_EXPIRY_SECONDS: 3600,

  /**
   * Minimum character length for entry body
   */
  MIN_BODY_LENGTH: 10,

  /**
   * Maximum number of entries to display initially before pagination
   */
  ENTRIES_PAGE_SIZE: 20,

  /**
   * Image quality for compression (0-1)
   */
  IMAGE_QUALITY: 0.8,

  /**
   * Maximum width for uploaded images in pixels
   */
  MAX_IMAGE_WIDTH: 1200,

  /**
   * Supabase storage bucket name
   */
  SUPABASE_BUCKET: 'journal-media',

  /**
   * Firestore collection name for entries
   */
  FIRESTORE_ENTRIES_COLLECTION: 'entries',

  /**
   * Default re-lock timeout in milliseconds
   */
  DEFAULT_RE_LOCK_TIMEOUT: 30000,

  /**
   * SecureStore keys
   */
  SECURE_STORE_KEYS: {
    USER_ID: 'journal_user_id',
    DRAFT_ENTRY: 'draft_entry',
    RE_LOCK_TIMEOUT: 're_lock_timeout',
    LAST_ACTIVE: 'last_active_timestamp',
    SHOW_MOOD_IN_LIST: 'show_mood_in_list',
  },

  /**
   * Re-lock timeout options (in milliseconds)
   */
  RE_LOCK_OPTIONS: [
    { label: '15 seconds', value: 15000 },
    { label: '30 seconds', value: 30000 },
    { label: '1 minute', value: 60000 },
    { label: '5 minutes', value: 300000 },
  ],
} as const;

/**
 * Type for the CONFIG object
 */
export type AppConfig = typeof CONFIG;

/**
 * Shorthand for storage keys
 */
export const STORAGE_KEYS = CONFIG.SECURE_STORE_KEYS;
