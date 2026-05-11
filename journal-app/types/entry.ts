/**
 * Entry Type Definitions
 * Contains all TypeScript interfaces for journal entries
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Mood type representing the emotional state of an entry
 */
export type Mood = 'happy' | 'calm' | 'sad' | 'angry' | 'anxious' | 'grateful';

/**
 * Array of all available moods for iteration
 */
export const MOODS: Mood[] = ['happy', 'calm', 'sad', 'angry', 'anxious', 'grateful'];

/**
 * Configuration for a single mood option
 */
export interface MoodConfig {
  /** Display label for the mood */
  label: string;
  /** Emoji representing the mood */
  emoji: string;
  /** Color associated with the mood */
  color: string;
}

/**
 * Journal Entry interface
 * Represents a single journal entry in Firestore
 */
export interface Entry {
  /** Firestore document ID */
  id: string;
  /** Anonymous or authenticated user ID */
  userId: string;
  /** Short title (max 80 chars) */
  title: string;
  /** Rich text or markdown body content */
  body: string;
  /** Emotional state when writing the entry */
  mood: Mood;
  /** Supabase public/signed URL for the attached image, or null */
  imageUrl: string | null;
  /** Supabase storage path for the image (used for deletion), or null */
  imagePath: string | null;
  /** Firestore server timestamp when entry was created */
  createdAt: Timestamp;
  /** Firestore server timestamp when entry was last updated */
  updatedAt: Timestamp;
  /** Date in "YYYY-MM-DD" format for calendar grouping */
  dateKey: string;
  /** User-defined tags (optional, max 5) */
  tags: string[];
  /** Auto-calculated word count of the body */
  wordCount: number;
}

/**
 * Data required to create a new entry
 * Omits auto-generated fields
 */
export interface CreateEntryData {
  title: string;
  body: string;
  mood: Mood;
  imageUrl?: string | null;
  imagePath?: string | null;
  tags?: string[];
}

/**
 * Data for updating an existing entry
 * All fields are optional
 */
export interface UpdateEntryData {
  title?: string;
  body?: string;
  mood?: Mood;
  imageUrl?: string | null;
  imagePath?: string | null;
  tags?: string[];
}

/**
 * Section data structure for SectionList component
 * Groups entries by month
 */
export interface EntrySection {
  /** Display title (e.g., "May 2026" or "Today") */
  title: string;
  /** Month key in "YYYY-MM" format for indexing */
  monthKey: string;
  /** Array of entries in this section */
  data: Entry[];
}

/**
 * Draft entry saved to SecureStore
 * Used for recovering unsaved entries
 */
export interface DraftEntry {
  title: string;
  body: string;
  mood: Mood;
  tags: string[];
  imageUri?: string;
  savedAt: number;
}

/**
 * Calendar marked date configuration
 * Used with react-native-calendars
 */
export interface MarkedDate {
  marked: boolean;
  dotColor: string;
  selected?: boolean;
  selectedColor?: string;
}

/**
 * Record of marked dates for the calendar
 */
export type MarkedDates = Record<string, MarkedDate>;

/**
 * Entry with signed URL
 * Used when displaying entries with images
 */
export interface EntryWithSignedUrl extends Omit<Entry, 'imageUrl'> {
  imageUrl: string | null;
  signedImageUrl?: string | null;
}
